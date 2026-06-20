import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { confirmPendingOrder } from "@/lib/orderActions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } =
      body ?? {};

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return NextResponse.json(
        { error: "Missing payment verification fields." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, razorpayOrderId: true, status: true },
    });

    if (!order || order.razorpayOrderId !== razorpayOrderId) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Idempotent: if already confirmed (e.g. webhook beat us), just succeed.
    if (order.status !== "PENDING") {
      return NextResponse.json({ success: true, orderId: order.id });
    }

    const valid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!valid) {
      return NextResponse.json(
        { error: "Payment could not be verified." },
        { status: 400 }
      );
    }

    // Confirm order + decrement stock + send email (idempotent helper).
    const result = await confirmPendingOrder(order.id, razorpayPaymentId);
    if (!result.ok) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err) {
    console.error("[verify-payment] error:", err);
    return NextResponse.json(
      { error: "Verification failed. Please contact support." },
      { status: 500 }
    );
  }
}
