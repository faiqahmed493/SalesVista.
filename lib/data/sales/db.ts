import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "sales.db");

export const db: Database.Database = new Database(dbPath);

// Enable WAL mode and Foreign Keys
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

/**
 * Initializes the star schema tables for the Sales BI database if they do not exist.
 */
export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      category_id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_name TEXT NOT NULL,
      sub_category TEXT NOT NULL,
      UNIQUE(category_name, sub_category)
    );

    CREATE TABLE IF NOT EXISTS customers (
      customer_id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      segment TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS locations (
      location_id INTEGER PRIMARY KEY AUTOINCREMENT,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      postal_code TEXT,
      region TEXT NOT NULL,
      UNIQUE(country, city, state, postal_code, region)
    );

    CREATE TABLE IF NOT EXISTS products (
      product_id TEXT PRIMARY KEY,
      product_name TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(category_id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      row_id INTEGER PRIMARY KEY,
      order_id TEXT NOT NULL,
      order_date TEXT NOT NULL,
      ship_date TEXT NOT NULL,
      ship_mode TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      location_id INTEGER NOT NULL,
      product_id TEXT NOT NULL,
      sales REAL NOT NULL,
      quantity INTEGER NOT NULL,
      discount REAL NOT NULL,
      profit REAL NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
      FOREIGN KEY (location_id) REFERENCES locations(location_id),
      FOREIGN KEY (product_id) REFERENCES products(product_id)
    );
  `);
}

// Auto-initialize tables on module import
initDatabase();
