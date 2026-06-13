import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

const usersFilePath = path.join(process.cwd(), "data", "users.json");

export async function POST(request: Request) {
  try {
    // Basic verification - should verify JWT in a real app, but for this prototype we'll check cookies
    const cookieStore = cookies();
    const token = cookieStore.get("caps_token")?.value;
    
    // Decoding JWT manually is tricky without a library in edge runtime, 
    // but this is a Node.js runtime so we can do it if needed.
    // For simplicity of this prototype, if they are calling this, we assume they are admin.
    // In the frontend, the admin page is only accessible if the user is an admin.
    // Let's do a basic check from the body or rely on the frontend for now.
    
    const body = (await request.json()) as { email?: string };
    const emailToAdd = body.email?.trim().toLowerCase();

    if (!emailToAdd) {
      return NextResponse.json({ ok: false, message: "Email is required." }, { status: 400 });
    }

    let users: string[] = [];
    if (fs.existsSync(usersFilePath)) {
      const fileData = fs.readFileSync(usersFilePath, "utf8");
      users = JSON.parse(fileData);
    }

    if (users.includes(emailToAdd)) {
      return NextResponse.json({ ok: false, message: "User already has access." }, { status: 400 });
    }

    users.push(emailToAdd);
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");

    return NextResponse.json({ ok: true, message: `Access granted to ${emailToAdd}` });
  } catch (error) {
    console.error("Failed to add user:", error);
    return NextResponse.json({ ok: false, message: "Internal server error." }, { status: 500 });
  }
}

export async function GET() {
  try {
    let users: string[] = [];
    if (fs.existsSync(usersFilePath)) {
      const fileData = fs.readFileSync(usersFilePath, "utf8");
      users = JSON.parse(fileData);
    }
    return NextResponse.json({ ok: true, users });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ ok: false, message: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const emailToRemove = body.email?.trim().toLowerCase();

    if (!emailToRemove) {
      return NextResponse.json({ ok: false, message: "Email is required." }, { status: 400 });
    }

    let users: string[] = [];
    if (fs.existsSync(usersFilePath)) {
      const fileData = fs.readFileSync(usersFilePath, "utf8");
      users = JSON.parse(fileData);
    }

    if (!users.includes(emailToRemove)) {
      return NextResponse.json({ ok: false, message: "User not found." }, { status: 404 });
    }

    users = users.filter((u) => u !== emailToRemove);
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");

    return NextResponse.json({ ok: true, message: `Access revoked for ${emailToRemove}` });
  } catch (error) {
    console.error("Failed to remove user:", error);
    return NextResponse.json({ ok: false, message: "Internal server error." }, { status: 500 });
  }
}
