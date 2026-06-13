"use client";

import { useEffect, useMemo, useState } from "react";
import { CapsShell } from "@/components/caps-shell";
import { AttendanceChart } from "@/components/attendance-chart";
import { GradeChart } from "@/components/grade-chart";
import type { StudentRecord } from "@/lib/types";

export default function AnalyticsPage() {
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/records");
      const result = await response.json();

      if (response.ok && result.ok) {
        setRecords(result.data as StudentRecord[]);
      }

      setLoading(false);
    }

    void load();
  }, []);

  const insights = useMemo(() => {
    const attendance = records.filter((r) => r.type === "attendance");
    const grades = records.filter((r) => r.type === "grade" && typeof r.gradeValue === "number");

    const presentRate = attendance.length
      ? (attendance.filter((r) => r.attendanceStatus === "present").length / attendance.length) * 100
      : 0;

    const atRisk = grades.filter((r) => (r.gradeValue || 0) < 40).length;

    return {
      presentRate,
      atRisk,
      totalAttendance: attendance.length,
      totalGrades: grades.length
    };
  }, [records]);

  return (
    <CapsShell>
      {loading ? (
        <div className="panel p-8 text-center text-sm font-semibold text-slate-500">Loading analytics...</div>
      ) : (
        <div className="space-y-5">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="panel p-5">
              <p className="text-sm font-semibold text-slate-500">Present Rate</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-slate-900">{insights.presentRate.toFixed(1)}%</p>
            </article>
            <article className="panel p-5">
              <p className="text-sm font-semibold text-slate-500">At-Risk Grades (&lt;40)</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-slate-900">{insights.atRisk}</p>
            </article>
            <article className="panel p-5">
              <p className="text-sm font-semibold text-slate-500">Attendance Records</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-slate-900">{insights.totalAttendance}</p>
            </article>
            <article className="panel p-5">
              <p className="text-sm font-semibold text-slate-500">Grade Records</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-slate-900">{insights.totalGrades}</p>
            </article>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <AttendanceChart records={records} />
            <GradeChart records={records} />
          </section>
        </div>
      )}
    </CapsShell>
  );
}
