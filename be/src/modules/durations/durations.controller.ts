import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/http-response.js";
import { durationsService } from "./durations.service.js";

export class DurationsController {
  async list(_req: Request, res: Response) {
    const data = await durationsService.list();
    return sendSuccess(res, data);
  }
}

export const durationsController = new DurationsController();
