"use client";

import Link from "next/link";
import { useCart, selectCount } from "@/lib/store";

const NAV_LINKS = [
  { label: "About", href: "/#about" },
  { label: "Reels", href: "/#reels" },
  { label: "Brands", href: "/#brands" },
  { label: "Shop", href: "/#shop" },
];

export default function Navbar({ studioName }: { studioName: string }) {
  const count = useCart(selectCount);
  const hasHydrated = useCart((s) => s.hasHydrated);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <Link
          href="/"
          className="font-hand text-2xl font-bold leading-none text-ink sm:text-3xl"
        >
          {studioName} <span className="text-coral">✦</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-5">
          <ul className="hidden items-center gap-6 text-sm font-semibold text-ink/70 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-coral"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white transition-colors hover:border-coral/40"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {hasHydrated && count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-coral px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
