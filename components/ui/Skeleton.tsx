import React from "react";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/** Single skeleton bar/block with the CSS pulse animation defined in globals.css */
export function Skeleton({ className = "", style }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

/** KPI card skeleton (matches StatCard) */
export function KpiCardSkeleton() {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #F1F3F5",
        borderRadius: 20,
        padding: "20px 24px",
        boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Top row: Icon backdrop & menu option button placeholder */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Skeleton style={{ width: 40, height: 40, borderRadius: "50%" }} />
        <Skeleton style={{ width: 16, height: 16, borderRadius: 4 }} />
      </div>

      {/* Label & Metric */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 2 }}>
        <Skeleton style={{ height: 13, width: 80, borderRadius: 4 }} />
        <Skeleton style={{ height: 26, width: 120, borderRadius: 6, marginTop: 2 }} />
      </div>
    </div>
  );
}

/** Profit & Loss chart skeleton (matches ProfitLossChart) */
export function ProfitLossChartSkeleton({ height = 380 }: { height?: number }) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #F1F3F5",
        borderRadius: 20,
        padding: "20px 24px",
        boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        height: height,
        boxSizing: "border-box",
      }}
    >
      {/* Header Row: Title on Left, Legend Dots on Right */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <Skeleton style={{ height: 18, width: 220, borderRadius: 6 }} />

        {/* Color Legend Rectangles */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Skeleton style={{ width: 12, height: 8, borderRadius: 2 }} />
            <Skeleton style={{ height: 12, width: 36, borderRadius: 4 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Skeleton style={{ width: 12, height: 8, borderRadius: 2 }} />
            <Skeleton style={{ height: 12, width: 36, borderRadius: 4 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Skeleton style={{ width: 12, height: 8, borderRadius: 2 }} />
            <Skeleton style={{ height: 12, width: 30, borderRadius: 4 }} />
          </div>
        </div>
      </div>

      {/* Simulated Chart Body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", paddingTop: 10, paddingBottom: 30 }}>
        {/* Horizontal grid dashed lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ borderTop: "1px dashed #F1F3F5", width: "100%", height: 0 }} />
        ))}

        {/* Vertical bar pairs & simulated trend line */}
        <div
          style={{
            position: "absolute",
            inset: "10px 0 30px 0",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-around",
            paddingLeft: 20,
            paddingRight: 10,
          }}
        >
          {[60, 40, 75, 55, 85, 45, 65, 90, 70, 50, 80, 60].map((h, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
              <Skeleton style={{ width: 10, height: `${h}%`, borderRadius: "4px 4px 0 0" }} />
              <Skeleton style={{ width: 10, height: `${Math.max(20, h - 25)}%`, borderRadius: "4px 4px 0 0" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom DataZoom slider skeleton */}
      <div style={{ marginTop: "auto" }}>
        <Skeleton style={{ height: 16, width: "100%", borderRadius: 6 }} />
      </div>
    </div>
  );
}

/** Chart card skeleton fallback */
export const ChartSkeleton = ProfitLossChartSkeleton;

/** Sales by Category Donut Chart skeleton (matches CategoryDonutChart) */
export function CategoryDonutSkeleton() {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #F1F3F5",
        borderRadius: 20,
        padding: "16px 24px",
        boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <Skeleton style={{ height: 18, width: 140, borderRadius: 6 }} />
      </div>

      {/* Donut Ring Skeleton */}
      <div style={{ height: 210, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {/* Ring outer circle */}
        <Skeleton style={{ width: 150, height: 150, borderRadius: "50%" }} />
        {/* Ring inner cutout matching card background */}
        <div
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <Skeleton style={{ height: 10, width: 55, borderRadius: 4 }} />
          <Skeleton style={{ height: 18, width: 65, borderRadius: 4 }} />
        </div>
      </div>

      {/* Bottom Legend */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 4 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Skeleton style={{ width: 12, height: 8, borderRadius: 2 }} />
            <Skeleton style={{ height: 12, width: 60 - i * 8, borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Discount & Pricing Health Card skeleton (matches DiscountHealthCard) */
export function DiscountHealthSkeleton() {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #F1F3F5",
        borderRadius: 20,
        padding: "20px 24px",
        boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Skeleton style={{ height: 10, width: 85, borderRadius: 3 }} />
          <Skeleton style={{ height: 18, width: 130, borderRadius: 5 }} />
        </div>
        {/* Status badge pill */}
        <Skeleton style={{ height: 22, width: 64, borderRadius: 16 }} />
      </div>

      {/* Main KPI Stats */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Skeleton style={{ height: 22, width: 60, borderRadius: 5 }} />
          <Skeleton style={{ height: 12, width: 110, borderRadius: 4 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
          <Skeleton style={{ height: 20, width: 50, borderRadius: 5 }} />
          <Skeleton style={{ height: 12, width: 70, borderRadius: 4 }} />
        </div>
      </div>

      {/* Sparkline area box */}
      <div style={{ height: 75, width: "100%", margin: "-4px 0", display: "flex", alignItems: "flex-end" }}>
        <Skeleton style={{ height: "65%", width: "100%", borderRadius: 8 }} />
      </div>

      {/* Breakdown Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          paddingTop: 14,
          borderTop: "1px solid #F3F4F6",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Skeleton style={{ height: 11, width: 75, borderRadius: 3 }} />
          <Skeleton style={{ height: 16, width: 65, borderRadius: 4 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
          <Skeleton style={{ height: 11, width: 60, borderRadius: 3 }} />
          <Skeleton style={{ height: 16, width: 55, borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

/** Forecast card skeleton */
export function ForecastCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 min-w-[120px]">
      <Skeleton className="h-3 w-12 rounded" />
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-3 w-16 rounded" />
      <Skeleton className="h-4 w-14 rounded" />
      <Skeleton className="h-3 w-12 rounded" />
    </div>
  );
}

/** Insight card skeleton */
export function InsightSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <Skeleton className="h-4 w-28 rounded" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-1">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

