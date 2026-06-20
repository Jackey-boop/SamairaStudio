"use client";

import { useEffect, useState } from "react";
import { formatPaise, paiseToRupees, rupeesToPaise } from "@/lib/money";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number; // paise
  image: string;
  stock: number;
  active: boolean;
}

const BLANK = { name: "", description: "", image: "", priceRupees: "", stock: "" };

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startNew() {
    setForm(BLANK);
    setError("");
    setEditing("new");
  }

  function startEdit(p: Product) {
    setForm({
      name: p.name,
      description: p.description || "",
      image: p.image,
      priceRupees: String(paiseToRupees(p.price)),
      stock: String(p.stock),
    });
    setError("");
    setEditing(p);
  }

  async function handleSave() {
    setError("");
    if (!form.name.trim() || !form.image.trim()) {
      setError("Name and image URL are required.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      price: rupeesToPaise(Number(form.priceRupees) || 0),
      stock: Math.round(Number(form.stock) || 0),
    };
    setSaving(true);
    const res =
      editing === "new"
        ? await fetch("/api/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/admin/products/${(editing as Product).id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
    setSaving(false);
    if (res.ok) {
      setEditing(null);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not save product.");
    }
  }

  async function toggleActive(p: Product) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    load();
  }

  async function remove(p: Product) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-hand text-3xl text-ink">Products</h2>
        {!editing && (
          <button onClick={startNew} className="btn-coral text-sm">
            + Add product
          </button>
        )}
      </div>

      {editing && (
        <div className="mt-4 rounded-2xl border border-ink/10 bg-white p-5 shadow-doodle">
          <h3 className="font-hand text-2xl text-ink">
            {editing === "new" ? "New product" : "Edit product"}
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="field-label">Name</label>
              <input
                className="field-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Description</label>
              <textarea
                rows={2}
                className="field-input resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Image URL</label>
              <input
                className="field-input"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="field-label">Price (₹)</label>
              <input
                inputMode="decimal"
                className="field-input no-spinner"
                value={form.priceRupees}
                onChange={(e) => setForm({ ...form, priceRupees: e.target.value })}
                placeholder="e.g. 499"
              />
            </div>
            <div>
              <label className="field-label">Stock quantity</label>
              <input
                inputMode="numeric"
                className="field-input no-spinner"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="e.g. 25"
              />
            </div>
          </div>
          {error && <p className="mt-3 text-sm font-medium text-coral-dark">{error}</p>}
          <div className="mt-4 flex gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-coral text-sm">
              {saving ? "Saving..." : "Save product"}
            </button>
            <button onClick={() => setEditing(null)} className="btn-ghost text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 overflow-x-auto rounded-2xl border border-ink/10 bg-white shadow-doodle">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase tracking-wider text-ink/40">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink/40">
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink/40">
                  No products yet. Add your first one!
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-sand">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                      </div>
                      <span className="font-semibold">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatPaise(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock <= 0 ? "text-coral-dark" : "text-ink/70"}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        p.active ? "bg-sage" : "bg-ink/20"
                      }`}
                      aria-label="Toggle active"
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          p.active ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => startEdit(p)}
                      className="text-sm font-semibold text-ink/60 hover:text-coral"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(p)}
                      className="ml-3 text-sm font-semibold text-coral-dark hover:underline"
                    >
                      Delete
                    </button>
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
