import crypto from "node:crypto";
import { prisma } from "../../shared/infra/prisma.js";
import { AppError, ErrorCodes } from "../../shared/http/app-error.js";

const BACKUP_CODE_COUNT = 6;
const BACKUP_CODE_LENGTH = 8;

function hashBackupCode(code: string): string {
  return crypto.createHash("sha256").update("hyperpay-backup-" + code).digest("hex");
}

function generateBackupCodes(): string[] {
  const codes: string[] = [];
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    let s = "";
    for (let j = 0; j < BACKUP_CODE_LENGTH; j++) {
      s += chars[crypto.randomInt(0, chars.length)];
    }
    codes.push(s.slice(0, 4) + "-" + s.slice(4)); // XXXX-XXXX format
  }
  return codes;
}

function buildOtpAuthUri(secret: string, email: string): string {
  const label = encodeURIComponent("HyperPay:" + email);
  return `otpauth://totp/${label}?secret=${secret}&issuer=HyperPay`;
}

export class TotpService {
  async getSetupState(userId: string): Promise<{ secret: string; qrUrl: string } | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, totpSecret: true, totpEnabledAt: true },
    });
    if (!user) return null;
    if (user.totpEnabledAt) return null;
    const { authenticator } = await import("otplib");
    let secret = user.totpSecret;
    if (!secret) {
      secret = authenticator.generateSecret();
      await prisma.user.update({
        where: { id: userId },
        data: { totpSecret: secret, totpEnabledAt: null },
      });
    }
    const qrUrl = buildOtpAuthUri(secret, user.email);
    return { secret, qrUrl };
  }

  async enableTOTP(userId: string, code: string): Promise<{ backupCodes: string[] }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totpSecret: true },
    });
    if (!user?.totpSecret) {
      throw new AppError(400, ErrorCodes.INVALID_REQUEST, "2FA setup not started. Get setup state first.");
    }
    const { authenticator } = await import("otplib");
    const token = code.replace(/\D/g, "").slice(0, 6);
    let isValid = false;
    try {
      isValid = authenticator.check(token, user.totpSecret);
    } catch {
      isValid = false;
    }
    if (!isValid) {
      throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Invalid verification code");
    }
    const backupCodes = generateBackupCodes();
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { totpEnabledAt: new Date() },
      }),
      ...backupCodes.map((code) =>
        prisma.userBackupCode.create({
          data: { userId, codeHash: hashBackupCode(code.replace(/-/g, "")) },
        })
      ),
    ]);
    return { backupCodes };
  }

  async verifyTOTP(userId: string, code: string): Promise<boolean> {
    const normalized = code.replace(/\D/g, "").trim();
    if (normalized.length === 6) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { totpSecret: true },
      });
      if (!user?.totpSecret) return false;
      const { authenticator } = await import("otplib");
      try {
        return authenticator.check(normalized, user.totpSecret);
      } catch {
        return false;
      }
    }
    const backupNormalized = code.replace(/-/g, "").toUpperCase();
    if (backupNormalized.length >= 8) {
      const hash = hashBackupCode(backupNormalized);
      const backup = await prisma.userBackupCode.findFirst({
        where: { userId, codeHash: hash, usedAt: null },
      });
      if (!backup) return false;
      await prisma.userBackupCode.update({
        where: { id: backup.id },
        data: { usedAt: new Date() },
      });
      return true;
    }
    return false;
  }

  async disableTOTP(userId: string): Promise<void> {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { totpSecret: null, totpEnabledAt: null },
      }),
      prisma.userBackupCode.deleteMany({ where: { userId } }),
    ]);
  }
}

export const totpService = new TotpService();
