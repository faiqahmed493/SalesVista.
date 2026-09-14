import type { VisualizationConfig } from "@/lib/visualization/types";

/**
 * Resolves or constructs a safe PostgreSQL/SQLite read-only query for a visualization payload.
 * If existingSqlQuery is provided, it is returned. Otherwise, constructs a fallback SELECT query
 * matching the config's xKey and series keys.
 */
export function resolveSqlQuery(config?: VisualizationConfig, existingSqlQuery?: string): string {
  if (existingSqlQuery && typeof existingSqlQuery === "string" && existingSqlQuery.trim()) {
    return existingSqlQuery.trim();
  }

  const xKey = config?.xKey ? config.xKey.trim() : "category";
  const seriesKeys = (config?.series || []).map((s) => s.key).filter(Boolean);

  if (xKey === "category" || xKey === "category_name") {
    const metricSelects = seriesKeys.length > 0
      ? seriesKeys.map((k) => `ROUND(SUM(o.${k}), 2) AS ${k}`).join(", ")
      : "ROUND(SUM(o.sales), 2) AS sales, ROUND(SUM(o.profit), 2) AS profit";

    return `SELECT c.category_name AS category, ${metricSelects} FROM orders o JOIN products p ON o.product_id = p.product_id JOIN categories c ON p.category_id = c.category_id GROUP BY c.category_name ORDER BY sales DESC`;
  }

  if (xKey === "month" || xKey === "order_date") {
    const metricSelects = seriesKeys.length > 0
      ? seriesKeys.map((k) => `ROUND(SUM(${k}), 2) AS ${k}`).join(", ")
      : "ROUND(SUM(sales), 2) AS sales, ROUND(SUM(profit), 2) AS profit";

    return `SELECT TO_CHAR(order_date, 'YYYY-MM') AS month, ${metricSelects} FROM orders GROUP BY month ORDER BY month ASC`;
  }

  if (xKey === "region") {
    const metricSelects = seriesKeys.length > 0
      ? seriesKeys.map((k) => `ROUND(SUM(${k}), 2) AS ${k}`).join(", ")
      : "ROUND(SUM(sales), 2) AS sales, ROUND(SUM(profit), 2) AS profit";

    return `SELECT region, ${metricSelects} FROM orders GROUP BY region ORDER BY sales DESC`;
  }

  // Generic fallback query builder
  const metricSelects = seriesKeys.length > 0
    ? seriesKeys.map((k) => `ROUND(SUM(${k}), 2) AS ${k}`).join(", ")
    : "ROUND(SUM(sales), 2) AS sales";

  return `SELECT ${xKey}, ${metricSelects} FROM orders GROUP BY ${xKey} ORDER BY ${xKey} ASC`;
}
