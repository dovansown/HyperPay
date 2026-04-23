import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/http-response.js";
import { accountsService } from "./accounts.service.js";

export class AccountsController {
  async create(req: Request, res: Response) {
    const data = await accountsService.create(req.user!.userId, req.body);
    return sendSuccess(res, data, 201);
  }

  async list(req: Request, res: Response) {
    const data = await accountsService.list(req.user!.userId);
    return sendSuccess(res, data);
  }

  async refreshToken(req: Request, res: Response) {
    const data = await accountsService.refreshToken(req.user!.userId, String(req.params.accountId));
    return sendSuccess(res, data);
  }

  async update(req: Request, res: Response) {
    const data = await accountsService.update(
      req.user!.userId,
      String(req.params.accountId),
      req.body
    );
    return sendSuccess(res, data);
  }

  async remove(req: Request, res: Response) {
    const data = await accountsService.remove(req.user!.userId, String(req.params.accountId));
    return sendSuccess(res, data);
  }
}

export const accountsController = new AccountsController();
