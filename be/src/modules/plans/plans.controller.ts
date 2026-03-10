import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/http-response.js";
import { plansService } from "./plans.service.js";

export class PlansController {
  async create(req: Request, res: Response) {
    const data = await plansService.create(req.body);
    return sendSuccess(res, data, 201);
  }

  async list(_req: Request, res: Response) {
    const data = await plansService.list();
    return sendSuccess(res, data);
  }
}

export const plansController = new PlansController();
