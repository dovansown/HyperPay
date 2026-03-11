import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthJwtPayload {
  sub: string;
  email: string;
  role: "USER" | "AUTHOR" | "EDITOR" | "ADMIN";
}

export function signAccessToken(payload: AuthJwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "24h" });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AuthJwtPayload;
}
