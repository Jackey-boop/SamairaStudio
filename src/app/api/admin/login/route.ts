import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkPassword,
  expectedToken,
  cookieOptions,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = String(body?.password || "");

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Admin password is not configured on the server." },
      { status: 500 }
    );
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, expectedToken(), cookieOptions());
  return res;
}
