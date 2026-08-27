import {
  KpiCardSkeleton,
  ChartSkeleton,
  ForecastCardSkeleton,
  InsightSkeleton,
} from "@/components/ui/Skeleton";

/**
 * Suspense fallback for the /dashboard route.
 * Shown while the Server Component fetches initial weather data.
 */
export default function DashboardLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      {/* Header skeleton */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--card)",
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="skeleton" style={{ height: 18, width: 160, borderRadius: 6 }} />
          <div className="skeleton" style={{ height: 11, width: 240, borderRadius: 4 }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="skeleton" style={{ height: 34, width: 140, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 34, width: 90, borderRadius: 8 }} />
        </div>
      </div>

      {/* Content skeleton */}
      <main
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "28px 24px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* KPI row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16,
          }}
          className="sm:grid-cols-3 lg:grid-cols-6"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>

        {/* Main chart + sidebar */}
        <div
          style={{ display: "grid", gap: 20 }}
          className="grid-cols-1 lg:grid-cols-3"
        >
          <div className="lg:col-span-2">
            <ChartSkeleton height={280} />
          </div>
          <InsightSkeleton />
        </div>

        {/* Supporting charts */}
        <div
          style={{ display: "grid", gap: 20 }}
          className="grid-cols-1 md:grid-cols-2"
        >
          <ChartSkeleton height={240} />
          <ChartSkeleton height={240} />
        </div>

        <div
          style={{ display: "grid", gap: 20 }}
          className="grid-cols-1 md:grid-cols-2"
        >
          <ChartSkeleton height={240} />
          <InsightSkeleton />
        </div>

        {/* Forecast */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <ForecastCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
