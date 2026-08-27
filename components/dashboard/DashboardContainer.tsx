"use client";

import React, { useState, useCallback } from "react";
import type { WeatherDashboardData } from "@/lib/data/weather/weatherTypes";
import type { WeatherError } from "@/lib/data/weather/weatherTypes";
import type { LocationConfig } from "@/lib/data/locations";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KpiGrid from "@/components/dashboard/KpiGrid";
import ForecastGrid from "@/components/dashboard/ForecastGrid";
import SunriseSunsetCard from "@/components/dashboard/SunriseSunsetCard";
import WeatherInsights from "@/components/dashboard/WeatherInsights";
import TemperatureChart from "@/components/charts/TemperatureChart";
import PrecipitationChart from "@/components/charts/PrecipitationChart";
import WindChart from "@/components/charts/WindChart";
import HumidityPressureChart from "@/components/charts/HumidityPressureChart";
import {
  KpiCardSkeleton,
  ChartSkeleton,
  ForecastCardSkeleton,
  InsightSkeleton,
} from "@/components/ui/Skeleton";

interface DashboardContainerProps {
  initialData: WeatherDashboardData | null;
  initialLocationId: string;
  initialError: WeatherError | null;
  locations: LocationConfig[];
}

export default function DashboardContainer({
  initialData,
  initialLocationId,
  initialError,
  locations,
}: DashboardContainerProps) {
  const [data, setData] = useState<WeatherDashboardData | null>(initialData);
  const [locationId, setLocationId] = useState(initialLocationId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<WeatherError | null>(initialError);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(
    initialData ? new Date() : null
  );

  const fetchWeather = useCallback(
    async (locId: string, forceRefresh = false) => {
      setIsLoading(true);
      setError(null);
      try {
        const url = `/api/weather?location=${locId}${forceRefresh ? "&refresh=true" : ""}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
          setLastRefreshed(new Date());
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError({
          kind: "network_failure",
          message:
            "Could not fetch weather data. Check your connection and try again.",
          cause: err,
        });
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleLocationChange = useCallback(
    (newLocationId: string) => {
      setLocationId(newLocationId);
      // Keep existing data visible while loading new location
      fetchWeather(newLocationId);
    },
    [fetchWeather]
  );

  const handleRefresh = useCallback(() => {
    fetchWeather(locationId, true);
  }, [fetchWeather, locationId]);

  const showFullSkeleton = isLoading && !data;

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      {/* ── Sticky Header ─────────────────────────────────────────────── */}
      <DashboardHeader
        data={data}
        locations={locations}
        selectedLocationId={locationId}
        isLoading={isLoading}
        lastRefreshed={lastRefreshed}
        onLocationChange={handleLocationChange}
        onRefresh={handleRefresh}
      />

      {/* ── Loading overlay (for location changes with existing data) ── */}
      {isLoading && data && (
        <div
          style={{
            position: "fixed",
            top: 72,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 24,
            padding: "8px 18px",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--muted-foreground)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}
        >
          <SpinnerDot />
          Fetching fresh data…
        </div>
      )}

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "28px 24px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          opacity: isLoading && data ? 0.55 : 1,
          transition: "opacity 0.3s",
          pointerEvents: isLoading ? "none" : "auto",
        }}
      >
        {/* ── Error state (no data at all) ─────────────────────────── */}
        {error && !data && (
          <ErrorPanel
            error={error}
            onRetry={() => fetchWeather(locationId, true)}
          />
        )}

        {/* ── Section 1: KPI Cards ──────────────────────────────────── */}
        <section aria-label="Key metrics">
          {showFullSkeleton ? (
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
          ) : data ? (
            <KpiGrid current={data.current} today={data.daily[0]} />
          ) : null}
        </section>

        {/* ── Section 2 + 7: Temperature Chart + Sunrise Sidebar ───── */}
        <section
          style={{ display: "grid", gap: 20 }}
          className="grid-cols-1 lg:grid-cols-3"
          aria-label="Temperature and sun"
        >
          <div className="lg:col-span-2">
            {showFullSkeleton ? (
              <ChartSkeleton height={280} />
            ) : data ? (
              <TemperatureChart
                hourly={data.hourly}
                observedAt={data.current.observedAt}
              />
            ) : null}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {showFullSkeleton ? (
              <>
                <InsightSkeleton />
              </>
            ) : data ? (
              <SunriseSunsetCard today={data.daily[0]!} />
            ) : null}
          </div>
        </section>

        {/* ── Sections 3 & 4: Precipitation + Wind ─────────────────── */}
        <section
          style={{ display: "grid", gap: 20 }}
          className="grid-cols-1 md:grid-cols-2"
          aria-label="Precipitation and wind"
        >
          {showFullSkeleton ? (
            <>
              <ChartSkeleton height={240} />
              <ChartSkeleton height={240} />
            </>
          ) : data ? (
            <>
              <PrecipitationChart
                hourly={data.hourly}
                observedAt={data.current.observedAt}
              />
              <WindChart
                hourly={data.hourly}
                observedAt={data.current.observedAt}
              />
            </>
          ) : null}
        </section>

        {/* ── Sections 5 & 8: Humidity/Pressure + Insights ─────────── */}
        <section
          style={{ display: "grid", gap: 20 }}
          className="grid-cols-1 md:grid-cols-2"
          aria-label="Humidity, pressure and insights"
        >
          {showFullSkeleton ? (
            <>
              <ChartSkeleton height={240} />
              <InsightSkeleton />
            </>
          ) : data ? (
            <>
              <HumidityPressureChart
                hourly={data.hourly}
                observedAt={data.current.observedAt}
              />
              <WeatherInsights
                hourly={data.hourly}
                daily={data.daily}
                observedAt={data.current.observedAt}
              />
            </>
          ) : null}
        </section>

        {/* ── Section 6: 7-Day Forecast ─────────────────────────────── */}
        <section aria-label="7-day forecast">
          {showFullSkeleton ? (
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <div style={{ display: "flex", gap: 12, overflowX: "hidden" }}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <ForecastCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : data ? (
            <ForecastGrid daily={data.daily} />
          ) : null}
        </section>

        {/* ── Footer ────────────────────────────────────────────────── */}
        {data && (
          <footer
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
              paddingTop: 8,
              borderTop: "1px solid var(--border)",
            }}
          >
            <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
              Data source:{" "}
              <a
                href="https://open-meteo.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)", textDecoration: "none" }}
              >
                Open-Meteo
              </a>{" "}
              · Free & open weather API · No API key required
            </p>
            <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
              {data.metadata.hourlyCount}h hourly · {data.metadata.dailyCount} days ·{" "}
              Generated in {data.metadata.generationTimeMs.toFixed(0)}ms
            </p>
          </footer>
        )}
      </main>
    </div>
  );
}

/* ── Internal sub-components ────────────────────────────────────────────── */

function SpinnerDot() {
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "var(--accent)",
        animation: "pulseDot 1s ease-in-out infinite",
        display: "inline-block",
      }}
    >
      <style>{`@keyframes pulseDot { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
    </span>
  );
}

function ErrorPanel({
  error,
  onRetry,
}: {
  error: WeatherError;
  onRetry: () => void;
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: 36 }}>⚠️</span>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)" }}>
        Unable to load weather data
      </h2>
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", maxWidth: 400 }}>
        [{error.kind}] {error.message}
      </p>
      <button
        onClick={onRetry}
        style={{
          marginTop: 8,
          padding: "9px 20px",
          background: "var(--accent)",
          color: "var(--accent-foreground)",
          border: "none",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
