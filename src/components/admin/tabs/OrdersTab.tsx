"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPaise } from "@/lib/money";
import { formatAddress, type ShippingAddress } from "@/lib/orders";
import {
  ORDER_STATUSES,
  STATUS_LABELS,
  STATUS_COLORS,
  type OrderStatus,
} from "@/lib/orderStatus";

interface OrderRow {
  id: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  createdAt: string;
}

interface OrderDetail extends OrderRow {
  customerPhone: string;
  address: ShippingAddress;
  subtotal: number;
  courierName: string | null;
  trackingNumber: string | null;
  estimatedDelivery: string | null;
  items: {
    id: string;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
  }[];
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (query.trim()) params.set("q", query.trim());
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }, [statusFilter, query]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  if (selectedId) {
    return (
      <OrderDetailView
        orderId={selectedId}
        onBack={() => setSelectedId(null)}
        onSaved={load}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search order ID, name or email"
          className="field-input max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="field-input max-w-[180px]"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-ink/10 bg-white shadow-doodle">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase tracking-wider text-ink/40">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink/40">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink/40">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelectedId(o.id)}
                  className="cursor-pointer border-b border-ink/5 transition-colors last:border-0 hover:bg-cream"
                >
                  <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 12)}…</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{o.customerName}</div>
                    <div className="text-xs text-ink/40">{o.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-ink/60">{fmtDate(o.createdAt)}</td>
                  <td className="px-4 py-3 font-semibold">{formatPaise(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`status-pill ${STATUS_COLORS[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrderDetailView({
  orderId,
  onBack,
  onSaved,
}: {
  orderId: string;
  onBack: () => void;
  onSaved: () => void;
}) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [status, setStatus] = useState<OrderStatus>("PENDING");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();
      const o: OrderDetail = data.order;
      setOrder(o);
      setStatus(o.status);
      setCourierName(o.courierName || "");
      setTrackingNumber(o.trackingNumber || "");
      setEstimatedDelivery(
        o.estimatedDelivery ? o.estimatedDelivery.slice(0, 10) : ""
      );
    })();
  }, [orderId]);

  async function save(notify: boolean) {
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        courierName,
        trackingNumber,
        estimatedDelivery: estimatedDelivery || null,
        notify,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setMessage(
        notify
          ? data.emailed
            ? "Saved & customer notified ✦"
            : "Saved. (Email not sent: RESEND_API_KEY not configured.)"
          : "Saved ✦"
      );
      onSaved();
    } else {
      setMessage(data.error || "Could not save.");
    }
  }

  if (!order) {
    return <p className="text-ink/40">Loading order...</p>;
  }

  return (
    <div>
      <button onClick={onBack} className="text-sm font-semibold text-coral hover:underline">
        ← Back to orders
      </button>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left: customer + items */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-doodle">
            <div className="flex items-center justify-between">
              <h2 className="font-hand text-3xl text-ink">Order</h2>
              <span className={`status-pill ${STATUS_COLORS[order.status]}`}>
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <p className="mt-1 font-mono text-xs text-ink/50">{order.id}</p>
            <p className="text-xs text-ink/40">Placed {fmtDate(order.createdAt)}</p>

            <div className="mt-4 grid gap-1 text-sm">
              <p className="font-semibold">{order.customerName}</p>
              <p className="text-ink/60">{order.customerEmail}</p>
              <p className="text-ink/60">{order.customerPhone}</p>
              <p className="mt-2 text-ink/60">{formatAddress(order.address)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-doodle">
            <h3 className="font-hand text-2xl text-ink">Items</h3>
            <ul className="mt-3 space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-sand">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-ink/50">
                      {formatPaise(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatPaise(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t border-ink/10 pt-3 text-sm">
              <div className="flex justify-between text-ink/60">
                <span>Subtotal</span>
                <span>{formatPaise(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink/60">
                <span>Shipping</span>
                <span>{formatPaise(order.total - order.subtotal)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-coral">{formatPaise(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: fulfilment controls */}
        <aside className="h-fit rounded-2xl border border-ink/10 bg-white p-5 shadow-doodle lg:sticky lg:top-6">
          <h3 className="font-hand text-2xl text-ink">Update fulfilment</h3>

          <label className="field-label mt-4">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="field-input"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>

          <label className="field-label mt-4">Courier name</label>
          <input
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            className="field-input"
            placeholder="e.g. Delhivery"
          />

          <label className="field-label mt-4">Tracking number</label>
          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="field-input"
            placeholder="e.g. DL123456789"
          />

          <label className="field-label mt-4">Estimated delivery</label>
          <input
            type="date"
            value={estimatedDelivery}
            onChange={(e) => setEstimatedDelivery(e.target.value)}
            className="field-input"
          />

          {message && (
            <p className="mt-4 rounded-lg bg-sage/10 px-3 py-2 text-sm font-medium text-sage">
              {message}
            </p>
          )}

          <button
            onClick={() => save(true)}
            disabled={saving}
            className="btn-coral mt-5 w-full"
          >
            {saving ? "Saving..." : "Save & notify customer"}
          </button>
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="btn-ghost mt-2 w-full"
          >
            Save without emailing
          </button>
        </aside>
      </div>
    </div>
  );
}
