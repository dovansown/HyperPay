import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/http-response.js";
import { authService } from "./auth.service.js";

function getLoginMeta(req: Request): { ip: string | null; userAgent: string | null } {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.socket?.remoteAddress ?? null;
  const userAgent = (req.headers["user-agent"] as string) ?? null;
  return { ip, userAgent };
}

export class AuthController {
  async register(req: Request, res: Response) {
    const data = await authService.register(req.body);
    return sendSuccess(res, data, 201);
  }

  async login(req: Request, res: Response) {
    const meta = getLoginMeta(req);
    const data = await authService.login(req.body, meta);
    return sendSuccess(res, data);
  }

  async verify(req: Request, res: Response) {
    const data = await authService.verifyCodeAndIssueToken(
      req.body.verification_id,
      req.body.code,
      req.body.type
    );
    return sendSuccess(res, data);
  }

  async verify2FA(req: Request, res: Response) {
    const data = await authService.verify2FA(req.body.temp_token, req.body.code);
    return sendSuccess(res, data);
  }

  async forgotPassword(req: Request, res: Response) {
    const data = await authService.forgotPassword(req.body);
    return sendSuccess(res, data);
  }
}

export const authController = new AuthController();
