import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";
import fs from "fs";
import path from "path";
export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();

  if (!email || !password) {
    return NextResponse.json({ ok: false, message: "Email and password are required." }, { status: 400 });
  }

  let name = "";

  const usersFilePath = path.join(process.cwd(), "data", "users.json");
  let allowedUsers: string[] = [];
  if (fs.existsSync(usersFilePath)) {
    const fileData = fs.readFileSync(usersFilePath, "utf8");
    try {
      allowedUsers = JSON.parse(fileData);
    } catch {
      // ignore parse errors
    }
  }

  if (email === "admin@caps.cu" && password === "13579") {
    name = "CAPS Admin";
  } else if (
    (password === "12345" || (email === "student@caps.cu" && password === "24680")) &&
    allowedUsers.includes(email)
  ) {
    name = "CAPS Student";
  } else {
    return NextResponse.json({ ok: false, message: "Invalid credentials or unauthorized." }, { status: 401 });
  }

  const token = createSessionToken({ email, name });
  const response = NextResponse.json({ ok: true, user: { email, name } });

  response.cookies.set({
    name: "caps_token",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  return response;
}
