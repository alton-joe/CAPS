import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAPS Attendance Management",
  description: "Attendance and grade management system powered by Google Sheets"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
