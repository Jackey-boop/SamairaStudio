import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

// GET: list all "work with us" submissions, newest first.
export async function GET() {
  const denied = requireAdmin();
  if (denied) return denied;

  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ submissions });
}
