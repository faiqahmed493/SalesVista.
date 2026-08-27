import React from "react";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/** Single skeleton bar/block with the CSS pulse animation defined in globals.css */
export function Skeleton({ className = "", style }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

/** Full KPI card skeleton */
export function KpiCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
      <Skeleton className="h-9 w-20 rounded mt-1" />
      <Skeleton className="h-3 w-28 rounded" />
    </div>
  );
}

/** Chart card skeleton */
export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-36 rounded" />
        <Skeleton className="h-7 w-24 rounded-lg" />
      </div>
      <Skeleton className="w-full rounded-lg" style={{ height }} />
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
