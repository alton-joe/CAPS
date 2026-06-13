import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const usersPath = path.join(process.cwd(), "data", "users.json");
    const attendancePath = path.join(process.cwd(), "data", "attendance.json");
    const gradesPath = path.join(process.cwd(), "data", "grades.json");

    let totalStudents = 0;
    if (fs.existsSync(usersPath)) {
      const usersData = JSON.parse(fs.readFileSync(usersPath, "utf8"));
      if (Array.isArray(usersData)) totalStudents = usersData.length;
      else if (usersData.users) totalStudents = usersData.users.length;
    }

    let attendanceData: Record<string, Record<string, boolean>> = {};
    if (fs.existsSync(attendancePath)) {
      attendanceData = JSON.parse(fs.readFileSync(attendancePath, "utf8"));
    }

    let gradesData: Record<string, Record<string, string>> = {};
    if (fs.existsSync(gradesPath)) {
      gradesData = JSON.parse(fs.readFileSync(gradesPath, "utf8"));
    }

    // Compute Attendance Stats & Chart Data
    let totalAttendanceMarks = 0;
    let presentMarks = 0;
    let eventStats: { event: string; present: number; absent: number }[] = [];

    for (const [eventName, studentsObj] of Object.entries(attendanceData)) {
      let eventPresent = 0;
      for (const [student, isPresent] of Object.entries(studentsObj)) {
        if (isPresent) {
          presentMarks++;
          eventPresent++;
        }
      }
      
      const eventAbsent = totalStudents - eventPresent;
      totalAttendanceMarks += totalStudents; 
      
      eventStats.push({
        event: eventName,
        present: eventPresent,
        absent: eventAbsent < 0 ? 0 : eventAbsent // Safeguard
      });
    }

    const overallAttendancePercent = totalAttendanceMarks > 0 
      ? ((presentMarks / totalAttendanceMarks) * 100).toFixed(1) 
      : "0.0";

    // Compute Grades Stats & Chart Data
    let gradesDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    let totalGradesAssigned = 0;
    let totalSubjects = Object.keys(gradesData).length;

    for (const [subjectName, studentsObj] of Object.entries(gradesData)) {
      for (const [student, grade] of Object.entries(studentsObj)) {
        if (grade && grade !== "Ungraded") {
          totalGradesAssigned++;
          if (gradesDistribution[grade] !== undefined) {
            gradesDistribution[grade]++;
          }
        }
      }
    }

    const gradesChartData = Object.entries(gradesDistribution).map(([grade, count]) => ({
      grade,
      count
    }));

    return NextResponse.json({
      ok: true,
      data: {
        stats: {
          totalStudents,
          overallAttendancePercent,
          totalGradesAssigned,
          totalSubjects
        },
        charts: {
          attendance: eventStats,
          grades: gradesChartData
        }
      }
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
