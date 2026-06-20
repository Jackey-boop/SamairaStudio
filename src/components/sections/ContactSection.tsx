"use client";

import { useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import DoodleEnvelope from "@/components/DoodleEnvelope";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactSection() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      brand: String(data.get("brand") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };

    if (!payload.name || !payload.message) {
      setStatus("error");
      setError("Please add your name and a quick brief.");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <section id="contact" className="section">
      <SectionHeading eyebrow="Work with us" title="Let's create together" />

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="card-doodle"
          style={{ transform: "rotate(-0.4deg)" }}
        >
          {status === "sent" ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="font-hand text-4xl text-coral">Yay! ✦</span>
              <p className="text-ink/70">
                Thanks for reaching out. We’ll be in touch very soon.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="btn-ghost mt-2"
              >
                Send another
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label htmlFor="name" className="field-label">
                  Your name
                </label>
                <input id="name" name="name" className="field-input" placeholder="Samaira R." />
              </div>
              <div className="mb-4">
                <label htmlFor="brand" className="field-label">
                  Brand / Company
                </label>
                <input id="brand" name="brand" className="field-input" placeholder="Your brand" />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="field-label">
                  Tell us about your campaign
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="field-input resize-none"
                  placeholder="A few lines about what you're dreaming up..."
                />
              </div>
              {status === "error" && (
                <p className="mb-3 text-sm font-medium text-coral-dark">{error}</p>
              )}
              <button type="submit" disabled={status === "sending"} className="btn-coral w-full">
                {status === "sending" ? "Sending..." : "Send us a message →"}
              </button>
            </>
          )}
        </form>

        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <DoodleEnvelope className="flex justify-center" />
          <p className="max-w-xs font-hand text-2xl text-ink/80">
            a handwritten note, straight to our inbox
          </p>
        </div>
      </div>
    </section>
  );
}
