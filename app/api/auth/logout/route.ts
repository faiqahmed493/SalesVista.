import { NextResponse } from "next/server";

export async function POST(): Promise<Response> {
  const response = NextResponse.json({ success: true });

  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}