import React from "react";
import type {
  HourlyWeatherPoint,
  DailyWeatherSummary,
} from "@/lib/data/weather/weatherTypes";
import {
  formatTemperatureC,
  formatWindKph,
  formatPrecipitationMm,
  uvIndexLabel,
} from "@/lib/utils/formatters";
import { getHourlyWindow } from "@/lib/utils/chartHelpers";

interface WeatherInsightsProps {
  hourly: HourlyWeatherPoint[];
  daily: DailyWeatherSummary[];
  observedAt: string;
}

interface InsightItem {
  emoji: string;
  label: string;
  value: string;
  sub?: string;
}

function deriveInsights(
  hourly: HourlyWeatherPoint[],
  daily: DailyWeatherSummary[],
  observedAt: string
): InsightItem[] {
  const next24 = getHourlyWindow(hourly, observedAt, 24);
  const today = daily[0];
  const weekTemps = daily.flatMap((d) => [d.temperatureMaxC, d.temperatureMinC]);

  // Temperature range today
  const tempRange = today
    ? `${formatTemperatureC(today.temperatureMinC)} — ${formatTemperatureC(today.temperatureMaxC)}`
    : "—";

  // Hottest hourly point next 24h
  const hottest = next24.reduce(
    (max, h) => (h.temperatureC > max.temperatureC ? h : max),
    next24[0]!
  );
  const coldest = next24.reduce(
    (min, h) => (h.temperatureC < min.temperatureC ? h : min),
    next24[0]!
  );

  // Total precipitation next 24h
  const totalPrecip = next24.reduce((sum, h) => sum + h.precipitation, 0);

  // Max wind gust next 24h
  const maxGust = next24.reduce(
    (max, h) => (h.windGustsKph > max ? h.windGustsKph : max),
    0
  );

  // Max UV index next 24h
  const maxUV = next24.reduce((max, h) => (h.uvIndex > max ? h.uvIndex : max), 0);

  // 7-day temperature spread
  const weekMax = Math.max(...weekTemps);
  const weekMin = Math.min(...weekTemps);

  return [
    {
      emoji: "🌡️",
      label: "Today's Range",
      value: tempRange,
    },
    {
      emoji: "🔥",
      label: "Hottest Hour",
      value: hottest
        ? `${hottest.time.slice(11, 16)} · ${formatTemperatureC(hottest.temperatureC)}`
        : "—",
    },
    {
      emoji: "🥶",
      label: "Coldest Hour",
      value: coldest
        ? `${coldest.time.slice(11, 16)} · ${formatTemperatureC(coldest.temperatureC)}`
        : "—",
    },
    {
      emoji: "🌧️",
      label: "Expected Rain (24h)",
      value: formatPrecipitationMm(totalPrecip),
    },
    {
      emoji: "💨",
      label: "Peak Gusts (24h)",
      value: formatWindKph(maxGust),
    },
    {
      emoji: "☀️",
      label: "Peak UV (24h)",
      value: `${maxUV.toFixed(1)} · ${uvIndexLabel(maxUV)}`,
    },
    {
      emoji: "📊",
      label: "7-Day Spread",
      value: `${formatTemperatureC(weekMin)} — ${formatTemperatureC(weekMax)}`,
    },
  ];
}

export default function WeatherInsights({
  hourly,
  daily,
  observedAt,
}: WeatherInsightsProps) {
  const insights = deriveInsights(hourly, daily, observedAt);

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px",
      }}
    >
      <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 2 }}>
        Weather Insights
      </h3>
      <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 16 }}>
        Derived from forecast data
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {insights.map((item, idx) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom:
                idx < insights.length - 1 ? "1px solid var(--border)" : "none",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>
                {item.emoji}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                  fontWeight: 500,
                }}
              >
                {item.label}
              </span>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--foreground)",
                textAlign: "right",
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
