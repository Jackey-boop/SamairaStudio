import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

// GET: list all products (incl. inactive). POST: create a product.
// `price` is in paise.
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const image = String(body?.image || "").trim();
  const description = body?.description ? String(body.description).trim() : null;
  const price = Math.round(Number(body?.price));
  const stock = Math.round(Number(body?.stock));
  const active = body?.active !== false;

  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!image) return NextResponse.json({ error: "Image URL is required." }, { status: 400 });
  if (!Number.isFinite(price) || price < 0)
    return NextResponse.json({ error: "Price must be a positive number." }, { status: 400 });
  if (!Number.isFinite(stock) || stock < 0)
    return NextResponse.json({ error: "Stock must be a positive number." }, { status: 400 });

  const product = await prisma.product.create({
    data: { name, description, price, image, stock, active },
  });
  return NextResponse.json({ product });
}
