import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/http-response.js";
import { webhooksService } from "./webhooks.service.js";

export class WebhooksController {
  async get(req: Request, res: Response) {
    const data = await webhooksService.get(req.user!.userId);
    return sendSuccess(res, data);
  }

  async upsert(req: Request, res: Response) {
    const data = await webhooksService.upsert(req.user!.userId, req.body);
    return sendSuccess(res, data);
  }
}

export const webhooksController = new WebhooksController();
