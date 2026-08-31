/**
 * POST /api/sales/generate
 * Generates and inserts a new simulated order into sales.db with the current timestamp.
 * Returns the newly created order and updated sales dashboard metrics.
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/data/sales/db";
import { getSalesDashboardData } from "@/lib/data/sales/salesService";

export async function POST(): Promise<Response> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const orderId = `SIM-${Date.now()}`;

    // Pick random foreign keys from database
    const customer = (db
      .prepare("SELECT customer_id FROM customers ORDER BY RANDOM() LIMIT 1")
      .get() as { customer_id: string }) ?? { customer_id: "CG-12520" };

    const location = (db
      .prepare("SELECT location_id FROM locations ORDER BY RANDOM() LIMIT 1")
      .get() as { location_id: number }) ?? { location_id: 1 };

    const product = (db
      .prepare("SELECT product_id FROM products ORDER BY RANDOM() LIMIT 1")
      .get() as { product_id: string }) ?? { product_id: "FUR-BO-10001798" };

    const quantity = Math.floor(Math.random() * 5) + 1;
    const sales = parseFloat((Math.random() * 450 + 50).toFixed(2));
    const discount = parseFloat((Math.random() * 0.2).toFixed(2));
    const profit = parseFloat((sales * (Math.random() * 0.3 + 0.1)).toFixed(2));
    const shipMode = "Standard Class";

    const insertStmt = db.prepare(`
      INSERT INTO orders (
        order_id, order_date, ship_date, ship_mode, customer_id, location_id, product_id, sales, quantity, discount, profit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = insertStmt.run(
      orderId,
      today,
      today,
      shipMode,
      customer.customer_id,
      location.location_id,
      product.product_id,
      sales,
      quantity,
      discount,
      profit
    );

    const newOrder = {
      row_id: Number(info.lastInsertRowid),
      order_id: orderId,
      order_date: today,
      sales,
      profit,
      quantity,
      discount,
    };

    const updatedData = getSalesDashboardData();

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
