import crypto from "crypto";
import Razorpay from "razorpay";

// ─────────────────────────────────────────────────────────────
// Razorpay helper.
//
// When RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are configured we talk to
// the real Razorpay API. When they are NOT configured (e.g. local dev
// without keys) we fall back to a deterministic MOCK so the entire
// checkout flow can still be exercised end-to-end. Mock mode is only
// ever used outside production.
// ─────────────────────────────────────────────────────────────

const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

export const razorpayConfigured = Boolean(KEY_ID && KEY_SECRET);
export const isMockPayments =
  !razorpayConfigured && process.env.NODE_ENV !== "production";

let client: Razorpay | null = null;
function getClient(): Razorpay {
  if (!client) {
    client = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
  }
  return client;
}

export interface CreatedOrder {
  id: string;
  amount: number;
  currency: string;
}

export async function createRazorpayOrder(params: {
  amount: number; // paise
  receipt: string;
  notes?: Record<string, string>;
}): Promise<CreatedOrder> {
  if (!razorpayConfigured) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Razorpay keys are not configured.");
    }
    // Mock order for local dev.
    return {
      id: `order_mock_${crypto.randomBytes(8).toString("hex")}`,
      amount: params.amount,
      currency: "INR",
    };
  }

  const order = await getClient().orders.create({
    amount: params.amount,
    currency: "INR",
    receipt: params.receipt,
    notes: params.notes,
  });

  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
  };
}

// Verifies the signature returned by Razorpay Checkout on success:
//   HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  if (isMockPayments) {
    // Accept the mock signature emitted by the dev checkout shim.
    return razorpaySignature === "mock_signature";
  }

  const expected = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return timingSafeEqual(expected, razorpaySignature);
}

// Verifies a Razorpay webhook payload signature.
export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  if (!WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
