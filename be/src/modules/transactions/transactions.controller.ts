import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/http-response.js";
import { transactionsService } from "./transactions.service.js";

export class TransactionsController {
  async listByAccount(req: Request, res: Response) {
    const data = await transactionsService.listByAccountId(Number(req.params.accountId), req.user!.userId);
    return sendSuccess(res, data);
  }

  async listByToken(req: Request, res: Response) {
    const data = await transactionsService.listByToken(String(req.params.token));
    return sendSuccess(res, data);
  }
}

export const transactionsController = new TransactionsController();
