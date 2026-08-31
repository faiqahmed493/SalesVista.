import { db } from "./db";
import type { DataRecord } from "@/lib/visualization/types";

const FORBIDDEN_KEYWORDS_REGEX = /\b(DROP|DELETE|UPDATE|INSERT|ALTER|ATTACH|PRAGMA)\b/i;

/**
 * Validates and executes a raw SQL query.
 * Enforces that the query starts with SELECT and contains no mutating SQL keywords.
 */
export function executeSalesQuery(sql: string): DataRecord[] {
  // Strip leading SQL comments (single-line -- or multi-line /* ... */) and whitespace
  const sanitizedSql = sql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim();

  if (!/^SELECT\b/i.test(sanitizedSql)) {
    throw new Error("Invalid query: Query must start with SELECT.");
  }

  if (FORBIDDEN_KEYWORDS_REGEX.test(sanitizedSql)) {
    throw new Error(
      "Invalid query: Mutating operations (DROP, DELETE, UPDATE, INSERT, ALTER, ATTACH, PRAGMA) are strictly prohibited."
    );
  }

  const stmt = db.prepare(sql);
  return stmt.all() as DataRecord[];
}

export interface DashboardKPIs {
  totalSales: number;
  totalProfit: number;
  totalOrders: number;
  averageDiscount: number;
}

export interface SalesDashboardData {
  kpis: DashboardKPIs;
  salesByCategory: DataRecord[];
  monthlySalesTrend: DataRecord[];
}

/**
 * Computes baseline KPIs and initial breakdown metrics for the Sales BI Dashboard.
 */
export function getSalesDashboardData(): SalesDashboardData {
  const kpiRow = db
    .prepare(
      `
    SELECT
      COALESCE(ROUND(SUM(sales), 2), 0) as totalSales,
      COALESCE(ROUND(SUM(profit), 2), 0) as totalProfit,
      COALESCE(COUNT(DISTINCT order_id), 0) as totalOrders,
      COALESCE(ROUND(AVG(discount), 4), 0) as averageDiscount
    FROM orders
  `
    )
    .get() as DashboardKPIs;

  const salesByCategory = db
    .prepare(
      `
    SELECT
      c.category_name as category,
      ROUND(SUM(o.sales), 2) as sales,
      ROUND(SUM(o.profit), 2) as profit
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    JOIN categories c ON p.category_id = c.category_id
    GROUP BY c.category_name
    ORDER BY sales DESC
  `
    )
    .all() as DataRecord[];

  const monthlySalesTrend = db
    .prepare(
      `
    SELECT
      strftime('%Y-%m', order_date) as month,
      ROUND(SUM(sales), 2) as sales,
      ROUND(SUM(profit), 2) as profit
    FROM orders
    GROUP BY month
    ORDER BY month ASC
  `
    )
    .all() as DataRecord[];

  return {
    kpis: {
      totalSales: kpiRow?.totalSales ?? 0,
      totalProfit: kpiRow?.totalProfit ?? 0,
      totalOrders: kpiRow?.totalOrders ?? 0,
      averageDiscount: kpiRow?.averageDiscount ?? 0,
    },
    salesByCategory,
    monthlySalesTrend,
  };
}
