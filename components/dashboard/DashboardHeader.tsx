"use client";

import React from "react";
import type { WeatherDashboardData } from "@/lib/data/weather/weatherTypes";
import type { LocationConfig } from "@/lib/data/locations";
import LocationSelector from "@/components/dashboard/LocationSelector";
import RefreshButton from "@/components/dashboard/RefreshButton";
import { wmoCodeEmoji, wmoCodeDescription } from "@/lib/utils/formatters";

interface DashboardHeaderProps {
  data: WeatherDashboardData | null;
  locations: LocationConfig[];
  selectedLocationId: string;
  isLoading: boolean;
  lastRefreshed: Date | null;
  onLocationChange: (locationId: string) => void;
  onRefresh: () => void;
}

export default function DashboardHeader({
  data,
  locations,
  selectedLocationId,
  isLoading,
  lastRefreshed,
  onLocationChange,
  onRefresh,
}: DashboardHeaderProps) {
  const condition = data?.current
    ? `${wmoCodeEmoji(data.current.weatherCode)} ${wmoCodeDescription(data.current.weatherCode)}`
    : null;

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--card)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Left: title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em" }}>
              Weather Analytics
            </span>
            {condition && (
              <span
                style={{
                  fontSize: 11,
                  color: "var(--muted-foreground)",
                  background: "var(--muted)",
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  padding: "2px 10px",
                  fontWeight: 500,
                  display: "none",
                }}
                className="sm:inline-block"
              >
                {condition}
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: 11,
              color: "var(--muted-foreground)",
              display: "none",
            }}
            className="sm:block"
          >
            Real-time weather intelligence and forecast analytics
          </span>
        </div>

        {/* Right: controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <LocationSelector
            locations={locations}
            selected={selectedLocationId}
            onSelect={onLocationChange}
            disabled={isLoading}
          />
          <RefreshButton
            onRefresh={onRefresh}
            isLoading={isLoading}
            lastRefreshed={lastRefreshed}
          />
        </div>
      </div>
    </header>
  );
}
