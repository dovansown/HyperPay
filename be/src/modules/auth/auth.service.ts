import { VerificationCodeType } from "@prisma/client";
import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { env } from "../../shared/config/env.js";
import { hashPassword, verifyPassword } from "../../shared/utils/password.js";
import { signAccessToken, signTemp2FAToken, verifyTemp2FAToken } from "../../shared/utils/jwt.js";
import crypto from "node:crypto";
import { authRepository } from "./auth.repository.js";
import { packagesService } from "../packages/packages.service.js";
import { rateLimitService } from "../rate-limit/rate-limit.service.js";
import { systemSettingsService } from "../system-settings/system-settings.service.js";
import { verificationService } from "../verification/verification.service.js";
import { enqueueEmail } from "../email/email.queue.js";
import { cacheService } from "../cache/cache.service.js";
import type { ForgotPasswordInput, LoginInput, RegisterInput } from "./auth.schema.js";

function hashUserAgent(ua: string): string {
  return crypto.createHash("sha256").update(ua || "").digest("hex").slice(0, 64);
}

export interface LoginMeta {
  ip: string | null;
  userAgent: string | null;
}

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError(409, ErrorCodes.CONFLICT, "Email already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUser({
      email: input.email,
      password: passwordHash,
      fullName: input.full_name,
    });
    const defaultPackage = await packagesService.assignDefaultPackageForUser(user.id);

    const { code, verificationId, expiresAt } = await verificationService.createCode(
      user.id,
      VerificationCodeType.EMAIL_VERIFY
    );
    const verifyLink = `${env.FRONTEND_ORIGIN}/verify?verification_id=${verificationId}&type=email`;
    await enqueueEmail({
      to: user.email,
      subject: "Verify your email - HyperPay",
      template: "code_verify_email",
      data: {
        code,
        verifyLink,
        expiresMinutes: "15",
      },
      userId: user.id,
    });

    const token = signAccessToken({ sub: String(user.id), email: user.email, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName ?? "",
        role: user.role,
        email_verified: false,
      },
      package: defaultPackage,
    };
  }

  async login(input: LoginInput, meta: LoginMeta) {
    await rateLimitService.checkLoginAttempts(input.email);

    const user = await authRepository.findByEmail(input.email);
    if (!user) {
      await rateLimitService.recordFailedLogin(input.email);
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid email or password");
    }

    const isValidPassword = await verifyPassword(user.password, input.password);
    if (!isValidPassword) {
      await rateLimitService.recordFailedLogin(input.email);
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid email or password");
    }

    rateLimitService.resetLoginAttempts(input.email);

    const uaHash = hashUserAgent(meta.userAgent ?? "");
    const knownDevice = await authRepository.hasKnownUserAgent(user.id, uaHash);

    if (user.totpSecret && user.totpEnabledAt) {
      const tempToken = signTemp2FAToken(user.id);
      return {
        needs_2fa: true,
        temp_token: tempToken,
        user_id: user.id,
      };
    }

    if (!knownDevice) {
      const alertLevel = await systemSettingsService.getAlertLevel();
      const time = new Date().toISOString();
      const location = "Unknown";
      const device = (meta.userAgent ?? "Unknown").slice(0, 100);

      if (alertLevel === "require_verify") {
        const { code, verificationId } = await verificationService.createCode(
          user.id,
          VerificationCodeType.LOGIN_VERIFY,
          { ip: meta.ip, userAgent: meta.userAgent ?? undefined }
        );
        const verifyLink = `${env.FRONTEND_ORIGIN}/verify?verification_id=${verificationId}&type=login`;
        await enqueueEmail({
          to: user.email,
          subject: "New login - Verify your identity - HyperPay",
          template: "warning_email",
          data: {
            time,
            location,
            ip: meta.ip ?? "—",
            device,
            verifyLink,
          },
          userId: user.id,
        });
        return {
          needs_login_verify: true,
          verification_id: verificationId,
          message: "Verification code sent to your email.",
        };
      }

      await enqueueEmail({
        to: user.email,
        subject: "New login to your HyperPay account",
        template: "warning_email",
        data: {
          time,
          location,
          ip: meta.ip ?? "—",
          device,
          verifyLink: "",
        },
        userId: user.id,
      });
    }

    await authRepository.recordLogin({
      userId: user.id,
      ip: meta.ip,
      userAgentHash: uaHash,
      userAgent: meta.userAgent,
    });

    const token = signAccessToken({ sub: String(user.id), email: user.email, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName ?? "",
        role: user.role,
        email_verified: user.emailVerified,
      },
    };
  }

  async verifyCodeAndIssueToken(verificationId: string, code: string, type: "email" | "login") {
    const codeType = type === "email" ? VerificationCodeType.EMAIL_VERIFY : VerificationCodeType.LOGIN_VERIFY;
    const { userId } = await verificationService.verifyCode(verificationId, code, codeType);
    const userFound = await authRepository.findById(userId);
    if (!userFound) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found");
    }
    if (type === "email") {
      const { prisma } = await import("../../shared/infra/prisma.js");
      await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true, emailVerificationToken: null, emailVerificationExpiresAt: null },
      });
    }
    if (type === "login") {
      const meta = await verificationService.getVerificationMetadata(verificationId);
      const ua = meta?.userAgent ?? "";
      const uaHash = hashUserAgent(ua);
      await authRepository.recordLogin({
        userId,
        ip: meta?.ip ?? null,
        userAgentHash: uaHash,
        userAgent: ua || null,
      });
    }
    await cacheService.del(`user:${userId}`);
    const token = signAccessToken({
      sub: userFound.id,
      email: userFound.email,
      role: userFound.role,
    });
    return {
      token,
      user: {
        id: userFound.id,
        email: userFound.email,
        full_name: userFound.fullName ?? "",
        role: userFound.role,
        email_verified: type === "email" ? true : userFound.emailVerified,
      },
    };
  }

  async verify2FA(tempToken: string, code: string) {
    const { sub: userId } = verifyTemp2FAToken(tempToken);
    const { totpService } = await import("../users/totp.service.js");
    const valid = await totpService.verifyTOTP(userId, code);
    if (!valid) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid verification code");
    }
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found");
    }
    const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName ?? "",
        role: user.role,
        email_verified: user.emailVerified,
      },
    };
  }

  async forgotPassword(_input: ForgotPasswordInput) {
    return { accepted: true };
  }
}

export const authService = new AuthService();
