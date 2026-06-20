import crypto from "crypto";
import { cookies } from "next/headers";

// Simple password gate for the admin panel.
// The browser stores an httpOnly cookie holding a hash derived from
// ADMIN_PASSWORD; every admin request re-checks it against the env value.

export const ADMIN_COOKIE = "samaira_admin";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

export function expectedToken(): string {
  // Token is a hash of the password so the raw password never sits in a cookie.
  return crypto
    .createHash("sha256")
    .update(`samaira::${ADMIN_PASSWORD}`)
    .digest("hex");
}

export function checkPassword(input: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(ADMIN_PASSWORD);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
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

// Reads the cookie (Server Components & Route Handlers) and validates it.
export function isAdminAuthed(): boolean {
  if (!ADMIN_PASSWORD) return false;
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const expected = expectedToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
