import crypto from "crypto";
import { cookies } from "next/headers";
import type { AuthUser } from "@/lib/types";

const COOKIE_NAME = "caps_token";

type SessionPayload = {
  email: string;
  name: string;
  iat: number;
  exp: number;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(content: string) {
  const secret = process.env.JWT_SECRET || "caps-demo-secret-key";
  return crypto.createHmac("sha256", secret).update(content).digest("base64url");
}

export function createSessionToken(user: AuthUser, hours = 12) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    email: user.email,
    name: user.name,
    iat: now,
    exp: now + hours * 60 * 60
  };

  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encoded);

  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [payloadPart, signaturePart] = token.split(".");
    if (!payloadPart || !signaturePart) {
      return null;
    }

    const expected = sign(payloadPart);
    if (expected !== signaturePart) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(payloadPart)) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function setAuthCookie(token: string) {
  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export function clearAuthCookie() {
  cookies().delete(COOKIE_NAME);
}

export function getAuthUserFromCookie(): AuthUser | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return null;
  }

  return {
    email: payload.email,
    name: payload.name
  };
}
