"use client";

import * as XLSX from 'xlsx';
import { useEffect, useState, useCallback } from "react";
import { CapsShell } from "@/components/caps-shell";

const MOCK_SUBJECTS = [
  "Advanced Mathematics",
  "Computer Science 101",
  "Physics",
  "English Literature",
  "History"
];

const GRADES = ["Ungraded", "A", "B", "C", "D", "F"];

export default function GradesPage() {
  const [students, setStudents] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Format: { "Subject Name": { "student@caps.cu": "A", "other@caps.cu": "Ungraded" } }
  const [grades, setGrades] = useState<Record<string, Record<string, string>>>({});

  // Export State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "sheets">("csv");
  const [exportDate, setExportDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Auth State
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const fetchData = useCallback(async () => {
    try {
      // Fetch current user
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      let currentUserEmail = "";
      let adminFlag = false;
      
      if (meData.ok && meData.user) {
        currentUserEmail = meData.user.email;
        setUserEmail(currentUserEmail);
        if (currentUserEmail === "admin@caps.cu") {
          adminFlag = true;
          setIsAdmin(true);
        }
      }

      // Fetch students
      const usersRes = await fetch("/api/admin/access");
      const usersData = await usersRes.json();
      if (usersData.ok && Array.isArray(usersData.users)) {
        if (adminFlag) {
          setStudents(usersData.users);
        } else if (currentUserEmail) {
          setStudents(usersData.users.filter((u: string) => u === currentUserEmail));
        }
      }

      // Fetch saved grades
      const gradesRes = await fetch("/api/grades");
      const gradesData = await gradesRes.json();
      if (gradesData.ok && gradesData.grades) {
        setGrades(gradesData.grades);
      }
    } catch {
      // Handle error gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateGrade = async (studentEmail: string, newGrade: string) => {
    if (!selectedSubject) return;

    // Optimistic UI update
    setGrades((prev) => ({
      ...prev,
      [selectedSubject]: {
        ...prev[selectedSubject],
        [studentEmail]: newGrade
      }
    }));

    // Persist to backend
    try {
      await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName: selectedSubject,
          studentEmail,
          grade: newGrade
        })
      });
    } catch {
      console.error("Failed to save grade.");
    }
  };

  const gradedCount = selectedSubject 
    ? students.filter(s => {
        const g = grades[selectedSubject]?.[s];
        return g && g !== "Ungraded";
      }).length 
    : 0;

  const handleExportClick = (format: "csv" | "sheets") => {
    setExportFormat(format);
    setIsDropdownOpen(false);
    setIsModalOpen(true);
  };

  const downloadCSV = () => {
    if (!selectedSubject) return;
    
    // For export, we might want to include all students or just graded ones. 
    // Usually grades export includes all students to show who is missing grades.
    // The prompt asked for "people only who is marked as present" for attendance.
    // Let's export everyone for grades, or only graded. I'll export only graded to match attendance logic.
    const gradedStudents = students.filter(s => {
      const g = grades[selectedSubject]?.[s];
      return g && g !== "Ungraded";
    });
    
    if (exportFormat === "sheets") {
      let tsvContent = "Subject Name\tDate\tStudent Email\tGrade\n";
      gradedStudents.forEach(s => {
        const studentGrade = grades[selectedSubject]?.[s] || "Ungraded";
        tsvContent += `${selectedSubject}\t${exportDate}\t${s}\t${studentGrade}\n`;
      });
      
      navigator.clipboard.writeText(tsvContent).then(() => {
        alert("✅ Grades data copied!\n\nJust press Ctrl+V (or Cmd+V) to paste it into the blank Google Sheet that is opening.");
        window.open("https://sheets.new/", "_blank");
      }).catch(() => {
        alert("Failed to copy to clipboard. Please check your browser permissions.");
      });
    } else {
      let csvContent = "Subject Name,Date,Student Email,Grade\n";
      gradedStudents.forEach(s => {
        const studentGrade = grades[selectedSubject]?.[s] || "Ungraded";
        csvContent += `"${selectedSubject}"," ${exportDate}","${s}","${studentGrade}"\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${selectedSubject.replace(/\s+/g, "_")}_Grades.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    setIsModalOpen(false);
  };

  return (
    <CapsShell>
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Grades Tracker</h1>
          <p className="mt-2 text-slate-500">Select a subject to view the roster and assign student grades.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar: Subjects List */}
          <div className="col-span-1 space-y-3">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Subjects</h2>
            {MOCK_SUBJECTS.map((subjectName) => (
              <button
                key={subjectName}
                onClick={() => setSelectedSubject(subjectName)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedSubject === subjectName
                    ? "bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-500"
                    : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm"
                }`}
              >
                <div className={`font-semibold ${selectedSubject === subjectName ? "text-indigo-700" : "text-slate-700"}`}>
                  {subjectName}
                </div>
              </button>
            ))}
          </div>

          {/* Main Content: Student Roster */}
          <div className="col-span-1 md:col-span-2">
            {!selectedSubject ? (
              <div className="panel h-full min-h-[300px] flex items-center justify-center text-slate-500 bg-slate-50/50 border-dashed">
                <p>Please select a subject from the list.</p>
              </div>
            ) : (
              <div className="panel p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-100 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedSubject}</h2>
                    <span className="text-sm font-medium bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full mt-2 inline-block">
                      {students.length} Student{students.length !== 1 && 's'}
                    </span>
                  </div>
                  
                  {isAdmin && (
                    <div className="relative">
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="caps-btn-primary bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                      >
                        Export
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>

                      {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-slate-200">
                          <button onClick={() => handleExportClick("sheets")} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                            Google Sheet
                          </button>
                          <button onClick={() => handleExportClick("csv")} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                            .CSV
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {loading ? (
                  <p className="text-slate-500">Loading student roster...</p>
                ) : students.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p>No authorized students found.</p>
                    <p className="text-sm mt-1">Add students via the Admin dashboard first.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {students.map((studentEmail) => {
                      const currentGrade = grades[selectedSubject]?.[studentEmail] || "Ungraded";
                      
                      return (
                        <li key={studentEmail} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm transition-all hover:border-slate-300">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 font-bold text-sm uppercase">
                              {studentEmail.charAt(0)}
                            </div>
                            <span className="text-slate-800 font-medium truncate">{studentEmail}</span>
                          </div>
                          
                          <select
                            value={currentGrade}
                            onChange={(e) => isAdmin && updateGrade(studentEmail, e.target.value)}
                            disabled={!isAdmin}
                            className={`caps-input w-[140px] font-semibold text-sm ${
                              currentGrade !== "Ungraded" 
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                                : "bg-slate-50 border-slate-200 text-slate-600"
                            } ${!isAdmin ? "appearance-none bg-transparent border-transparent px-0 font-bold text-lg text-right" : ""}`}
                          >
                            {GRADES.map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Export Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Export Grades</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-indigo-50 text-indigo-800 p-4 rounded-lg flex items-center justify-between">
                  <span className="font-semibold text-sm">Graded Students</span>
                  <span className="text-xl font-bold">{gradedCount}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <div className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-4 py-2">
                    {selectedSubject}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={exportDate}
                    onChange={(e) => setExportDate(e.target.value)}
                    className="caps-input w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={downloadCSV}
                className="caps-btn-primary bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export Download
              </button>
            </div>
          </div>
        </div>
      )}
    </CapsShell>
  );
}
