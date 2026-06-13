/*
  Google Apps Script backend for CAPS
  Deploy as Web App and set execute access according to your need.
*/

const SHEET_NAMES = {
  students: "Students",
  records: "Records"
};

function doPost(e) {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty("API_KEY");
    const incomingKey = e.parameter.apiKey || (e.postData && JSON.parse(e.postData.contents || "{}").apiKey);

    if (apiKey && incomingKey !== apiKey) {
      return jsonResponse({ ok: false, message: "Unauthorized" });
    }

    const body = JSON.parse((e.postData && e.postData.contents) || "{}");
    const action = body.action;
    const payload = body.payload || {};

    const result = routeAction(action, payload);
    return jsonResponse({ ok: true, data: result });
  } catch (error) {
    return jsonResponse({ ok: false, message: error.message || "Unexpected error" });
  }
}

function routeAction(action, payload) {
  ensureSheets();

  switch (action) {
    case "listStudents":
      return listStudents();
    case "addStudent":
      return addStudent(payload);
    case "updateStudent":
      return updateStudent(payload);
    case "deleteStudent":
      return deleteStudent(payload.id);
    case "listRecords":
      return listRecords();
    case "addRecord":
      return addRecord(payload);
    case "updateRecord":
      return updateRecord(payload);
    case "deleteRecord":
      return deleteRecord(payload.id);
    case "dashboardStats":
      return dashboardStats();
    default:
      throw new Error("Unknown action: " + action);
  }
}

function ensureSheets() {
  const ss = SpreadsheetApp.getActive();

  let studentSheet = ss.getSheetByName(SHEET_NAMES.students);
  if (!studentSheet) {
    studentSheet = ss.insertSheet(SHEET_NAMES.students);
    studentSheet.appendRow(["id", "fullName", "email", "rollNumber", "section", "phone", "createdAt"]);
  }

  let recordSheet = ss.getSheetByName(SHEET_NAMES.records);
  if (!recordSheet) {
    recordSheet = ss.insertSheet(SHEET_NAMES.records);
    recordSheet.appendRow([
      "id",
      "studentId",
      "studentName",
      "type",
      "date",
      "attendanceStatus",
      "gradeValue",
      "note",
      "createdAt"
    ]);
  }
}

function listStudents() {
  const rows = readRows(SHEET_NAMES.students);
  return rows.map((r) => ({
    id: r["id"],
    fullName: r["fullName"],
    email: r["email"],
    rollNumber: r["rollNumber"],
    section: r["section"],
    phone: r["phone"],
    createdAt: r["createdAt"]
  }));
}

function addStudent(payload) {
  const id = uid();
  const createdAt = nowIso();

  appendRow(SHEET_NAMES.students, [
    id,
    payload.fullName || "",
    payload.email || "",
    payload.rollNumber || "",
    payload.section || "",
    payload.phone || "",
    createdAt
  ]);

  return {
    id: id,
    fullName: payload.fullName || "",
    email: payload.email || "",
    rollNumber: payload.rollNumber || "",
    section: payload.section || "",
    phone: payload.phone || "",
    createdAt: createdAt
  };
}

function updateStudent(payload) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.students);
  const data = sheet.getDataRange().getValues();
  const header = data[0];

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(payload.id)) {
      const row = data[i];
      const next = {
        id: row[0],
        fullName: payload.fullName || row[1],
        email: payload.email || row[2],
        rollNumber: payload.rollNumber || row[3],
        section: payload.section || row[4],
        phone: payload.phone || row[5],
        createdAt: row[6]
      };

      const values = header.map((key) => next[key]);
      sheet.getRange(i + 1, 1, 1, values.length).setValues([values]);
      return next;
    }
  }

  throw new Error("Student not found");
}

function deleteStudent(id) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.students);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }

  throw new Error("Student not found");
}

function listRecords() {
  const rows = readRows(SHEET_NAMES.records);
  return rows.map((r) => ({
    id: r["id"],
    studentId: r["studentId"],
    studentName: r["studentName"],
    type: r["type"],
    date: r["date"],
    attendanceStatus: r["attendanceStatus"],
    gradeValue: r["gradeValue"] === "" ? null : Number(r["gradeValue"]),
    note: r["note"],
    createdAt: r["createdAt"]
  }));
}

function addRecord(payload) {
  const students = listStudents();
  const student = students.find((s) => String(s.id) === String(payload.studentId));
  if (!student) {
    throw new Error("Student does not exist");
  }

  const id = uid();
  const createdAt = nowIso();

  appendRow(SHEET_NAMES.records, [
    id,
    payload.studentId || "",
    student.fullName,
    payload.type || "attendance",
    payload.date || nowIso().slice(0, 10),
    payload.attendanceStatus || "",
    payload.gradeValue === undefined ? "" : payload.gradeValue,
    payload.note || "",
    createdAt
  ]);

  return {
    id: id,
    studentId: payload.studentId || "",
    studentName: student.fullName,
    type: payload.type || "attendance",
    date: payload.date || nowIso().slice(0, 10),
    attendanceStatus: payload.attendanceStatus || undefined,
    gradeValue: payload.gradeValue === undefined ? undefined : Number(payload.gradeValue),
    note: payload.note || "",
    createdAt: createdAt
  };
}

function updateRecord(payload) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.records);
  const data = sheet.getDataRange().getValues();
  const header = data[0];

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(payload.id)) {
      const row = data[i];
      const next = {
        id: row[0],
        studentId: row[1],
        studentName: row[2],
        type: payload.type || row[3],
        date: payload.date || row[4],
        attendanceStatus: payload.attendanceStatus || row[5],
        gradeValue: payload.gradeValue === undefined ? row[6] : payload.gradeValue,
        note: payload.note === undefined ? row[7] : payload.note,
        createdAt: row[8]
      };

      const values = header.map((key) => next[key]);
      sheet.getRange(i + 1, 1, 1, values.length).setValues([values]);

      return {
        id: next.id,
        studentId: next.studentId,
        studentName: next.studentName,
        type: next.type,
        date: next.date,
        attendanceStatus: next.attendanceStatus || undefined,
        gradeValue: next.gradeValue === "" ? undefined : Number(next.gradeValue),
        note: next.note || "",
        createdAt: next.createdAt
      };
    }
  }

  throw new Error("Record not found");
}

function deleteRecord(id) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.records);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }

  throw new Error("Record not found");
}

function dashboardStats() {
  const students = listStudents();
  const records = listRecords();

  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  const currentMonth = today.slice(0, 7);

  const attendanceToday = records.filter((r) => r.type === "attendance" && String(r.date).slice(0, 10) === today).length;
  const gradeRows = records.filter((r) => r.type === "grade" && typeof r.gradeValue === "number");

  const averageGrade = gradeRows.length
    ? gradeRows.reduce((sum, item) => sum + Number(item.gradeValue || 0), 0) / gradeRows.length
    : 0;

  const monthlyAbsences = records.filter(
    (r) => r.type === "attendance" && String(r.date).slice(0, 7) === currentMonth && r.attendanceStatus === "absent"
  ).length;

  return {
    totalStudents: students.length,
    attendanceToday: attendanceToday,
    averageGrade: Number(averageGrade.toFixed(2)),
    monthlyAbsences: monthlyAbsences
  };
}

function readRows(sheetName) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  const values = sheet.getDataRange().getValues();

  if (!values.length) return [];

  const header = values[0];
  return values.slice(1).map((row) => {
    const obj = {};
    for (let i = 0; i < header.length; i++) {
      obj[header[i]] = row[i];
    }
    return obj;
  });
}

function appendRow(sheetName, values) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  sheet.appendRow(values);
}

function uid() {
  return Utilities.getUuid();
}

function nowIso() {
  return new Date().toISOString();
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
