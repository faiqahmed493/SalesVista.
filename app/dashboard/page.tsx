import type { Metadata } from "next";
import { getSalesDashboardData } from "@/lib/data/sales/salesService";
import DashboardContainer from "@/components/dashboard/DashboardContainer";

export const metadata: Metadata = {
  title: "Sales Intelligence Dashboard",
  description:
    "Internal Sales Business Intelligence Dashboard using SQLite WAL and Superstore dataset.",
};

export default async function DashboardPage() {
  let initialData = null;
  try {
    initialData = await getSalesDashboardData();
  } catch (err) {
    console.error("Error loading initial sales dashboard data:", err);
  }

  return <DashboardContainer initialData={initialData} />;
}
