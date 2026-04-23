import { prisma } from "../../shared/infra/prisma.js";

export class AuthRepository {
  findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, email: true, fullName: true, role: true, emailVerified: true, totpSecret: true, totpEnabledAt: true, password: true },
    });
  }

  findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { loginHistories: { select: { userAgentHash: true } } },
    });
  }

  createUser(input: { email: string; password: string; fullName: string }) {
    return prisma.user.create({
      data: {
        email: input.email,
        password: input.password,
        fullName: input.fullName,
        emailVerified: false,
      },
    });
  }

  async hasKnownUserAgent(userId: string, userAgentHash: string): Promise<boolean> {
    const count = await prisma.userLoginHistory.count({
      where: { userId, userAgentHash },
    });
    return count > 0;
  }

  async recordLogin(params: {
    userId: string;
    ip: string | null;
    userAgentHash: string;
    userAgent: string | null;
    city?: string | null;
    country?: string | null;
  }) {
    const existing = await prisma.userLoginHistory.findFirst({
      where: { userId: params.userId, userAgentHash: params.userAgentHash },
    });
    const now = new Date();
    if (existing) {
      await prisma.userLoginHistory.update({
        where: { id: existing.id },
        data: { lastSeenAt: now, ip: params.ip, userAgent: params.userAgent, city: params.city, country: params.country },
      });
    } else {
      await prisma.userLoginHistory.create({
        data: {
          userId: params.userId,
          ip: params.ip,
          userAgentHash: params.userAgentHash,
          userAgent: params.userAgent,
          city: params.city,
          country: params.country,
          firstSeenAt: now,
          lastSeenAt: now,
        },
      });
    }
  }

  async updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash },
    });
  }
}

export const authRepository = new AuthRepository();
