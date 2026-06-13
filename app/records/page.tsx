"use client";

import { useEffect, useState } from "react";
import { CapsShell } from "@/components/caps-shell";
import { RecordForm } from "@/components/record-form";
import { RecordsTable } from "@/components/records-table";
import type { Student, StudentRecord } from "@/lib/types";

export default function RecordsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [studentsRes, recordsRes] = await Promise.all([fetch("/api/students"), fetch("/api/records")]);
      const studentsJson = await studentsRes.json();
      const recordsJson = await recordsRes.json();

      if (studentsRes.ok && studentsJson.ok) {
        setStudents(studentsJson.data as Student[]);
      }

      if (recordsRes.ok && recordsJson.ok) {
        setRecords(recordsJson.data as StudentRecord[]);
      }

      setLoading(false);
    }

    void load();
  }, []);

  return (
    <CapsShell>
      <div className="grid gap-5 xl:grid-cols-[380px,1fr]">
        <RecordForm students={students} onCreated={(record) => setRecords((prev) => [record, ...prev])} />
        {loading ? (
          <div className="panel p-8 text-center text-sm font-semibold text-slate-500">Loading records...</div>
        ) : (
          <RecordsTable
            data={records}
            onUpdated={(updated) =>
              setRecords((prev) => prev.map((record) => (record.id === updated.id ? updated : record)))
            }
            onDeleted={(id) => setRecords((prev) => prev.filter((record) => record.id !== id))}
          />
        )}
      </div>
    </CapsShell>
  );
}
