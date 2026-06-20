import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { isOrderStatus } from "@/lib/orderStatus";

// GET: list orders with optional ?status= and ?q= (order id / email) filters.
export async function GET(req: NextRequest) {
  const denied = requireAdmin();
  if (denied) return denied;

  const status = req.nextUrl.searchParams.get("status") || "";
  const q = (req.nextUrl.searchParams.get("q") || "").trim();

  const where: Record<string, unknown> = {};
  if (status && isOrderStatus(status)) where.status = status;
  if (q) {
    where.OR = [
      { id: { contains: q } },
      { customerEmail: { contains: q } },
      { customerName: { contains: q } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      status: o.status,
      total: o.total,
      itemCount: o._count.items,
      createdAt: o.createdAt,
    })),
  });
}
