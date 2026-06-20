"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DoodleStar from "@/components/DoodleStar";
import Squiggle from "@/components/Squiggle";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Incorrect password.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-ink/10 bg-white p-8 shadow-doodle"
      >
        <div className="mb-6 text-center">
          <DoodleStar size="lg" className="mx-auto" />
          <h1 className="mt-3 font-hand text-4xl text-ink">Studio admin</h1>
          <div className="mt-1 flex justify-center">
            <Squiggle width={160} />
          </div>
          <p className="mt-3 text-sm text-ink/50">
            Enter the admin password to continue.
          </p>
        </div>
        <label className="field-label">Password</label>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field-input"
          placeholder="••••••••"
        />
        {error && (
          <p className="mt-3 text-sm font-medium text-coral-dark">{error}</p>
        )}
        <button type="submit" disabled={loading} className="btn-coral mt-5 w-full">
          {loading ? "Checking..." : "Enter ✦"}
        </button>
      </form>
    </div>
  );
}
