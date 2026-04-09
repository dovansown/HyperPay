import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/http-response.js";
import { notificationsService } from "./notifications.service.js";
import type { ListNotificationsQuery } from "./notifications.schema.js";

export class NotificationsController {
  async list(req: Request, res: Response) {
    const data = await notificationsService.list(req.user!.userId, req.query as unknown as ListNotificationsQuery);
    return sendSuccess(res, data);
  }

  async markRead(req: Request, res: Response) {
    const data = await notificationsService.markRead(req.user!.userId, String(req.params.notificationId));
    return sendSuccess(res, data);
  }

  async markAllRead(req: Request, res: Response) {
    const data = await notificationsService.markAllRead(req.user!.userId);
    return sendSuccess(res, data);
  }
}

export const notificationsController = new NotificationsController();

