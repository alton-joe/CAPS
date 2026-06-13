"use client";

import { useMemo, useState } from "react";
import type { Student } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type Props = {
  data: Student[];
  onUpdated: (student: Student) => void;
  onDeleted: (id: string) => void;
};

export function StudentsTable({ data, onUpdated, onDeleted }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return data;

    return data.filter((student) => {
      return (
        student.fullName.toLowerCase().includes(normalized) ||
        student.rollNumber.toLowerCase().includes(normalized) ||
        student.section.toLowerCase().includes(normalized)
      );
    });
  }, [data, query]);

  async function deleteStudent(id: string) {
    const ok = window.confirm("Delete this student? This action cannot be undone.");
    if (!ok) return;

    const response = await fetch("/api/students", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const result = await response.json();
    if (response.ok && result.ok) {
      onDeleted(id);
    }
  }

  async function editStudent(student: Student) {
    const fullName = window.prompt("Update full name", student.fullName);
    if (!fullName) return;

    const section = window.prompt("Update section", student.section);
    if (!section) return;

    const response = await fetch("/api/students", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: student.id, fullName, section })
    });

    const result = await response.json();
    if (response.ok && result.ok) {
      onUpdated(result.data as Student);
    }
  }

  return (
    <section className="panel p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-slate-900">Students</h2>
        <input
          className="caps-input max-w-xs"
          placeholder="Search name / roll / section"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">Roll</th>
              <th className="px-2 py-2">Section</th>
              <th className="px-2 py-2">Email</th>
              <th className="px-2 py-2">Added On</th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.id} className="border-b border-slate-100">
                <td className="px-2 py-3 font-semibold text-slate-800">{student.fullName}</td>
                <td className="px-2 py-3 text-slate-600">{student.rollNumber}</td>
                <td className="px-2 py-3 text-slate-600">{student.section}</td>
                <td className="px-2 py-3 text-slate-600">{student.email}</td>
                <td className="px-2 py-3 text-slate-600">{formatDate(student.createdAt)}</td>
                <td className="px-2 py-3">
                  <div className="flex gap-2">
                    <button className="caps-btn-subtle px-3 py-1.5 text-xs" onClick={() => editStudent(student)}>
                      Edit
                    </button>
                    <button
                      className="caps-btn rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                      onClick={() => deleteStudent(student.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td className="px-2 py-4 text-center text-slate-500" colSpan={6}>
                  No students found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
