"use client";

import { useEffect, useState } from "react";
import type { Reel } from "@/lib/content";

function newId() {
  return `reel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function ReelsTab() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/content");
      const data = await res.json();
      setReels(data.reels || []);
      setLoading(false);
    })();
  }, []);

  function update(i: number, field: keyof Reel, value: string) {
    setReels((r) => r.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
    setDirty(true);
    setMessage("");
  }

  function add() {
    setReels((r) => [...r, { id: newId(), title: "", views: "", thumbnail: "", url: "" }]);
    setDirty(true);
  }

  function remove(i: number) {
    setReels((r) => r.filter((_, idx) => idx !== i));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reels }),
    });
    setSaving(false);
    if (res.ok) {
      setDirty(false);
      setMessage("Reels saved ✦");
    } else {
      setMessage("Could not save. Please try again.");
    }
  }

  if (loading) return <p className="text-ink/40">Loading reels...</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-hand text-3xl text-ink">Reels</h2>
        <div className="flex items-center gap-3">
          {message && <span className="text-sm font-medium text-sage">{message}</span>}
          <button onClick={add} className="btn-ghost text-sm">
            + Add reel
          </button>
          <button onClick={save} disabled={saving || !dirty} className="btn-coral text-sm">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reels.map((reel, i) => (
          <div key={reel.id} className="rounded-2xl border border-ink/10 bg-white p-4 shadow-doodle">
            <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-lg bg-sand">
              {reel.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={reel.thumbnail} alt={reel.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-ink/30">
                  thumbnail
                </div>
              )}
              <button
                onClick={() => remove(i)}
                className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-coral-dark shadow"
              >
                Remove
              </button>
            </div>
            <div className="space-y-2">
              <input
                className="field-input"
                placeholder="Reel title"
                value={reel.title}
                onChange={(e) => update(i, "title", e.target.value)}
              />
              <input
                className="field-input"
                placeholder="View count (e.g. 1.2M)"
                value={reel.views}
                onChange={(e) => update(i, "views", e.target.value)}
              />
              <input
                className="field-input"
                placeholder="Thumbnail URL"
                value={reel.thumbnail}
                onChange={(e) => update(i, "thumbnail", e.target.value)}
              />
              <input
                className="field-input"
                placeholder="Reel / video link"
                value={reel.url}
                onChange={(e) => update(i, "url", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
      {reels.length === 0 && (
        <p className="mt-6 text-center text-ink/40">No reels yet. Add one to get started.</p>
      )}
    </div>
  );
}
