import { prisma } from "./prisma";
import { sendOrderConfirmation } from "./email";

// Confirms a PENDING order: marks it CONFIRMED, records the payment id,
// decrements product stock and sends the confirmation email.
// Idempotent: safe to call from both verify-payment and the webhook.
export async function confirmPendingOrder(
  orderId: string,
  razorpayPaymentId: string
): Promise<{ ok: boolean; alreadyDone?: boolean; reason?: string }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) return { ok: false, reason: "not_found" };
  if (order.status !== "PENDING") return { ok: true, alreadyDone: true };

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: "CONFIRMED", razorpayPaymentId },
    }),
    ...order.items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    ),
  ]);

  await sendOrderConfirmation({
    id: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    address: order.address,
    total: order.total,
    subtotal: order.subtotal,
    status: "CONFIRMED",
    items: order.items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
      price: i.price,
    })),
  });

  return { ok: true };
}
