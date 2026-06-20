"use client";

import Link from "next/link";
import { useCart, selectSubtotal } from "@/lib/store";
import { formatPaise } from "@/lib/money";
import SectionHeading from "@/components/SectionHeading";
import DoodleStar from "@/components/DoodleStar";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const hasHydrated = useCart((s) => s.hasHydrated);
  const subtotal = useCart(selectSubtotal);
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);
  const removeItem = useCart((s) => s.removeItem);

  if (!hasHydrated) {
    return (
      <div className="section min-h-[50vh]">
        <p className="text-center text-ink/40">Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="section flex min-h-[55vh] flex-col items-center justify-center text-center">
        <DoodleStar size="lg" />
        <h1 className="mt-4 font-hand text-5xl text-ink">Your cart is empty</h1>
        <p className="mt-3 text-ink/60">
          Nothing here yet. Let’s fix that.
        </p>
        <Link href="/#shop" className="btn-coral mt-6">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="section">
      <SectionHeading title="Your cart" align="left" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-white p-3 shadow-doodle"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-hand text-2xl text-ink">
                  {item.name}
                </h3>
                <p className="text-sm text-ink/60">{formatPaise(item.price)} each</p>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="mt-1 text-xs font-semibold text-coral hover:underline"
                >
                  Remove
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => decrement(item.productId)}
                  aria-label="Decrease quantity"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-lg leading-none hover:border-coral"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold">
                  {item.quantity}
                </span>
                <button
                  onClick={() => increment(item.productId)}
                  aria-label="Increase quantity"
                  disabled={item.stock > 0 && item.quantity >= item.stock}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-lg leading-none hover:border-coral disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <div className="w-24 text-right font-bold text-ink">
                {formatPaise(item.price * item.quantity)}
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-ink/10 bg-white p-6 shadow-doodle lg:sticky lg:top-24">
          <h2 className="font-hand text-3xl text-ink">Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/60">Subtotal</span>
              <span className="font-semibold">{formatPaise(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">Shipping</span>
              <span className="font-semibold text-sage">Calculated at checkout</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-ink/10 pt-4 text-lg font-bold">
            <span>Total</span>
            <span className="text-coral">{formatPaise(subtotal)}</span>
          </div>
          <Link href="/checkout" className="btn-coral mt-6 w-full">
            Proceed to checkout →
          </Link>
          <Link
            href="/#shop"
            className="mt-3 block text-center text-sm font-semibold text-ink/60 hover:text-coral"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
