import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder, isMockPayments } from "@/lib/razorpay";
import { computeShipping } from "@/lib/money";
import { serializeAddress, type ShippingAddress } from "@/lib/orders";

interface IncomingItem {
  productId: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: IncomingItem[] = Array.isArray(body?.items) ? body.items : [];
    const customer = body?.customer ?? {};
    const address: ShippingAddress = body?.address ?? {};

    // ── Validate input ──────────────────────────────────────────
    if (items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }
    if (!customer.name || !customer.email || !customer.phone) {
      return NextResponse.json(
        { error: "Missing customer details." },
        { status: 400 }
      );
    }
    if (!address.line1 || !address.city || !address.state || !address.pincode) {
      return NextResponse.json(
        { error: "Missing delivery address." },
        { status: 400 }
      );
    }

    // ── Validate items against DB (price + stock are source of truth) ──
    const ids = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, active: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const lineItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      const qty = Math.floor(Number(item.quantity));
      if (!product) {
        return NextResponse.json(
          { error: "One or more products are no longer available." },
          { status: 400 }
        );
      }
      if (!Number.isFinite(qty) || qty < 1) {
        return NextResponse.json(
          { error: `Invalid quantity for ${product.name}.` },
          { status: 400 }
        );
      }
      if (product.stock < qty) {
        return NextResponse.json(
          {
            error: `Only ${product.stock} left of ${product.name}. Please update your cart.`,
          },
          { status: 400 }
        );
      }
      subtotal += product.price * qty;
      lineItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        quantity: qty,
      });
    }

    const shipping = computeShipping(subtotal);
    const total = subtotal + shipping;

    // ── Create Razorpay order ───────────────────────────────────
    const receipt = `rcpt_${Date.now()}`;
    const rzpOrder = await createRazorpayOrder({
      amount: total,
      receipt,
      notes: { customerEmail: customer.email },
    });

    // ── Persist a PENDING order ─────────────────────────────────
    const order = await prisma.order.create({
      data: {
        razorpayOrderId: rzpOrder.id,
        status: "PENDING",
        customerName: String(customer.name),
        customerEmail: String(customer.email),
        customerPhone: String(customer.phone),
        address: serializeAddress({
          line1: address.line1,
          line2: address.line2 || "",
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        }),
        subtotal,
        total,
        items: { create: lineItems },
      },
    });

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: total,
      currency: "INR",
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      mock: isMockPayments,
    });
  } catch (err) {
    console.error("[create-order] error:", err);
    return NextResponse.json(
      { error: "Could not create your order. Please try again." },
      { status: 500 }
    );
  }
}
