import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const attendanceFilePath = path.join(process.cwd(), "data", "attendance.json");

// Structure: { "Event Name": { "student@caps.cu": true, "other@caps.cu": false } }
export async function GET() {
  try {
    let attendance = {};
    if (fs.existsSync(attendanceFilePath)) {
      const fileData = fs.readFileSync(attendanceFilePath, "utf8");
      attendance = JSON.parse(fileData);
    }
    return NextResponse.json({ ok: true, attendance });
  } catch (error) {
    console.error("Failed to fetch attendance:", error);
    return NextResponse.json({ ok: false, message: "Internal server error." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { eventName?: string; studentEmail?: string; isPresent?: boolean };
    const { eventName, studentEmail, isPresent } = body;

    if (!eventName || !studentEmail || isPresent === undefined) {
      return NextResponse.json({ ok: false, message: "Missing required fields." }, { status: 400 });
    }

    let attendance: Record<string, Record<string, boolean>> = {};
    if (fs.existsSync(attendanceFilePath)) {
      const fileData = fs.readFileSync(attendanceFilePath, "utf8");
      attendance = JSON.parse(fileData);
    }

    if (!attendance[eventName]) {
      attendance[eventName] = {};
    }
    
    attendance[eventName][studentEmail] = isPresent;

    fs.writeFileSync(attendanceFilePath, JSON.stringify(attendance, null, 2), "utf8");

    return NextResponse.json({ ok: true, attendance });
  } catch (error) {
    console.error("Failed to update attendance:", error);
    return NextResponse.json({ ok: false, message: "Internal server error." }, { status: 500 });
  }
}
