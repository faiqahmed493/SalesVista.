import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const session = token ? await verifyToken(token) : null;
  const pathname = request.nextUrl.pathname;

  const protectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/chat") ||
    pathname.startsWith("/api/sales");
  const authPage = pathname === "/login" || pathname === "/register";

  if (protectedPath && !session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (authPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/api/chat/:path*",
    "/api/sales/:path*",
  ],
};
