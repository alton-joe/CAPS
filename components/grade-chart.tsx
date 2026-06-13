"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  data: { grade: string; count: number }[];
};

export function GradeChart({ data }: Props) {
  // Define colors for each grade
  const renderCustomBar = (props: any) => {
    const { fill, x, y, width, height, grade } = props;
    let color = "#cbd5e1"; // default
    if (grade === "A") color = "#10b981"; // emerald
    else if (grade === "B") color = "#3b82f6"; // blue
    else if (grade === "C") color = "#f59e0b"; // amber
    else if (grade === "D") color = "#f97316"; // orange
    else if (grade === "F") color = "#ef4444"; // red

    return <rect x={x} y={y} width={width} height={height} fill={color} rx={4} ry={4} />;
  };

  return (
    <div className="panel p-5">
      <h2 className="font-display text-xl font-bold text-slate-900">Grade Distribution</h2>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-72 text-slate-500">
          No grades assigned yet.
        </div>
      ) : (
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe7f3" />
              <XAxis dataKey="grade" />
              <YAxis allowDecimals={false} />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar dataKey="count" shape={renderCustomBar} name="Total Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
