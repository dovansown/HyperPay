import { VerificationCodeType } from "@prisma/client";
import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { env } from "../../shared/config/env.js";
import { hashPassword, verifyPassword } from "../../shared/utils/password.js";
import { usersRepository } from "./users.repository.js";
import { verificationService } from "../verification/verification.service.js";
import { rateLimitService } from "../rate-limit/rate-limit.service.js";
import { enqueueEmail } from "../email/email.queue.js";
import { totpService } from "./totp.service.js";
import { cacheService } from "../cache/cache.service.js";

type UserProfileDto = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  email_verified: boolean;
  totp_enabled: boolean;
};

export class UsersService {
  async getProfile(userId: string) {
    const cacheKey = `user:${userId}`;
    const cached = await cacheService.get<UserProfileDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await usersRepository.findById(userId);
    if (!user) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found");
    }
    const dto: UserProfileDto = {
      id: user.id,
      email: user.email,
      full_name: user.fullName ?? "",
      role: user.role,
      email_verified: user.emailVerified ?? false,
      totp_enabled: !!(user as { totpEnabledAt?: Date | null }).totpEnabledAt,
    };
    await cacheService.set(cacheKey, dto);
    return dto;
  }

  async updateProfile(userId: string, data: { full_name?: string }) {
    const updated = await usersRepository.updateProfile(userId, data);
    if (!updated) throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found");
    const dto: UserProfileDto = {
      id: updated.id,
      email: updated.email,
      full_name: updated.fullName ?? "",
      role: updated.role,
      email_verified: updated.emailVerified ?? false,
      totp_enabled: !!(updated as { totpEnabledAt?: Date | null }).totpEnabledAt,
    };
    await cacheService.del(`user:${userId}`);
    return dto;
  }

  async checkChangePassword(
    userId: string,
    payload: { current_password: string; new_password: string }
  ) {
    const user = await usersRepository.findById(userId);
    if (!user) throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found");

    const valid = await verifyPassword(user.password, payload.current_password);
    if (!valid) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Current password is incorrect");
    }

    if (payload.new_password.length < 6) {
      throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Password must be at least 6 characters");
    }

    return { valid: true };
  }

  async sendChangePasswordCode(userId: string) {
    await rateLimitService.checkEmailRateLimit(userId);
    const user = await usersRepository.findById(userId);
    if (!user) throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found");
    const { code, verificationId, expiresAt } = await verificationService.createCode(
      userId,
      VerificationCodeType.CHANGE_PASSWORD
    );
    const verifyLink = `${env.FRONTEND_ORIGIN}/verify?verification_id=${verificationId}&type=change_password`;
    await enqueueEmail({
      to: user.email,
      subject: "Change password - Verification code - HyperPay",
      template: "code_verify_email",
      data: { code, verifyLink, expiresMinutes: "15" },
      userId,
    });
    return { verification_id: verificationId, expires_at: expiresAt };
  }

  async changePassword(
    userId: string,
    payload: { verification_id: string; code: string; current_password: string; new_password: string }
  ) {
    const user = await usersRepository.findById(userId);
    if (!user) throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found");
    const valid = await verifyPassword(user.password, payload.current_password);
    if (!valid) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Current password is incorrect");
    }
    await verificationService.verifyCode(
      payload.verification_id,
      payload.code,
      VerificationCodeType.CHANGE_PASSWORD
    );
    const newHash = await hashPassword(payload.new_password);
    await usersRepository.updatePassword(userId, newHash);
    await cacheService.del(`user:${userId}`);
    return { success: true };
  }

  async sendVerifyEmailCode(userId: string) {
    await rateLimitService.checkEmailRateLimit(userId);
    const user = await usersRepository.findById(userId);
    if (!user) throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found");
    if (user.emailVerified) {
      throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Email already verified");
    }
    const { code, verificationId } = await verificationService.createCode(
      userId,
      VerificationCodeType.EMAIL_VERIFY
    );
    const verifyLink = `${env.FRONTEND_ORIGIN}/verify?verification_id=${verificationId}&type=email`;
    await enqueueEmail({
      to: user.email,
      subject: "Verify your email - HyperPay",
      template: "code_verify_email",
      data: { code, verifyLink, expiresMinutes: "15" },
      userId,
    });
    return { verification_id: verificationId };
  }

  async get2FASetup(userId: string) {
    return totpService.getSetupState(userId);
  }

  async enable2FA(userId: string, code: string) {
    const result = await totpService.enableTOTP(userId, code);
    await cacheService.del(`user:${userId}`);
    return result;
  }

  async disable2FA(userId: string) {
    await totpService.disableTOTP(userId);
    await cacheService.del(`user:${userId}`);
    return { success: true };
  }
}

export const usersService = new UsersService();
