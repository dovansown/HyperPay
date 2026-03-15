import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/http-response.js";
import { webhooksService } from "./webhooks.service.js";

export class WebhooksController {
  async get(req: Request, res: Response) {
    const data = await webhooksService.get(req.user!.userId);
    return sendSuccess(res, data);
  }

  async create(req: Request, res: Response) {
    const data = await webhooksService.create(req.user!.userId, req.body);
    return sendSuccess(res, data);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const data = await webhooksService.update(req.user!.userId, id, req.body);
    return sendSuccess(res, data);
  }

  async sendTest(req: Request, res: Response) {
    const webhookId = (req.body as { webhook_id?: string } | undefined)?.webhook_id;
    const data = await webhooksService.sendTestEvent(req.user!.userId, webhookId);
    return sendSuccess(res, data);
  }

  async getLogs(req: Request, res: Response) {
    const userId = req.user!.userId;
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const data = await webhooksService.getDeliveryLogs(userId, limit);
    return sendSuccess(res, data);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const data = await webhooksService.remove(req.user!.userId, id);
    return sendSuccess(res, data);
  }
}

export const webhooksController = new WebhooksController();
