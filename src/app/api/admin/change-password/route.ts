import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import {
  ADMIN_COOKIE,
  checkPassword,
  setPassword,
  currentToken,
  cookieOptions,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const currentPassword = String(body?.currentPassword || "");
  const newPassword = String(body?.newPassword || "");

  if (!(await checkPassword(currentPassword))) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 400 }
    );
  }
  if (newPassword.length < 4) {
    return NextResponse.json(
      { error: "New password must be at least 4 characters." },
      { status: 400 }
    );
  }
  if (newPassword === currentPassword) {
    return NextResponse.json(
      { error: "New password must be different from the current one." },
      { status: 400 }
    );
  }

  await setPassword(newPassword);

  // The session token is derived from the password hash, so rotate the
  // cookie to keep this session signed in after the change.
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, await currentToken(), cookieOptions());
  return res;
}
