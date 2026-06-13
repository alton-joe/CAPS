import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const gradesFilePath = path.join(process.cwd(), "data", "grades.json");

// Structure: { "Subject Name": { "student@caps.cu": "A", "other@caps.cu": "Ungraded" } }
export async function GET() {
  try {
    let grades = {};
    if (fs.existsSync(gradesFilePath)) {
      const fileData = fs.readFileSync(gradesFilePath, "utf8");
      grades = JSON.parse(fileData);
    }
    return NextResponse.json({ ok: true, grades });
  } catch (error) {
    console.error("Failed to fetch grades:", error);
    return NextResponse.json({ ok: false, message: "Internal server error." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { subjectName?: string; studentEmail?: string; grade?: string };
    const { subjectName, studentEmail, grade } = body;

    if (!subjectName || !studentEmail || !grade) {
      return NextResponse.json({ ok: false, message: "Missing required fields." }, { status: 400 });
    }

    let grades: Record<string, Record<string, string>> = {};
    if (fs.existsSync(gradesFilePath)) {
      const fileData = fs.readFileSync(gradesFilePath, "utf8");
      grades = JSON.parse(fileData);
    }

    if (!grades[subjectName]) {
      grades[subjectName] = {};
    }
    
    grades[subjectName][studentEmail] = grade;

    fs.writeFileSync(gradesFilePath, JSON.stringify(grades, null, 2), "utf8");

    return NextResponse.json({ ok: true, grades });
  } catch (error) {
    console.error("Failed to update grades:", error);
    return NextResponse.json({ ok: false, message: "Internal server error." }, { status: 500 });
  }
}
