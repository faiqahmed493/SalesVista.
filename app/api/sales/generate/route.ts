/**
 * POST /api/sales/generate
 * Generates and inserts a new simulated order into sales.db with the current timestamp.
 * Returns the newly created order and updated sales dashboard metrics.
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/data/sales/db";
import { getSalesDashboardData } from "@/lib/data/sales/salesService";
import { getSession } from "@/lib/auth/session";

export async function POST(): Promise<Response> {
  
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const today = new Date().toISOString().split("T")[0];
    const orderId = `SIM-${Date.now()}`;

    // Pick random foreign keys from database
    const customerResult = await db.query<{ customer_id: string }>(
      "SELECT customer_id FROM customers ORDER BY RANDOM() LIMIT 1"
    );
    const customer = customerResult.rows[0];

    const locationResult = await db.query<{ location_id: number }>(
      "SELECT location_id FROM locations ORDER BY RANDOM() LIMIT 1"
    );
    const location = locationResult.rows[0];

    const productResult = await db.query<{ product_id: string }>(
      "SELECT product_id FROM products ORDER BY RANDOM() LIMIT 1"
    );
    const product = productResult.rows[0];
    if (!customer || !location || !product) {
      throw new Error("Sales reference data is missing. Seed the database first.");
    }

    const quantity = Math.floor(Math.random() * 5) + 1;
    const sales = parseFloat((Math.random() * 450 + 50).toFixed(2));
    const discount = parseFloat((Math.random() * 0.2).toFixed(2));
    const profit = parseFloat((sales * (Math.random() * 0.3 + 0.1)).toFixed(2));
    const shipMode = "Standard Class";

    const insertResult = await db.query<{ row_id: number }>(`
      INSERT INTO orders (
        order_id, order_date, ship_date, ship_mode, customer_id, location_id, product_id, sales, quantity, discount, profit
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING row_id
    `, [orderId, today, today, shipMode, customer.customer_id, location.location_id,
      product.product_id, sales, quantity, discount, profit]);

    const newOrder = {
      row_id: Number(insertResult.rows[0].row_id),
      order_id: orderId,
      order_date: today,
      sales,
      profit,
      quantity,
      discount,
    };

    const updatedData = await getSalesDashboardData();

    return NextResponse.json(
      {
        success: true,
        message: "New simulated order created successfully.",
        order: newOrder,
        data: updatedData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[/api/sales/generate] Error creating order:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
