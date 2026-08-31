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

/**
 * Converts date strings from M/D/YYYY or MM/DD/YYYY to standard ISO YYYY-MM-DD.
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.trim().split("/");
  if (parts.length === 3) {
    const month = parts[0].padStart(2, "0");
    const day = parts[1].padStart(2, "0");
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

export function seedSalesDatabase(): void {
  console.log("Initializing database schema...");
  initDatabase();

  const csvPath = path.join(process.cwd(), "data", "superstore.csv");
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at path: ${csvPath}`);
  }

  console.log(`Reading dataset from ${csvPath}...`);
  const fileContent = fs.readFileSync(csvPath, "utf-8");
  const records: SuperstoreRow[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Parsed ${records.length} records. Beginning database seeding...`);

  // Prepared statements
  const insertCategoryStmt = db.prepare(
    "INSERT INTO categories (category_name, sub_category) VALUES (?, ?)"
  );
  const insertCustomerStmt = db.prepare(
    "INSERT OR IGNORE INTO customers (customer_id, customer_name, segment) VALUES (?, ?, ?)"
  );
  const insertLocationStmt = db.prepare(
    "INSERT INTO locations (country, city, state, postal_code, region) VALUES (?, ?, ?, ?, ?)"
  );
  const insertProductStmt = db.prepare(
    "INSERT OR IGNORE INTO products (product_id, product_name, category_id) VALUES (?, ?, ?)"
  );
  const insertOrderStmt = db.prepare(
    `INSERT OR REPLACE INTO orders (
      row_id, order_id, order_date, ship_date, ship_mode, customer_id, location_id, product_id, sales, quantity, discount, profit
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const categoryMap = new Map<string, number>();
  const locationMap = new Map<string, number>();

  const seedTransaction = db.transaction(() => {
    // Clear existing data to allow fresh seed
    db.prepare("DELETE FROM orders").run();
    db.prepare("DELETE FROM products").run();
    db.prepare("DELETE FROM categories").run();
    db.prepare("DELETE FROM customers").run();
    db.prepare("DELETE FROM locations").run();

    for (const row of records) {
      // 1. Category
      const catKey = `${row.Category}|||${row["Sub-Category"]}`;
      let categoryId = categoryMap.get(catKey);
      if (!categoryId) {
        const res = insertCategoryStmt.run(row.Category, row["Sub-Category"]);
        categoryId = Number(res.lastInsertRowid);
        categoryMap.set(catKey, categoryId);
      }

      // 2. Customer
      insertCustomerStmt.run(
        row["Customer ID"],
        row["Customer Name"],
        row.Segment
      );

      // 3. Location
      const postalCode = row["Postal Code"] || "";
      const locKey = `${row.Country}|||${row.City}|||${row.State}|||${postalCode}|||${row.Region}`;
      let locationId = locationMap.get(locKey);
      if (!locationId) {
        const res = insertLocationStmt.run(
          row.Country,
          row.City,
          row.State,
          postalCode,
          row.Region
        );
        locationId = Number(res.lastInsertRowid);
        locationMap.set(locKey, locationId);
      }

      // 4. Product
      insertProductStmt.run(
        row["Product ID"],
        row["Product Name"],
        categoryId
      );

      // 5. Order
      insertOrderStmt.run(
        parseInt(row["Row ID"], 10),
        row["Order ID"],
        formatDate(row["Order Date"]),
        formatDate(row["Ship Date"]),
        row["Ship Mode"],
        row["Customer ID"],
        locationId,
        row["Product ID"],
        parseFloat(row.Sales),
        parseInt(row.Quantity, 10),
        parseFloat(row.Discount),
        parseFloat(row.Profit)
      );
    }
  });

  seedTransaction();

  const categoryCount = (
    db.prepare("SELECT COUNT(*) as count FROM categories").get() as {
      count: number;
    }
  ).count;
  const customerCount = (
    db.prepare("SELECT COUNT(*) as count FROM customers").get() as {
      count: number;
    }
  ).count;
  const locationCount = (
    db.prepare("SELECT COUNT(*) as count FROM locations").get() as {
      count: number;
    }
  ).count;
  const productCount = (
    db.prepare("SELECT COUNT(*) as count FROM products").get() as {
      count: number;
    }
  ).count;
  const orderCount = (
    db.prepare("SELECT COUNT(*) as count FROM orders").get() as {
      count: number;
    }
  ).count;

  console.log("Seeding complete!");
  console.log(`- Categories: ${categoryCount}`);
  console.log(`- Customers:  ${customerCount}`);
  console.log(`- Locations:  ${locationCount}`);
  console.log(`- Products:   ${productCount}`);
  console.log(`- Orders:     ${orderCount}`);
}

// Run when executed directly
seedSalesDatabase();
