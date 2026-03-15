import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { redisClient } from "../../shared/infra/redis.js";
import { systemSettingsService } from "../system-settings/system-settings.service.js";

const LOGIN_PREFIX = "rl:login:";
const EMAIL_PREFIX = "rl:email:";

export class RateLimitService {
  private async getConfig() {
    return systemSettingsService.getRateLimitConfig();
  }

  /** Call before accepting login. Throws if already over limit. */
  async checkLoginAttempts(email: string): Promise<{ allowed: boolean; remaining: number }> {
    const config = await this.getConfig();
    const key = `${LOGIN_PREFIX}${email.toLowerCase().trim()}`;
    const count = await redisClient.get(key);
    const current = parseInt(count ?? "0", 10);
    const remaining = Math.max(0, config.loginAttempts - current);
    if (current >= config.loginAttempts) {
      throw new AppError(429, ErrorCodes.RATE_LIMIT, "Too many login attempts. Try again later.");
    }
    return { allowed: true, remaining };
  }

  /** Call after failed login (wrong password) to increment. */
  async recordFailedLogin(email: string): Promise<void> {
    const config = await this.getConfig();
    const key = `${LOGIN_PREFIX}${email.toLowerCase().trim()}`;
    const multi = redisClient.multi();
    multi.incr(key);
    multi.expire(key, config.loginWindowSeconds);
    await multi.exec();
  }

  /** Reset login rate limit for email (e.g. after successful login). */
  async resetLoginAttempts(email: string): Promise<void> {
    await redisClient.del(`${LOGIN_PREFIX}${email.toLowerCase().trim()}`);
  }

  /** Check if we can send another email to this user this hour. Call before enqueue. */
  async checkEmailRateLimit(userId: string): Promise<{ allowed: boolean }> {
    const config = await this.getConfig();
    const key = `${EMAIL_PREFIX}${userId}`;
    const count = await redisClient.get(key);
    const n = parseInt(count ?? "0", 10);
    if (n >= config.emailPerUserPerHour) {
      throw new AppError(429, ErrorCodes.RATE_LIMIT, "Email rate limit exceeded. Try again later.");
    }
    return { allowed: true };
  }

  /** Increment email count for user (call from email worker after send). */
  async incrementEmailCount(userId: string): Promise<void> {
    const key = `${EMAIL_PREFIX}${userId}`;
    const config = await this.getConfig();
    const multi = redisClient.multi();
    multi.incr(key);
    multi.expire(key, 3600); // 1 hour
    await multi.exec();
  }
}

export const rateLimitService = new RateLimitService();
