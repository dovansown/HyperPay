import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/http-response.js";
import { dashboardService } from "./dashboard.service.js";

export class DashboardController {
  async get(req: Request, res: Response) {
    const userId = req.user!.userId;
    const period = (req.query.period === "30" ? 30 : 7) as 7 | 30;
    const data = await dashboardService.getDashboard(userId, period);
    return sendSuccess(res, data);
  }
}

export const dashboardController = new DashboardController();
