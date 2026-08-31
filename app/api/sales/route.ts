/**
 * GET /api/sales
 * Returns baseline KPIs and breakdown metrics for the Sales BI Dashboard.
 */

import { NextResponse } from "next/server";
import { getSalesDashboardData } from "@/lib/data/sales/salesService";

export async function GET(): Promise<Response> {
  try {
    const data = getSalesDashboardData();
    return NextResponse.json({ success: true, data }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[/api/sales] Error fetching sales data:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
