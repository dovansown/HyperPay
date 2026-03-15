import type { NextFunction, Request, Response } from "express";
import { AppError, ErrorCodes } from "../http/app-error.js";
import { verifyAccessToken } from "../utils/jwt.js";

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    next(new AppError(401, ErrorCodes.UNAUTHORIZED, "Missing Bearer token"));
    return;
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      ...payload,
      role: payload.role ?? "USER",
      userId: payload.sub
    };
    next();
  } catch {
    next(new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid or expired token"));
  }
}
