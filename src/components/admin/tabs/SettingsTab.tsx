"use client";

import { useState } from "react";

export default function SettingsTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 4) {
      setError("New password must be at least 4 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("New password and confirmation do not match.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSaving(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMessage("Password updated ✦");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } else {
      setError(data.error || "Could not update password.");
    }
  }

  return (
    <div>
      <h2 className="font-hand text-3xl text-ink">Settings</h2>
      <p className="text-sm text-ink/50">Manage your admin account.</p>

      <form
        onSubmit={handleSubmit}
        className="mt-5 max-w-md rounded-2xl border border-ink/10 bg-white p-6 shadow-doodle"
      >
        <h3 className="font-hand text-2xl text-ink">Change password</h3>

        <label className="field-label mt-4">Current password</label>
        <input
          type="password"
          className="field-input"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="••••••••"
        />

        <label className="field-label mt-4">New password</label>
        <input
          type="password"
          className="field-input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 4 characters"
        />

        <label className="field-label mt-4">Confirm new password</label>
        <input
          type="password"
          className="field-input"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-type new password"
        />

        {error && (
          <p className="mt-4 rounded-lg bg-coral/10 px-3 py-2 text-sm font-medium text-coral-dark">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-4 rounded-lg bg-sage/10 px-3 py-2 text-sm font-medium text-sage">
            {message}
          </p>
        )}

        <button type="submit" disabled={saving} className="btn-coral mt-5 w-full">
          {saving ? "Saving..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
