"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OrdersTab from "./tabs/OrdersTab";
import ProductsTab from "./tabs/ProductsTab";
import BrandsTab from "./tabs/BrandsTab";
import ReelsTab from "./tabs/ReelsTab";
import ContactsTab from "./tabs/ContactsTab";
import SettingsTab from "./tabs/SettingsTab";

const TABS = [
  { id: "orders", label: "Orders" },
  { id: "products", label: "Products" },
  { id: "brands", label: "Brands" },
  { id: "reels", label: "Reels" },
  { id: "contacts", label: "Contacts" },
  { id: "settings", label: "Settings" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("orders");

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-hand text-4xl text-ink">
            Samaira Studio <span className="text-coral">✦</span>
          </h1>
          <p className="text-sm text-ink/50">Admin dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="btn-ghost text-sm">
            View site ↗
          </a>
          <button onClick={logout} className="btn-ghost text-sm">
            Log out
          </button>
        </div>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2 border-b border-ink/10 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "bg-coral text-white"
                : "bg-white text-ink/60 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "orders" && <OrdersTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "brands" && <BrandsTab />}
        {tab === "reels" && <ReelsTab />}
        {tab === "contacts" && <ContactsTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}
