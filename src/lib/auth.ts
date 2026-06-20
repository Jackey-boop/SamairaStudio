import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

// ─────────────────────────────────────────────────────────────
// Admin authentication.
//
// The admin password is stored (salted + hashed with scrypt) in the
// database so it can be changed from the admin panel at runtime.
// On first use the password is seeded from the ADMIN_PASSWORD env var,
// falling back to "admin" if that isn't set.
//
// The browser holds an httpOnly cookie containing a token derived from
// the current password hash. Changing the password rotates that token,
// which invalidates existing sessions.
// ─────────────────────────────────────────────────────────────

export const ADMIN_COOKIE = "samaira_admin";
const PASSWORD_KEY = "admin_password_hash";
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

// ── password hashing (scrypt, salted) ───────────────────────────
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPasswordHash(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, "hex");
  if (keyBuf.length !== derived.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

// Returns the current stored password hash, seeding it from the default
// on first use. Safe against concurrent first-time seeding.
async function getStoredHash(): Promise<string> {
  const existing = await prisma.setting.findUnique({
    where: { key: PASSWORD_KEY },
  });
  if (existing) return existing.value;

  const seeded = await prisma.setting.upsert({
    where: { key: PASSWORD_KEY },
    create: { key: PASSWORD_KEY, value: hashPassword(DEFAULT_PASSWORD) },
    update: {}, // no-op if another request seeded it first
  });
  return seeded.value;
}

export async function checkPassword(input: string): Promise<boolean> {
  if (!input) return false;
  const stored = await getStoredHash();
  return verifyPasswordHash(input, stored);
}

export async function setPassword(newPassword: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key: PASSWORD_KEY },
    create: { key: PASSWORD_KEY, value: hashPassword(newPassword) },
    update: { value: hashPassword(newPassword) },
  });
}

// ── session cookie token ────────────────────────────────────────
function tokenFromHash(storedHash: string): string {
  return crypto
    .createHash("sha256")
    .update(`samaira-token::${storedHash}`)
    .digest("hex");
}

export async function currentToken(): Promise<string> {
  return tokenFromHash(await getStoredHash());
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}

export async function isAdminAuthed(): Promise<boolean> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const expected = await currentToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
