"use client";

import { FormEvent, useEffect, useState, useCallback } from "react";
import { CapsShell } from "@/components/caps-shell";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/access");
      const data = await res.json();
      if (data.ok && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch {
      // Handle silently or log
    }
  }, []);

  // Basic client-side check to prevent flashing for non-admins
  useEffect(() => {
    async function checkAccess() {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (!json.ok || json.user?.email !== "admin@caps.cu") {
          router.push("/home");
        } else {
          fetchUsers();
        }
      } catch {
        router.push("/home");
      }
    }
    checkAccess();
  }, [router, fetchUsers]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Failed to grant access");
      }

      setMessage({ text: result.message, type: "success" });
      setEmail("");
      fetchUsers();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Something went wrong", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function removeUser(emailToRemove: string) {
    if (!confirm(`Are you sure you want to revoke access for ${emailToRemove}?`)) return;
    
    try {
      const response = await fetch("/api/admin/access", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToRemove })
      });
      const result = await response.json();
      
      if (response.ok && result.ok) {
        fetchUsers();
      } else {
        alert(result.message || "Failed to remove user.");
      }
    } catch {
      alert("Something went wrong while removing the user.");
    }
  }

  return (
    <CapsShell>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-2 text-slate-500">Manage access and permissions for CAPS users.</p>
        </div>

        <section className="panel p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">Grant User Access</h2>
          <p className="mt-2 text-sm text-slate-600 mb-6">
            Enter an email address below to grant them student access to the portal. Their default password will be <strong>12345</strong>.
          </p>

          <form onSubmit={onSubmit} className="space-y-4 mb-8">
            <div>
              <label className="caps-label">User Email Address</label>
              <input
                type="email"
                className="caps-input"
                placeholder="student@caps.cu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                {message.text}
              </div>
            )}

            <button type="submit" className="caps-btn-primary w-full sm:w-auto" disabled={loading}>
              {loading ? "Granting Access..." : "Grant Access"}
            </button>
          </form>

          {users.length > 0 && (
            <div className="border-t border-slate-200 pt-8 mt-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Authorized Users</h3>
              <ul className="space-y-2">
                {users.map((u, idx) => (
                  <li key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-slate-700 font-medium">{u}</span>
                    </div>
                    <button 
                      onClick={() => removeUser(u)}
                      className="text-sm font-medium text-rose-600 hover:text-rose-800 transition-colors px-2 py-1 rounded hover:bg-rose-50"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </CapsShell>
  );
}
