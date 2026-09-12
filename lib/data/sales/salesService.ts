import { db } from "./db";
import type { DataRecord } from "@/lib/visualization/types";

const FORBIDDEN_KEYWORDS_REGEX = /\b(DROP|DELETE|UPDATE|INSERT|ALTER|ATTACH|PRAGMA)\b/i;

export async function executeSalesQuery(sql: string): Promise<DataRecord[]> {
  const sanitizedSql = sql
    .replace(/```sql/gi, "")
    .replace(/```/g, "")
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim();

  if (!/^(SELECT|WITH)\b/i.test(sanitizedSql)) {
    throw new Error("Invalid query: Query must start with SELECT or WITH.");
  }
  if (FORBIDDEN_KEYWORDS_REGEX.test(sanitizedSql)) {
    throw new Error("Invalid query: Mutating operations are strictly prohibited.");
  }
  console.log("🛡️ [GUARDRAIL CHECK]: Read-only query (SELECT/WITH) validated. Running query...");
  const result = await db.query(sanitizedSql);
  return result.rows as DataRecord[];
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

export async function getSalesDashboardData(): Promise<SalesDashboardData> {
  const kpiResult = await db.query(`
    SELECT
      COALESCE(ROUND(SUM(sales), 2), 0) AS "totalSales",
      COALESCE(ROUND(SUM(profit), 2), 0) AS "totalProfit",
      COALESCE(COUNT(DISTINCT order_id), 0) AS "totalOrders",
      COALESCE(ROUND(AVG(discount), 4), 0) AS "averageDiscount"
    FROM orders
  `);
  const salesByCategoryResult = await db.query(`
    SELECT c.category_name AS category,
      ROUND(SUM(o.sales), 2) AS sales, ROUND(SUM(o.profit), 2) AS profit
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    JOIN categories c ON p.category_id = c.category_id
    GROUP BY c.category_name ORDER BY sales DESC
  `);
  const monthlySalesTrendResult = await db.query(`
    SELECT TO_CHAR(order_date, 'YYYY-MM') AS month,
      ROUND(SUM(sales), 2) AS sales, ROUND(SUM(profit), 2) AS profit
    FROM orders
    GROUP BY month ORDER BY month ASC
  `);
  const kpiRow = kpiResult.rows[0] as Partial<DashboardKPIs> | undefined;
  return {
    kpis: {
      totalSales: Number(kpiRow?.totalSales ?? 0),
      totalProfit: Number(kpiRow?.totalProfit ?? 0),
      totalOrders: Number(kpiRow?.totalOrders ?? 0),
      averageDiscount: Number(kpiRow?.averageDiscount ?? 0),
    },
    salesByCategory: salesByCategoryResult.rows as DataRecord[],
    monthlySalesTrend: monthlySalesTrendResult.rows as DataRecord[],
  };
}
