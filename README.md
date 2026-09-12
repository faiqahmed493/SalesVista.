# Sales Intelligence Dashboard

An authenticated sales business-intelligence dashboard built with Next.js, PostgreSQL, and React. It provides KPI cards, sales charts, and an AI assistant that converts natural-language questions into read-only SQL queries and visualizations.

## Features

- Sales KPIs: total sales, total profit, order count, and average discount.
- Sales-by-category and monthly sales/profit charts.
- Natural-language Text-to-SQL assistant with chart generation.
- PostgreSQL star-schema data model based on the Superstore dataset.
- JWT authentication for dashboard and API access.
- Read-only SQL guardrails for AI-generated queries.
- Seed script for loading `data/superstore.csv`.

## Tech Stack

- Next.js 16 with App Router
- React 19 and TypeScript
- PostgreSQL with `pg`
- ECharts and Recharts
- Google Gemini, with Groq and OpenRouter fallback providers
- JWT authentication using `jose`

## Project Structure

```text
app/
  api/
    auth/       Authentication endpoints
    chat/       AI Text-to-SQL endpoint
    sales/      Dashboard data endpoint
  dashboard/    Authenticated dashboard page
  login/        Login page
  register/     Registration page
components/    Dashboard, chat, chart, and UI components
lib/
  ai/           Prompting, providers, and response validation
  auth/         JWT and session helpers
  data/sales/   PostgreSQL connection and sales queries
  visualization/Chart types and rendering helpers
scripts/        Database seeding script
data/           Superstore CSV source data
```

## Requirements

- Node.js 20 or newer
- PostgreSQL database
- An AI provider API key

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root:

   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/sales
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=replace_with_a_long_random_secret
   ```

   Optional fallback providers:

   ```env
   GROQ_API_KEY=your_groq_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   GEMINI_MODEL=gemini-2.5-flash
   GROQ_MODEL=openai/gpt-oss-20b
   OPENROUTER_MODEL=openrouter/free
   ```

3. Initialize and load the Superstore data:

   ```bash
   npm run seed
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`, register an account, and sign in.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Initialize and repopulate the sales database |

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Authenticate and create a session |
| `POST` | `/api/auth/logout` | End the current session |
| `GET` | `/api/sales` | Return dashboard KPIs and chart data |
| `POST` | `/api/chat` | Generate and execute a validated read-only sales query |

All dashboard, sales, and chat endpoints require an authenticated session.

## Data Model

The database contains:

- `categories`
- `customers`
- `locations`
- `products`
- `orders`

The `orders` table stores order dates, shipping information, customer/location/product references, sales, quantity, discount, and profit.

## SQL Safety

AI-generated SQL must be a `SELECT` query. Mutating keywords such as `INSERT`, `UPDATE`, `DELETE`, `DROP`, and `ALTER` are rejected before execution.

## Validation

Run these commands before deployment:

```bash
npm run lint
npm run build
```

The project currently has pre-existing lint and TypeScript issues in visualization files unrelated to this documentation.
