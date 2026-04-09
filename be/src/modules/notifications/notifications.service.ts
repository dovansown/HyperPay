import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { notificationsRepository } from "./notifications.repository.js";
import type { ListNotificationsQuery } from "./notifications.schema.js";

export class NotificationsService {
  async list(userId: string, query: ListNotificationsQuery) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;
    const { items, total, unreadCount } = await notificationsRepository.list(userId, {
      unreadOnly: query.unread_only,
      skip,
      take,
    });

    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
      unread_count: unreadCount,
    };
  }

  async markRead(userId: string, notificationId: string) {
    const res = await notificationsRepository.markRead(userId, notificationId);
    if (res.count === 0) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Notification not found");
    }
    return { success: true };
  }

  async markAllRead(userId: string) {
    const res = await notificationsRepository.markAllRead(userId);
    return { success: true, updated: res.count };
  }
}

export const notificationsService = new NotificationsService();

