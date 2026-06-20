import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseAddress } from "@/lib/orders";

// Public order lookup. Returns status + tracking info only (no payment data).
// Optional ?email= adds a light verification used by the /track lookup form.
export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const email = req.nextUrl.searchParams.get("email");

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (
    email &&
    order.customerEmail.toLowerCase().trim() !== email.toLowerCase().trim()
  ) {
    return NextResponse.json(
      { error: "No order found with that ID and email." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    order: {
      id: order.id,
      status: order.status,
      customerName: order.customerName,
      address: parseAddress(order.address),
      subtotal: order.subtotal,
      total: order.total,
      trackingNumber: order.trackingNumber,
      courierName: order.courierName,
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((i) => ({
        productName: i.productName,
        productImage: i.productImage,
        price: i.price,
        quantity: i.quantity,
      })),
    },
  });
}
