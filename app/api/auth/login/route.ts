import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/data/sales/db";
import { createToken } from "@/lib/auth/jwt";

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();

  const email = typeof body.email === "string"
    ? body.email.trim().toLowerCase()
    : "";
  const password = typeof body.password === "string" ? body.password : "";

  const result = await db.query<{
    id: string;
    name: string;
    email: string;
    password_hash: string;
  }>(
    `SELECT id, name, email, password_hash
     FROM users
     WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const token = await createToken({
    id: user.id,
    name: user.name,
    email: user.email,
  });

  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });

  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}