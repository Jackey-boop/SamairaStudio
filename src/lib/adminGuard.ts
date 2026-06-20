import { NextResponse } from "next/server";
import { isAdminAuthed } from "./auth";

// Returns a 401 response if the request isn't an authenticated admin,
// otherwise null. Use at the top of every /api/admin route handler.
export function requireAdmin(): NextResponse | null {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
