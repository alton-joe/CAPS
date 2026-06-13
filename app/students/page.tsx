"use client";

import { useEffect, useState } from "react";
import { CapsShell } from "@/components/caps-shell";
import { StudentForm } from "@/components/student-form";
import { StudentsTable } from "@/components/students-table";
import type { Student } from "@/lib/types";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/students");
      const result = await response.json();

      if (response.ok && result.ok) {
        setStudents(result.data as Student[]);
      }

      setLoading(false);
    }

    void load();
  }, []);

  return (
    <CapsShell>
      <div className="grid gap-5 xl:grid-cols-[380px,1fr]">
        <StudentForm onCreated={(student) => setStudents((prev) => [student, ...prev])} />
        {loading ? (
          <div className="panel p-8 text-center text-sm font-semibold text-slate-500">Loading students...</div>
        ) : (
          <StudentsTable
            data={students}
            onUpdated={(updated) =>
              setStudents((prev) => prev.map((student) => (student.id === updated.id ? updated : student)))
            }
            onDeleted={(id) => setStudents((prev) => prev.filter((student) => student.id !== id))}
          />
        )}
      </div>
    </CapsShell>
  );
}
