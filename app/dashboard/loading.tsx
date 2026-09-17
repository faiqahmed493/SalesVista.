import {
  KpiCardSkeleton,
  ProfitLossChartSkeleton,
  CategoryDonutSkeleton,
  DiscountHealthSkeleton,
} from "@/components/ui/Skeleton";

/**
 * Suspense fallback for the /dashboard route.
 */
export default function DashboardLoading() {
  return (
    <div className="dashboard-container" style={{ padding: "24px 16px 48px", maxWidth: 1400, margin: "0 auto" }}>
      <div
        className="dashboard-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 8fr) minmax(0, 4fr)",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Left Parent Container */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Row 1: 3 KPI Cards */}
          <div className="dashboard-kpis" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </div>

          {/* Row 2: Profit & Loss Trend Chart Skeleton */}
          <ProfitLossChartSkeleton height={380} />
        </div>

        {/* Right Parent Container */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <CategoryDonutSkeleton />
          <DiscountHealthSkeleton />
        </div>
      </div>
    </div>
  );
}

