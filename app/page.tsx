"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Login failed");
      }

      const next = new URLSearchParams(window.location.search).get("next");
      const safeRoute: Route =
        next === "/home" || next === "/dashboard" || next === "/students" || next === "/records" || next === "/analytics"
          ? (next as Route)
          : "/home";

      router.push(safeRoute);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md">
        <section className="panel w-full p-6">
          <div className="mb-5 text-center flex flex-col items-center">
            <Logo className="h-16 mb-4" />
            <h1 className="mt-2 font-display text-2xl font-bold text-slate-900">Sign in to Continue</h1>
            <p className="mt-1 text-sm text-slate-500">Attendance and Grades Management</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="caps-label">Email</label>
              <input
                type="email"
                className="caps-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="caps-label">Password</label>
              <input
                type="password"
                className="caps-input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}

            <button className="caps-btn-primary w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </section>
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="text-sm font-bold text-amber-800 flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Note: Review the readme file attached in the GCR for login credentials
          </p>
        </div>
      </div>
    </div>
  );
}
