import { NextResponse } from "next/server";
import { getAuthUserFromCookie } from "@/lib/auth";

export async function GET() {
  const user = getAuthUserFromCookie();
  if (!user) {
    return NextResponse.json({ ok: false, user: null }, { status: 401 });
  }

  return NextResponse.json({ ok: true, user });
}
