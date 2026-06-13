"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  data: { event: string; present: number; absent: number }[];
};

export function AttendanceChart({ data }: Props) {
  return (
    <div className="panel p-5">
      <h2 className="font-display text-xl font-bold text-slate-900">Attendance by Event</h2>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-72 text-slate-500">
          No attendance data available yet.
        </div>
      ) : (
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe7f3" />
              <XAxis dataKey="event" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
              <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
