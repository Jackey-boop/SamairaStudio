import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { confirmPendingOrder } from "@/lib/orderActions";

// Razorpay server-to-server webhook.
// Configure the endpoint + secret in the Razorpay dashboard and set
// RAZORPAY_WEBHOOK_SECRET. We verify the HMAC SHA256 signature on the
// raw body before trusting any event.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    const type = event?.event as string;

    if (type === "payment.captured" || type === "order.paid") {
      const payment = event?.payload?.payment?.entity;
      const razorpayOrderId = payment?.order_id;
      const razorpayPaymentId = payment?.id;
      if (razorpayOrderId) {
        const order = await prisma.order.findUnique({
          where: { razorpayOrderId },
          select: { id: true },
        });
        if (order) {
          await confirmPendingOrder(order.id, razorpayPaymentId || "");
        }
      }
    } else if (type === "payment.failed") {
      const payment = event?.payload?.payment?.entity;
      const razorpayOrderId = payment?.order_id;
      if (razorpayOrderId) {
        // Only cancel still-pending orders; never override a paid one.
        await prisma.order.updateMany({
          where: { razorpayOrderId, status: "PENDING" },
          data: { status: "CANCELLED" },
        });
      }
    }

    // Always 200 so Razorpay doesn't keep retrying a handled event.
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[razorpay webhook] error:", err);
    // Still 200 to avoid retry storms; the error is logged for follow-up.
    return NextResponse.json({ received: true });
  }
}
