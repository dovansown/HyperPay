import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/http-response.js";
import { banksService } from "./banks.service.js";

export class BanksController {
  async create(req: Request, res: Response) {
    const data = await banksService.create(req.body);
    return sendSuccess(res, data, 201);
  }

  async list(_req: Request, res: Response) {
    const data = await banksService.list();
    return sendSuccess(res, data);
  }
}

export const banksController = new BanksController();
