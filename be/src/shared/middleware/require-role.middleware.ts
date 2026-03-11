import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";
import { AppError, ErrorCodes } from "../http/app-error.js";

export function requireRole(roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) {
      next(new AppError(401, ErrorCodes.UNAUTHORIZED, "Missing user role"));
      return;
    }

    if (!roles.includes(role)) {
      next(new AppError(403, ErrorCodes.FORBIDDEN, "Insufficient role"));
      return;
    }

    next();
  };
}
