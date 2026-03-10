import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export function hashPassword(raw: string) {
  return bcrypt.hash(raw, SALT_ROUNDS);
}

export function verifyPassword(hash: string, raw: string) {
  return bcrypt.compare(raw, hash);
}
