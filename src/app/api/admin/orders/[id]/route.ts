import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { parseAddress } from "@/lib/orders";
import { isOrderStatus } from "@/lib/orderStatus";
import { sendStatusUpdate } from "@/lib/email";

// GET: full order detail (admin).
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = requireAdmin();
  if (denied) return denied;

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({
    order: { ...order, address: parseAddress(order.address) },
  });
}

// PATCH: update status / courier / tracking / estimated delivery.
// If `notify` is true, emails the customer about the change.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (!isOrderStatus(String(body.status)))
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    data.status = String(body.status);
  }
  if (body.courierName !== undefined)
    data.courierName = body.courierName ? String(body.courierName).trim() : null;
  if (body.trackingNumber !== undefined)
    data.trackingNumber = body.trackingNumber
      ? String(body.trackingNumber).trim()
      : null;
  if (body.estimatedDelivery !== undefined) {
    if (!body.estimatedDelivery) {
      data.estimatedDelivery = null;
    } else {
      const d = new Date(body.estimatedDelivery);
      if (isNaN(d.getTime()))
        return NextResponse.json({ error: "Invalid date." }, { status: 400 });
      data.estimatedDelivery = d;
    }
  }

  let order;
  try {
    order = await prisma.order.update({
      where: { id: params.id },
      data,
      include: { items: true },
    });
  } catch {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  let emailed = false;
  if (body.notify) {
    const result = await sendStatusUpdate({
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      address: order.address,
      total: order.total,
      subtotal: order.subtotal,
      status: order.status,
      trackingNumber: order.trackingNumber,
      courierName: order.courierName,
      estimatedDelivery: order.estimatedDelivery,
      items: order.items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        price: i.price,
      })),
    });
    emailed = !("skipped" in result && result.skipped);
  }

  return NextResponse.json({
    order: { ...order, address: parseAddress(order.address) },
    emailed,
  });
}
