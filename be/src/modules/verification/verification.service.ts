import { type Prisma, VerificationCodeType } from "@prisma/client";
import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { prisma } from "../../shared/infra/prisma.js";
import { generateSixDigitCode, hashVerificationCode } from "../../shared/utils/code-hash.js";

const CODE_EXPIRY_MINUTES = 15;

export class VerificationService {
  async createCode(
    userId: string,
    type: VerificationCodeType,
    metadata?: Record<string, unknown>
  ): Promise<{ code: string; verificationId: string; expiresAt: Date }> {
    const code = generateSixDigitCode();
    const codeHash = hashVerificationCode(code);
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);
    const record = await prisma.verificationCode.create({
      data: {
        userId,
        type,
        codeHash,
        expiresAt,
        metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
      },
    });
    return { code, verificationId: record.id, expiresAt };
  }

  async verifyCode(
    verificationId: string,
    code: string,
    type: VerificationCodeType
  ): Promise<{ userId: string }> {
    const normalized = code.replace(/\D/g, "").slice(0, 6);
    if (normalized.length !== 6) {
      throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Invalid verification code");
    }
    const record = await prisma.verificationCode.findFirst({
      where: { id: verificationId, type, usedAt: null },
      include: { user: { select: { id: true } } },
    });
    if (!record) {
      throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Invalid or expired verification");
    }
    if (new Date() > record.expiresAt) {
      throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Verification code expired");
    }
    const hash = hashVerificationCode(normalized);
    if (hash !== record.codeHash) {
      throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Invalid verification code");
    }
    await prisma.verificationCode.update({
      where: { id: verificationId },
      data: { usedAt: new Date() },
    });
    return { userId: record.user.id };
  }

  async getVerificationUserId(verificationId: string): Promise<string | null> {
    const record = await prisma.verificationCode.findUnique({
      where: { id: verificationId },
      select: { userId: true, usedAt: true, expiresAt: true },
    });
    if (!record || record.usedAt || new Date() > record.expiresAt) return null;
    return record.userId;
  }

  async getVerificationMetadata(verificationId: string): Promise<{ ip?: string; userAgent?: string } | null> {
    const record = await prisma.verificationCode.findUnique({
      where: { id: verificationId },
      select: { metadata: true },
    });
    const meta = record?.metadata as { ip?: string; userAgent?: string } | null;
    return meta ?? null;
  }
}

export const verificationService = new VerificationService();
