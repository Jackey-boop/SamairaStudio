import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

// PATCH: update fields. DELETE: remove a product.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};

  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.image !== undefined) data.image = String(body.image).trim();
  if (body.description !== undefined)
    data.description = body.description ? String(body.description).trim() : null;
  if (body.price !== undefined) {
    const price = Math.round(Number(body.price));
    if (!Number.isFinite(price) || price < 0)
      return NextResponse.json({ error: "Invalid price." }, { status: 400 });
    data.price = price;
  }
  if (body.stock !== undefined) {
    const stock = Math.round(Number(body.stock));
    if (!Number.isFinite(stock) || stock < 0)
      return NextResponse.json({ error: "Invalid stock." }, { status: 400 });
    data.stock = stock;
  }
  if (body.active !== undefined) data.active = Boolean(body.active);

  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = requireAdmin();
  if (denied) return denied;

  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
}
