import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/http-response.js";
import { authService } from "./auth.service.js";

export class AuthController {
  async register(req: Request, res: Response) {
    const data = await authService.register(req.body);
    return sendSuccess(res, data, 201);
  }

  async login(req: Request, res: Response) {
    const data = await authService.login(req.body);
    return sendSuccess(res, data);
  }

  async forgotPassword(req: Request, res: Response) {
    const data = await authService.forgotPassword(req.body);
    return sendSuccess(res, data);
  }
}

export const authController = new AuthController();
