"use client";

import { useMemo, useState } from "react";
import type { StudentRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type Props = {
  data: StudentRecord[];
  onUpdated: (record: StudentRecord) => void;
  onDeleted: (id: string) => void;
};

export function RecordsTable({ data, onUpdated, onDeleted }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return data;

    return data.filter((record) => {
      return (
        record.studentName.toLowerCase().includes(normalized) ||
        record.type.toLowerCase().includes(normalized) ||
        record.date.toLowerCase().includes(normalized)
      );
    });
  }, [data, query]);

  async function deleteRecord(id: string) {
    const ok = window.confirm("Delete this record?");
    if (!ok) return;

    const response = await fetch("/api/records", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const result = await response.json();
    if (response.ok && result.ok) {
      onDeleted(id);
    }
  }

  async function editRecord(record: StudentRecord) {
    const note = window.prompt("Update note", record.note || "");
    if (note === null) return;

    const response = await fetch("/api/records", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: record.id, note })
    });

    const result = await response.json();
    if (response.ok && result.ok) {
      onUpdated(result.data as StudentRecord);
    }
  }

  function metricCell(record: StudentRecord) {
    if (record.type === "attendance") {
      return record.attendanceStatus || "-";
    }
    if (record.type === "grade") {
      return typeof record.gradeValue === "number" ? `${record.gradeValue}` : "-";
    }

    return "-";
  }

  return (
    <section className="panel p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-slate-900">Records</h2>
        <input
          className="caps-input max-w-xs"
          placeholder="Search student / type / date"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-2 py-2">Student</th>
              <th className="px-2 py-2">Type</th>
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2">Metric</th>
              <th className="px-2 py-2">Note</th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => (
              <tr key={record.id} className="border-b border-slate-100">
                <td className="px-2 py-3 font-semibold text-slate-800">{record.studentName}</td>
                <td className="px-2 py-3 text-slate-600">{record.type}</td>
                <td className="px-2 py-3 text-slate-600">{formatDate(record.date)}</td>
                <td className="px-2 py-3 text-slate-600">{metricCell(record)}</td>
                <td className="px-2 py-3 text-slate-600">{record.note || "-"}</td>
                <td className="px-2 py-3">
                  <div className="flex gap-2">
                    <button className="caps-btn-subtle px-3 py-1.5 text-xs" onClick={() => editRecord(record)}>
                      Edit
                    </button>
                    <button
                      className="caps-btn rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                      onClick={() => deleteRecord(record.id)}
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
                  No records found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
