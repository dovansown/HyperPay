import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/http-response.js";
import { healthService } from "./health.service.js";

export class HealthController {
  async check(_req: Request, res: Response) {
    const data = await healthService.check();
    return sendSuccess(res, data);
  }
}

export const healthController = new HealthController();
