export type Role = "student";

export type Student = {
  id: string;
  fullName: string;
  email: string;
  rollNumber: string;
  section: string;
  phone?: string;
  createdAt: string;
};

export type AttendanceStatus = "present" | "absent" | "late";

export type RecordType = "attendance" | "grade";

export type StudentRecord = {
  id: string;
  studentId: string;
  studentName: string;
  type: RecordType;
  date: string;
  attendanceStatus?: AttendanceStatus;
  gradeValue?: number;
  note?: string;
  createdAt: string;
};

export type DashboardStats = {
  totalStudents: number;
  attendanceToday: number;
  averageGrade: number;
  monthlyAbsences: number;
};

export type AuthUser = {
  email: string;
  name: string;
};
