"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart, selectSubtotal } from "@/lib/store";
import { formatPaise, computeShipping } from "@/lib/money";
import SectionHeading from "@/components/SectionHeading";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const hasHydrated = useCart((s) => s.hasHydrated);
  const subtotal = useCart(selectSubtotal);
  const clear = useCart((s) => s.clear);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shipping = computeShipping(subtotal);
  const total = subtotal + shipping;

  function update(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate(): string | null {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email.";
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, "")))
      return "Please enter a valid 10-digit phone number.";
    if (!form.line1.trim()) return "Please enter your address.";
    if (!form.city.trim()) return "Please enter your city.";
    if (!form.state.trim()) return "Please enter your state.";
    if (!/^\d{6}$/.test(form.pincode.trim()))
      return "Please enter a valid 6-digit pincode.";
    return null;
  }

  async function verifyPayment(payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderId: string;
  }) {
    const res = await fetch("/api/checkout/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      clear();
      router.push(`/order-success/${data.orderId}`);
    } else {
      setError(data.error || "Payment verification failed. Please contact us.");
      setLoading(false);
    }
  }

  async function handlePay() {
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (items.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          customer: {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
          },
          address: {
            line1: form.line1.trim(),
            line2: form.line2.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }

      // Dev mock mode: no real Razorpay keys configured.
      if (data.mock) {
        await verifyPayment({
          razorpayOrderId: data.razorpayOrderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: "mock_signature",
          orderId: data.orderId,
        });
        return;
      }

      const ok = await loadRazorpayScript();
      if (!ok || !window.Razorpay) {
        setError("Could not load the payment gateway. Check your connection.");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Samaira Studio",
        description: "Order payment",
        order_id: data.razorpayOrderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        notes: { orderId: data.orderId },
        theme: { color: "#E07A5F" },
        handler: (response: any) =>
          verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId: data.orderId,
          }),
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (!hasHydrated) {
    return (
      <div className="section min-h-[50vh]">
        <p className="text-center text-ink/40">Loading checkout...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="section flex min-h-[55vh] flex-col items-center justify-center text-center">
        <h1 className="font-hand text-5xl text-ink">Nothing to check out</h1>
        <p className="mt-3 text-ink/60">Your cart is empty.</p>
        <Link href="/#shop" className="btn-coral mt-6">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="section">
      <SectionHeading title="Checkout" align="left" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Delivery details */}
        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-doodle">
          <h2 className="font-hand text-3xl text-ink">Delivery details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" className="sm:col-span-2">
              <input
                className="field-input"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Samaira R."
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                className="field-input"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@email.com"
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                className="field-input"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="10-digit mobile"
              />
            </Field>
            <Field label="Address line 1" className="sm:col-span-2">
              <input
                className="field-input"
                value={form.line1}
                onChange={(e) => update("line1", e.target.value)}
                placeholder="House / flat, street"
              />
            </Field>
            <Field label="Address line 2 (optional)" className="sm:col-span-2">
              <input
                className="field-input"
                value={form.line2}
                onChange={(e) => update("line2", e.target.value)}
                placeholder="Landmark, area"
              />
            </Field>
            <Field label="City">
              <input
                className="field-input"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="City"
              />
            </Field>
            <Field label="State">
              <input
                className="field-input"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                placeholder="State"
              />
            </Field>
            <Field label="Pincode">
              <input
                inputMode="numeric"
                className="field-input no-spinner"
                value={form.pincode}
                onChange={(e) => update("pincode", e.target.value)}
                placeholder="6-digit pincode"
              />
            </Field>
          </div>
        </div>

        {/* Order summary */}
        <aside className="h-fit rounded-2xl border border-ink/10 bg-white p-6 shadow-doodle lg:sticky lg:top-24">
          <h2 className="font-hand text-3xl text-ink">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3 text-sm">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.name}</p>
                  <p className="text-ink/50">Qty {item.quantity}</p>
                </div>
                <span className="font-semibold">
                  {formatPaise(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/60">Subtotal</span>
              <span className="font-semibold">{formatPaise(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">Shipping</span>
              <span className="font-semibold">
                {shipping === 0 ? "Free" : formatPaise(shipping)}
              </span>
            </div>
          </div>
          <div className="mt-3 flex justify-between border-t border-ink/10 pt-3 text-lg font-bold">
            <span>Total</span>
            <span className="text-coral">{formatPaise(total)}</span>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-coral/10 px-3 py-2 text-sm font-medium text-coral-dark">
              {error}
            </p>
          )}

          <button
            onClick={handlePay}
            disabled={loading}
            className="btn-coral mt-5 w-full"
          >
            {loading ? "Processing..." : `Pay now ${formatPaise(total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-ink/40">
            Secure payment via Razorpay · UPI, cards, netbanking, wallets
          </p>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}
