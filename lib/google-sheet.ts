import type { DashboardStats, Student, StudentRecord } from "@/lib/types";

type Action =
  | "listStudents"
  | "addStudent"
  | "updateStudent"
  | "deleteStudent"
  | "listRecords"
  | "addRecord"
  | "updateRecord"
  | "deleteRecord"
  | "dashboardStats";

type GoogleSheetResponse<T> = {
  ok: boolean;
  data: T;
  message?: string;
};

async function callGoogleSheet<T>(action: Action, payload?: Record<string, unknown>) {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!scriptUrl) {
    throw new Error("GOOGLE_APPS_SCRIPT_URL is missing in environment variables");
  }

  const apiKey = process.env.GOOGLE_APPS_SCRIPT_API_KEY;

  const response = await fetch(scriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "x-api-key": apiKey } : {})
    },
    body: JSON.stringify({
      action,
      payload: payload ?? {}
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Google Apps Script error: ${response.status}`);
  }

  const result = (await response.json()) as GoogleSheetResponse<T>;

  if (!result.ok) {
    throw new Error(result.message || "Google Apps Script returned error");
  }

  return result.data;
}

export async function fetchStudents() {
  return callGoogleSheet<Student[]>("listStudents");
}

export async function createStudent(student: Omit<Student, "id" | "createdAt">) {
  return callGoogleSheet<Student>("addStudent", student);
}

export async function editStudent(student: Partial<Student> & { id: string }) {
  return callGoogleSheet<Student>("updateStudent", student);
}

export async function removeStudent(id: string) {
  return callGoogleSheet<{ success: true }>("deleteStudent", { id });
}

export async function fetchRecords() {
  return callGoogleSheet<StudentRecord[]>("listRecords");
}

export async function createRecord(record: Omit<StudentRecord, "id" | "createdAt" | "studentName">) {
  return callGoogleSheet<StudentRecord>("addRecord", record);
}

export async function editRecord(record: Partial<StudentRecord> & { id: string }) {
  return callGoogleSheet<StudentRecord>("updateRecord", record);
}

export async function removeRecord(id: string) {
  return callGoogleSheet<{ success: true }>("deleteRecord", { id });
}

export async function fetchDashboardStats() {
  return callGoogleSheet<DashboardStats>("dashboardStats");
}
