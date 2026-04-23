import { prisma } from "../../shared/infra/prisma.js";

export class UsersRepository {
  findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        password: true,
        emailVerified: true,
        totpEnabledAt: true,
      },
    });
  }

  async updateProfile(
    userId: string,
    data: { full_name?: string }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: { fullName: data.full_name },
      select: { id: true, email: true, fullName: true, role: true, emailVerified: true },
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash },
    });
  }

  async getLoginHistory(userId: string) {
    return prisma.userLoginHistory.findMany({
      where: { userId },
      orderBy: { lastSeenAt: "desc" },
      take: 50,
      select: {
        id: true,
        ip: true,
        userAgent: true,
        city: true,
        country: true,
        lastSeenAt: true,
      },
    });
  }

  async getTrustedDevices(userId: string) {
    // Group by userAgentHash and get first/last seen
    const devices = await prisma.userLoginHistory.groupBy({
      by: ["userAgentHash"],
      where: { userId },
      _max: { lastSeenAt: true },
      _min: { lastSeenAt: true },
    });

    // Get userAgent for each device
    const deviceDetails = await Promise.all(
      devices.map(async (d) => {
        const record = await prisma.userLoginHistory.findFirst({
          where: { userId, userAgentHash: d.userAgentHash },
          select: { userAgent: true },
        });
        return {
          userAgentHash: d.userAgentHash,
          userAgent: record?.userAgent || null,
          lastSeenAt: d._max.lastSeenAt!,
          firstSeenAt: d._min.lastSeenAt!,
        };
      })
    );

    return deviceDetails;
  }

  async removeTrustedDevice(userId: string, userAgentHash: string) {
    await prisma.userLoginHistory.deleteMany({
      where: { userId, userAgentHash },
    });
  }

  async getNotificationSettings(userId: string) {
    return prisma.userNotificationSettings.findUnique({
      where: { userId },
    });
  }

  async updateNotificationSettings(
    userId: string,
    data: {
      success?: boolean;
      failed?: boolean;
      dispute?: boolean;
      payout?: boolean;
      newMember?: boolean;
      loginAlerts?: boolean;
    }
  ) {
    return prisma.userNotificationSettings.upsert({
      where: { userId },
      create: {
        userId,
        success: data.success ?? true,
        failed: data.failed ?? true,
        dispute: data.dispute ?? true,
        payout: data.payout ?? false,
        newMember: data.newMember ?? true,
        loginAlerts: data.loginAlerts ?? true,
      },
      update: data,
    });
  }
}

export const usersRepository = new UsersRepository();
