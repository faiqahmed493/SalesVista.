import { NextRequest, NextResponse } from "next/server";
import { executeSalesQuery } from "@/lib/data/sales/salesService";
import { getSession } from "@/lib/auth/session";
import { resolveSqlQuery } from "@/lib/visualization/queryResolver";

export async function POST(request: NextRequest): Promise<Response> {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sqlQuery, config } = body || {};

    const targetQuery = resolveSqlQuery(config, sqlQuery);

    if (!targetQuery) {
      return NextResponse.json(
        { success: false, error: "Unable to resolve query string." },
        { status: 400 }
      );
    }

    console.log("⚡ [/api/insights/query]: Executing query ->", targetQuery);
    const data = await executeSalesQuery(targetQuery);
    console.log(`✅ [/api/insights/query]: Successfully returned ${data.length} rows.`);

    return NextResponse.json({
      success: true,
      data,
      sqlQuery: targetQuery,
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[/api/insights/query] Error executing query:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
