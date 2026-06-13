"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CapsShell } from "@/components/caps-shell";
import { AttendanceChart } from "@/components/attendance-chart";
import { GradeChart } from "@/components/grade-chart";
import { StatCard } from "@/components/stat-card";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    overallAttendancePercent: "0.0",
    totalGradesAssigned: 0,
    totalSubjects: 0
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [gradesData, setGradesData] = useState([]);

  useEffect(() => {
    async function init() {
      // 1. Check Auth
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      
      if (!meData.ok || meData.user?.email !== "admin@caps.cu") {
        router.push("/home");
        return;
      }
      setIsAdmin(true);

      // 2. Fetch Dashboard Data
      const dashRes = await fetch("/api/dashboard");
      const dashJson = await dashRes.json();

      if (dashRes.ok && dashJson.ok) {
        setStats(dashJson.data.stats);
        setAttendanceData(dashJson.data.charts.attendance);
        setGradesData(dashJson.data.charts.grades);
      }

      setLoading(false);
    }

    void init();
  }, [router]);

  if (!isAdmin && !loading) return null; // Will redirect

  return (
    <CapsShell>
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-slate-500">Overview of student attendance and academic performance.</p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Students" value={`${stats.totalStudents}`} subtext="Active users in registry" />
          <StatCard label="Overall Attendance" value={`${stats.overallAttendancePercent}%`} subtext="Average across all events" />
          <StatCard label="Grades Assigned" value={`${stats.totalGradesAssigned}`} subtext="Total letter grades given" />
          <StatCard label="Tracked Subjects" value={`${stats.totalSubjects}`} subtext="Subjects with grades" />
        </section>

        {loading ? (
          <div className="panel p-8 text-center text-sm font-semibold text-slate-500">Loading analytics...</div>
        ) : (
          <section className="grid gap-5 xl:grid-cols-2">
            <AttendanceChart data={attendanceData} />
            <GradeChart data={gradesData} />
          </section>
        )}
      </div>
    </CapsShell>
  );
}
