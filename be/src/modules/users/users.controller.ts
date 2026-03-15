import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/http-response.js";
import { usersService } from "./users.service.js";

export class UsersController {
  async me(req: Request, res: Response) {
    const data = await usersService.getProfile(req.user!.userId);
    return sendSuccess(res, data);
  }

  async updateProfile(req: Request, res: Response) {
    const data = await usersService.updateProfile(req.user!.userId, req.body);
    return sendSuccess(res, data);
  }

  async checkChangePassword(req: Request, res: Response) {
    const data = await usersService.checkChangePassword(req.user!.userId, req.body);
    return sendSuccess(res, data);
  }

  async sendChangePasswordCode(req: Request, res: Response) {
    const data = await usersService.sendChangePasswordCode(req.user!.userId);
    return sendSuccess(res, data);
  }

  async changePassword(req: Request, res: Response) {
    const data = await usersService.changePassword(req.user!.userId, req.body);
    return sendSuccess(res, data);
  }

  async sendVerifyEmailCode(req: Request, res: Response) {
    const data = await usersService.sendVerifyEmailCode(req.user!.userId);
    return sendSuccess(res, data);
  }

  async get2FASetup(req: Request, res: Response) {
    const data = await usersService.get2FASetup(req.user!.userId);
    return sendSuccess(res, data);
  }

  async enable2FA(req: Request, res: Response) {
    const data = await usersService.enable2FA(req.user!.userId, req.body.code);
    return sendSuccess(res, data);
  }

  async disable2FA(req: Request, res: Response) {
    const data = await usersService.disable2FA(req.user!.userId);
    return sendSuccess(res, data);
  }
}

export const usersController = new UsersController();
