import type { AuthJwtPayload } from "../../shared/utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthJwtPayload & { userId: string };
    }
  }
}

export {};
