"use client";

import { useEffect, useState } from "react";
import type { Brand } from "@/lib/content";

function newId() {
  return `brand-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function BrandsTab() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/content");
      const data = await res.json();
      setBrands(data.brands || []);
      setLoading(false);
    })();
  }, []);

  function update(i: number, field: keyof Brand, value: string) {
    setBrands((b) => b.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
    setDirty(true);
    setMessage("");
  }

  function add() {
    setBrands((b) => [
      ...b,
      { id: newId(), name: "", logo: "", engagement: "", description: "" },
    ]);
    setDirty(true);
  }

  function remove(i: number) {
    setBrands((b) => b.filter((_, idx) => idx !== i));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brands }),
    });
    setSaving(false);
    if (res.ok) {
      setDirty(false);
      setMessage("Brands saved ✦");
    } else {
      setMessage("Could not save. Please try again.");
    }
  }

  if (loading) return <p className="text-ink/40">Loading brands...</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-hand text-3xl text-ink">Brands</h2>
        <div className="flex items-center gap-3">
          {message && <span className="text-sm font-medium text-sage">{message}</span>}
          <button onClick={add} className="btn-ghost text-sm">
            + Add brand
          </button>
          <button onClick={save} disabled={saving || !dirty} className="btn-coral text-sm">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {brands.map((brand, i) => (
          <div key={brand.id} className="rounded-2xl border border-ink/10 bg-white p-4 shadow-doodle">
            <div className="flex items-start gap-3">
              <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sand">
                {brand.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={brand.logo} alt={brand.name} className="max-h-12 max-w-full object-contain" />
                ) : (
                  <span className="text-xs text-ink/30">logo</span>
                )}
              </div>
              <button
                onClick={() => remove(i)}
                className="ml-auto text-xs font-semibold text-coral-dark hover:underline"
              >
                Remove
              </button>
            </div>
            <div className="mt-3 space-y-2">
              <input
                className="field-input"
                placeholder="Brand name"
                value={brand.name}
                onChange={(e) => update(i, "name", e.target.value)}
              />
              <input
                className="field-input"
                placeholder="Logo URL"
                value={brand.logo}
                onChange={(e) => update(i, "logo", e.target.value)}
              />
              <input
                className="field-input"
                placeholder="Engagement stat (e.g. 4.8% avg engagement)"
                value={brand.engagement}
                onChange={(e) => update(i, "engagement", e.target.value)}
              />
              <input
                className="field-input"
                placeholder="Short description"
                value={brand.description}
                onChange={(e) => update(i, "description", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
      {brands.length === 0 && (
        <p className="mt-6 text-center text-ink/40">No brands yet. Add one to get started.</p>
      )}
    </div>
  );
}
