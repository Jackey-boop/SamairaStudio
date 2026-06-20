import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { getContent, saveContent } from "@/lib/content";

// GET: full site content (studio, brands, reels).
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const content = await getContent();
  return NextResponse.json(content);
}

// PUT: replace any of { studio, brands, reels }. Only provided keys change.
export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const current = await getContent();

  const next = {
    studio: body.studio ?? current.studio,
    brands: Array.isArray(body.brands) ? body.brands : current.brands,
    reels: Array.isArray(body.reels) ? body.reels : current.reels,
  };

  await saveContent(next);
  return NextResponse.json(next);
}
