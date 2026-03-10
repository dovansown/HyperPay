import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/http-response.js";
import { usersService } from "./users.service.js";

export class UsersController {
  async me(req: Request, res: Response) {
    const data = await usersService.getProfile(req.user!.userId);
    return sendSuccess(res, data);
  }
}

export const usersController = new UsersController();
