"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SectionHeading from "@/components/SectionHeading";
import DoodleEnvelope from "@/components/DoodleEnvelope";

export default function TrackPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const id = orderId.trim();
    const mail = email.trim();
    if (!id || !mail) {
      setError("Please enter both your order ID and email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(id)}?email=${encodeURIComponent(mail)}`
      );
      if (!res.ok) {
        setError("No order found with that ID and email. Please check and retry.");
        setLoading(false);
        return;
      }
      router.push(`/orders/${id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="section max-w-2xl">
      <SectionHeading eyebrow="Track" title="Find your order" />

      <div className="mt-10 grid items-center gap-8 sm:grid-cols-[1fr_200px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-ink/10 bg-white p-6 shadow-doodle"
        >
          <p className="mb-5 text-sm text-ink/60">
            Enter your order ID and the email you used at checkout. No login
            needed.
          </p>
          <div className="mb-4">
            <label className="field-label">Order ID</label>
            <input
              className="field-input font-mono"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. clxyz123..."
            />
          </div>
          <div className="mb-4">
            <label className="field-label">Email</label>
            <input
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          {error && (
            <p className="mb-3 text-sm font-medium text-coral-dark">{error}</p>
          )}
          <button type="submit" disabled={loading} className="btn-coral w-full">
            {loading ? "Looking up..." : "Track my order →"}
          </button>
        </form>

        <div className="hidden justify-center sm:flex">
          <DoodleEnvelope />
        </div>
      </div>
    </div>
  );
}
