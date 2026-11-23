"use client";

import React, { useState } from "react";
import { Lock } from "lucide-react";
import { Monogram } from "./Monogram";

export function AdminLoginForm({ title = "Couple’s admin" }: { title?: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Incorrect password.");
        return;
      }
      window.location.reload();
    } catch {
      setError("Unable to sign in right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen paper-grain flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm rounded-panel border border-ink/10 bg-surface p-7 shadow-card text-center">
        <Monogram size="md" />
        <h1 className="mt-4 font-display text-3xl font-medium text-ink">
          {title}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Enter your admin password to continue.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4 text-left">
          <div>
            <label
              htmlFor="admin-password"
              className="block text-sm font-medium text-ink"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-ivory px-4 py-3 text-base text-ink focus:border-magenta focus:outline-none"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-magenta/10 px-3.5 py-2 text-sm text-magenta"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full min-h-[46px] items-center justify-center gap-2 rounded-full bg-magenta px-5 py-2.5 text-base font-medium text-white shadow-soft transition hover:bg-magenta-dark disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            <span>{loading ? "Signing in…" : "Sign in"}</span>
          </button>
        </form>
      </div>
    </main>
  );
}
