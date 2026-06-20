import { NextResponse } from "next/server";
import { isAdminAuthed } from "./auth";

// Returns a 401 response if the request isn't an authenticated admin,
// otherwise null. Use at the top of every /api/admin route handler.
export async function requireAdmin(): Promise<NextResponse | null> {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
