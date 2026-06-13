import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/admin", "/home", "/dashboard", "/students", "/records", "/analytics"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("caps_token")?.value;
  const path = request.nextUrl.pathname;

  const isProtected = protectedRoutes.some((route) => path === route || path.startsWith(`${route}/`));

  if (isProtected && !token) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/home/:path*", "/dashboard/:path*", "/students/:path*", "/records/:path*", "/analytics/:path*"]
};
