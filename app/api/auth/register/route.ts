import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/data/sales/db";
import { createToken } from "@/lib/auth/jwt";

function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string"
    ? body.email.trim().toLowerCase()
    : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || !email || password.length < 8) {
    return NextResponse.json(
      { error: "Name, valid email, and password of at least 8 characters are required." },
      { status: 400 }
    );
  }

  const existing = await db.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existing.rowCount) {
    return NextResponse.json(
      { error: "Unable to create account with these details." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await db.query<{
    id: string;
    name: string;
    email: string;
  }>(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email`,
    [name, email, passwordHash]
  );

  const user = result.rows[0];
  const token = await createToken(user);

  const response = NextResponse.json(
    { success: true, user },
    { status: 201 }
  );

  setAuthCookie(response, token);
  return response;
}