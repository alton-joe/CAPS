"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Route } from "next";
import { Logo } from "@/components/logo";
import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
};

export function CapsShell({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json.ok && json.user?.email === "admin@caps.cu") {
          setIsAdmin(true);
        }
      } catch (e) {}
    }
    checkUser();
  }, []);

  const navItems = [
    { href: "/home" as Route, label: "Home" },
    { href: "/attendance" as Route, label: "Attendance" },
    { href: "/grades" as Route, label: "Grades" }
  ];

  if (isAdmin) {
    navItems.push({ href: "/dashboard" as Route, label: "Dashboard" });
    navItems.push({ href: "/admin" as Route, label: "Admin" });
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen w-full bg-slate-50/50">
      <header className="relative flex w-full items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center">
          <Logo className="h-14 w-auto" />
        </div>
        <nav className="hidden md:flex flex-none items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname === "/dashboard" && item.label === "Dashboard");
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-1 items-center justify-end">
          <button onClick={logout} className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Logout
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
