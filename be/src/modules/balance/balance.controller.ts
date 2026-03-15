import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/http-response.js";
import { balanceService } from "./balance.service.js";

export class BalanceController {
  async get(req: Request, res: Response) {
    const userId = req.user!.userId;
    const balanceVnd = await balanceService.getBalance(userId);
    return sendSuccess(res, { balance_vnd: balanceVnd });
  }

  async topUp(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { amount_vnd } = req.body as { amount_vnd: number };
    const balanceVnd = await balanceService.topUp(userId, amount_vnd);
    return sendSuccess(res, { balance_vnd: balanceVnd });
  }
}

export const balanceController = new BalanceController();
