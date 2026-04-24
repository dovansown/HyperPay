import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthJwtPayload {
  sub: string;
  email: string;
  role: "USER" | "AUTHOR" | "EDITOR" | "ADMIN";
}

export interface Temp2FAPayload {
  sub: string;
  purpose: "2fa";
  ip?: string | null;
  userAgent?: string | null;
}

export function signAccessToken(payload: AuthJwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "24h" });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AuthJwtPayload;
}

export function signTemp2FAToken(userId: string, meta?: { ip?: string | null; userAgent?: string | null }) {
  return jwt.sign(
    {
      sub: userId,
      purpose: "2fa",
      ip: meta?.ip ?? null,
      userAgent: meta?.userAgent ?? null,
    } as Temp2FAPayload,
    env.JWT_SECRET,
    { expiresIn: "5m" }
  );
}

export function verifyTemp2FAToken(token: string): Temp2FAPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as Temp2FAPayload;
  if (decoded.purpose !== "2fa") throw new Error("Invalid token purpose");
  return decoded;
}
