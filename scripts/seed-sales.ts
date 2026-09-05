import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { db, initDatabase } from "../lib/data/sales/db";

interface SuperstoreRow {
  "Row ID": string;
  "Order ID": string;
  "Order Date": string;
  "Ship Date": string;
  "Ship Mode": string;
  "Customer ID": string;
  "Customer Name": string;
  Segment: string;
  Country: string;
  City: string;
  State: string;
  "Postal Code"?: string;
  Region: string;
  "Product ID": string;
  Category: string;
  "Sub-Category": string;
  "Product Name": string;
  Sales: string;
  Quantity: string;
  Discount: string;
  Profit: string;
}

const BATCH_SIZE = 500;

function formatDate(dateStr: string): string {
  const parts = dateStr.trim().split("/");
  return parts.length === 3
    ? `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`
    : dateStr;
}

function makeValues<T>(
  rows: T[],
  columns: number,
  value: (row: T, column: number) => unknown
): { text: string; values: unknown[] } {
  const values: unknown[] = [];
  const placeholders = rows.map((row) => {
    const rowValues = Array.from({ length: columns }, (_, columnIndex) => {
      values.push(value(row, columnIndex));
      return `$${values.length}`;
    });
    return `(${rowValues.join(", ")})`;
  });
  return { text: placeholders.join(", "), values };
}

async function insertBatches<T>(
  client: { query: (text: string, values?: unknown[]) => Promise<unknown> },
  rows: T[],
  columns: number,
  statement: string,
  value: (row: T, column: number) => unknown
): Promise<void> {
  for (let index = 0; index < rows.length; index += BATCH_SIZE) {
    const batch = rows.slice(index, index + BATCH_SIZE);
    const generated = makeValues(batch, columns, value);
    await client.query(statement.replace("$VALUES", generated.text), generated.values);
  }
}

export async function seedSalesDatabase(): Promise<void> {
  await initDatabase();
  const csvPath = path.join(process.cwd(), "data", "superstore.csv");
  if (!fs.existsSync(csvPath)) throw new Error(`CSV file not found at path: ${csvPath}`);

  const records = parse(fs.readFileSync(csvPath, "utf-8"), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as SuperstoreRow[];
  console.log(`Parsed ${records.length} records. Beginning batched database seeding...`);

  const categories = [...new Map(records.map((row) => [
    `${row.Category}|||${row["Sub-Category"]}`,
    [row.Category, row["Sub-Category"]] as const,
  ])).values()];
  const customers = [...new Map(records.map((row) => [
    row["Customer ID"],
    [row["Customer ID"], row["Customer Name"], row.Segment] as const,
  ])).values()];
  const locations = [...new Map(records.map((row) => {
    const postalCode = row["Postal Code"] || "";
    return [
      `${row.Country}|||${row.City}|||${row.State}|||${postalCode}|||${row.Region}`,
      [row.Country, row.City, row.State, postalCode, row.Region] as const,
    ];
  })).values()];
  const products = [...new Map(records.map((row) => [
    row["Product ID"],
    [row["Product ID"], row["Product Name"], row.Category, row["Sub-Category"]] as const,
  ])).values()];

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("TRUNCATE orders, products, categories, customers, locations RESTART IDENTITY CASCADE");

    await insertBatches(client, categories, 2,
      "INSERT INTO categories (category_name, sub_category) VALUES $VALUES",
      (row, column) => row[column]);
    await insertBatches(client, customers, 3,
      "INSERT INTO customers (customer_id, customer_name, segment) VALUES $VALUES",
      (row, column) => row[column]);
    await insertBatches(client, locations, 5,
      "INSERT INTO locations (country, city, state, postal_code, region) VALUES $VALUES",
      (row, column) => row[column]);

    const categoryResult = await client.query(
      "SELECT category_id, category_name, sub_category FROM categories"
    ) as { rows: { category_id: number; category_name: string; sub_category: string }[] };
    const categoryIds = new Map(
      categoryResult.rows.map((row) => [`${row.category_name}|||${row.sub_category}`, row.category_id])
    );

    await insertBatches(client, products, 3,
      "INSERT INTO products (product_id, product_name, category_id) VALUES $VALUES",
      (row, column) => column === 2
        ? categoryIds.get(`${row[2]}|||${row[3]}`)
        : row[column]);

    const locationResult = await client.query(
      "SELECT location_id, country, city, state, postal_code, region FROM locations"
    ) as { rows: { location_id: number; country: string; city: string; state: string; postal_code: string | null; region: string }[] };
    const locationIds = new Map(
      locationResult.rows.map((row) => [
        `${row.country}|||${row.city}|||${row.state}|||${row.postal_code || ""}|||${row.region}`,
        row.location_id,
      ])
    );

    await insertBatches(client, records, 12,
      `INSERT INTO orders (
        row_id, order_id, order_date, ship_date, ship_mode, customer_id,
        location_id, product_id, sales, quantity, discount, profit
      ) VALUES $VALUES`,
      (row, column) => {
        const postalCode = row["Postal Code"] || "";
        const locationKey = `${row.Country}|||${row.City}|||${row.State}|||${postalCode}|||${row.Region}`;
        return [
          Number(row["Row ID"]), row["Order ID"], formatDate(row["Order Date"]),
          formatDate(row["Ship Date"]), row["Ship Mode"], row["Customer ID"],
          locationIds.get(locationKey), row["Product ID"], Number(row.Sales),
          Number(row.Quantity), Number(row.Discount), Number(row.Profit),
        ][column];
      });

    await client.query(`
      SELECT setval(
        pg_get_serial_sequence('orders', 'row_id'),
        COALESCE((SELECT MAX(row_id) FROM orders), 0) + 1,
        false
      )
    `);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  const counts = await Promise.all(["categories", "customers", "locations", "products", "orders"]
    .map(async (table) => [table, (await db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM ${table}`
    )).rows[0].count] as const));
  const countMap = new Map(counts);
  console.log("Seeding complete!");
  console.log(`- Categories: ${countMap.get("categories")}`);
  console.log(`- Customers:  ${countMap.get("customers")}`);
  console.log(`- Locations:  ${countMap.get("locations")}`);
  console.log(`- Products:   ${countMap.get("products")}`);
  console.log(`- Orders:     ${countMap.get("orders")}`);
}

seedSalesDatabase().catch((error) => {
  console.error("Seeding failed:", error);
  process.exitCode = 1;
});
