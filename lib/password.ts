import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const [, salt, hash] = parts;
  const hashBuffer = Buffer.from(hash, "hex");
  const candidate = scryptSync(password, salt, KEY_LENGTH);

  if (hashBuffer.length !== candidate.length) return false;
  return timingSafeEqual(hashBuffer, candidate);
}
