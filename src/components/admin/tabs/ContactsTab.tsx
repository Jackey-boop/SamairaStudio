"use client";

import { useEffect, useState } from "react";

interface Submission {
  id: string;
  name: string;
  brand: string | null;
  message: string;
  createdAt: string;
}

export default function ContactsTab() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/contacts");
      const data = await res.json();
      setItems(data.submissions || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-ink/40">Loading submissions...</p>;

  return (
    <div>
      <h2 className="font-hand text-3xl text-ink">Contact submissions</h2>
      <p className="text-sm text-ink/50">Enquiries from the “work with us” form.</p>

      {items.length === 0 ? (
        <p className="mt-8 text-center text-ink/40">No submissions yet.</p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {items.map((s) => (
            <div key={s.id} className="rounded-2xl border border-ink/10 bg-white p-5 shadow-doodle">
              <div className="flex items-center justify-between">
                <h3 className="font-hand text-2xl text-ink">{s.name}</h3>
                <span className="text-xs text-ink/40">
                  {new Date(s.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              {s.brand && (
                <p className="text-sm font-semibold text-coral">{s.brand}</p>
              )}
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink/70">{s.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
