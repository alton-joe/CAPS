"use client";

import { useEffect, useState } from "react";
import { CapsShell } from "@/components/caps-shell";
import Link from "next/link";
import type { Route } from "next";

function HomeCard({ title, description, href }: { title: string; description: string; href: Route }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <Link href={href} className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700">
        Open &rarr;
      </Link>
    </div>
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState("");
  const [greeting, setGreeting] = useState("Good day,");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    
    const day = now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    const month = now.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
    const dateNum = now.getDate();
    setDateString(`${day} • ${month} ${dateNum}`);

    const hour = now.getHours();
    let baseGreeting = "Good day";
    if (hour < 12) baseGreeting = "Good morning";
    else if (hour < 17) baseGreeting = "Good afternoon";
    else baseGreeting = "Good evening";

    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json.ok && json.user) {
          const role = json.user.email === "admin@caps.cu" ? "Admin" : "Student";
          setGreeting(`${baseGreeting}, ${role}`);
          if (role === "Admin") setIsAdmin(true);
        } else {
          setGreeting(`${baseGreeting},`);
        }
      } catch {
        setGreeting(`${baseGreeting},`);
      }
    }
    fetchUser();
  }, []);

  return (
    <CapsShell>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">{dateString}</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-slate-900">{greeting}</h1>
          <p className="mt-2 text-lg text-slate-500">Welcome to your attendance and academic management portal.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <HomeCard
            title="Attendance"
            description="View and manage your daily attendance records."
            href="/attendance"
          />
          <HomeCard
            title="Grades"
            description="Check your latest academic grades and performance."
            href="/grades"
          />
          {isAdmin && (
            <>
              <HomeCard
                title="Dashboard"
                description="Get an overview of overall statistics and analytics."
                href="/dashboard"
              />
              <HomeCard
                title="Admin"
                description="Manage users and platform access settings."
                href="/admin"
              />
            </>
          )}
        </div>
      </div>
    </CapsShell>
  );
}
