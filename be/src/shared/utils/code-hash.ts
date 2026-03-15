import crypto from "node:crypto";

const SALT = "hyperpay-verification-v1";

export function hashVerificationCode(code: string): string {
  return crypto.createHash("sha256").update(SALT + code).digest("hex");
}

export function generateSixDigitCode(): string {
  const n = crypto.randomInt(0, 1_000_000);
  return n.toString().padStart(6, "0");
}
