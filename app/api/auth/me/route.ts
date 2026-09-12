import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/data/sales/db";

export async function GET(): Promise<Response> {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Query PostgreSQL database for the user using their authenticated session ID
    const result = await db.query<{
      id: string;
      name: string;
      email: string;
    }>(
      `SELECT id, name, email FROM users WHERE id = $1`,
      [session.id]
    );

    const dbUser = result.rows[0];

    if (!dbUser) {
      return NextResponse.json({
        success: true,
        user: {
          id: session.id,
          name: session.name,
          email: session.email,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: dbUser,
    });
  } catch (err) {
    return NextResponse.json({
      success: true,
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
      },
    });
  }
}
