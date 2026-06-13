"use client";

import { useState } from "react";
import type { Student } from "@/lib/types";
import { toTitleCase } from "@/lib/utils";

type Props = {
  onCreated: (student: Student) => void;
};

const initialState = {
  fullName: "",
  email: "",
  rollNumber: "",
  section: "",
  phone: ""
};

export function StudentForm({ onCreated }: Props) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fullName: toTitleCase(form.fullName),
          section: form.section.toUpperCase()
        })
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Could not add student");
      }

      onCreated(result.data as Student);
      setForm(initialState);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="panel p-5" onSubmit={handleSubmit}>
      <h2 className="font-display text-xl font-bold text-slate-900">Add New Student</h2>
      <p className="mt-1 text-sm text-slate-500">Register students before logging attendance or grades.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="caps-label">Full Name</label>
          <input
            className="caps-input"
            value={form.fullName}
            onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
            required
          />
        </div>
        <div>
          <label className="caps-label">Email</label>
          <input
            type="email"
            className="caps-input"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </div>
        <div>
          <label className="caps-label">Roll Number</label>
          <input
            className="caps-input"
            value={form.rollNumber}
            onChange={(event) => setForm((prev) => ({ ...prev, rollNumber: event.target.value }))}
            required
          />
        </div>
        <div>
          <label className="caps-label">Section</label>
          <input
            className="caps-input"
            value={form.section}
            onChange={(event) => setForm((prev) => ({ ...prev, section: event.target.value }))}
            required
          />
        </div>
        <div>
          <label className="caps-label">Phone (Optional)</label>
          <input
            className="caps-input"
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          />
        </div>
      </div>

      {error ? <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p> : null}

      <button className="caps-btn-primary mt-4 w-full" disabled={loading}>
        {loading ? "Saving..." : "Add Student"}
      </button>
    </form>
  );
}
