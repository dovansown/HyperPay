import { prisma } from "../../shared/infra/prisma.js";
import type { Prisma } from "@prisma/client";

export class NotificationsRepository {
  async list(userId: string, opts: { unreadOnly?: boolean; skip: number; take: number }) {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(opts.unreadOnly ? { readAt: null } : null),
    };

    const [items, total, unreadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: opts.skip,
        take: opts.take,
        select: {
          id: true,
          type: true,
          title: true,
          body: true,
          data: true,
          readAt: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ]);

    return { items, total, unreadCount };
  }

  async markRead(userId: string, notificationId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}

export const notificationsRepository = new NotificationsRepository();

