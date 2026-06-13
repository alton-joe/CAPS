"use client";

import { useMemo, useState } from "react";
import type { AttendanceStatus, Student, StudentRecord } from "@/lib/types";

type Props = {
  students: Student[];
  onCreated: (record: StudentRecord) => void;
};

const initialState = {
  studentId: "",
  type: "attendance",
  date: new Date().toISOString().slice(0, 10),
  attendanceStatus: "present",
  gradeValue: "",
  note: ""
};

export function RecordForm({ students, onCreated }: Props) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentOptions = useMemo(() => {
    return students.map((student) => ({ value: student.id, label: `${student.fullName} (${student.rollNumber})` }));
  }, [students]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.studentId) {
      setError("Please select a student first.");
      return;
    }

    const payload: Record<string, unknown> = {
      studentId: form.studentId,
      type: form.type,
      date: form.date,
      note: form.note.trim() || undefined
    };

    if (form.type === "attendance") {
      payload.attendanceStatus = form.attendanceStatus as AttendanceStatus;
    }

    if (form.type === "grade") {
      const grade = Number(form.gradeValue);
      if (Number.isNaN(grade) || grade < 0 || grade > 100) {
        setError("Grade must be a number between 0 and 100.");
        return;
      }
      payload.gradeValue = grade;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Could not add record");
      }

      onCreated(result.data as StudentRecord);
      setForm((prev) => ({ ...initialState, studentId: prev.studentId }));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="panel p-5" onSubmit={handleSubmit}>
      <h2 className="font-display text-xl font-bold text-slate-900">Log Attendance or Grade</h2>
      <p className="mt-1 text-sm text-slate-500">Save every entry directly to Google Sheets through Apps Script.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="caps-label">Student</label>
          <select
            className="caps-input"
            value={form.studentId}
            onChange={(event) => setForm((prev) => ({ ...prev, studentId: event.target.value }))}
            required
          >
            <option value="">Select student</option>
            {studentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="caps-label">Record Type</label>
          <select
            className="caps-input"
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
          >
            <option value="attendance">Attendance</option>
            <option value="grade">Grade</option>
          </select>
        </div>

        <div>
          <label className="caps-label">Date</label>
          <input
            type="date"
            className="caps-input"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
            required
          />
        </div>

        {form.type === "attendance" ? (
          <div>
            <label className="caps-label">Attendance</label>
            <select
              className="caps-input"
              value={form.attendanceStatus}
              onChange={(event) => setForm((prev) => ({ ...prev, attendanceStatus: event.target.value }))}
            >
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        ) : (
          <div>
            <label className="caps-label">Grade (0-100)</label>
            <input
              type="number"
              min={0}
              max={100}
              className="caps-input"
              value={form.gradeValue}
              onChange={(event) => setForm((prev) => ({ ...prev, gradeValue: event.target.value }))}
            />
          </div>
        )}

        <div>
          <label className="caps-label">Note</label>
          <input
            className="caps-input"
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            placeholder="Optional"
          />
        </div>
      </div>

      {error ? <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p> : null}

      <button className="caps-btn-primary mt-4 w-full" disabled={loading}>
        {loading ? "Saving..." : "Log Record"}
      </button>
    </form>
  );
}
