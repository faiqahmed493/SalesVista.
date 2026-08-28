import React from "react";
import type { CurrentWeather, DailyWeatherSummary } from "@/lib/data/weather/weatherTypes";
import {
  formatTemperatureCRound,
  formatTemperatureC,
  formatPercent,
  formatWindKph,
  formatPrecipitationMm,
  windDirectionLabel,
  wmoCodeDescription,
  wmoCodeEmoji,
  uvIndexLabel,
} from "@/lib/utils/formatters";

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accentColor?: string;
}

function KpiCard({ icon, label, value, sub, accentColor = "#3b82f6" }: KpiCardProps) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        transition: "box-shadow 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: `${accentColor}1a`,
            color: accentColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--foreground)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 11,
            color: "var(--muted-foreground)",
            marginTop: 4,
            lineHeight: 1.4,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

/* Inline SVG icons */
const ThermoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
  </svg>
);
const WindIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
  </svg>
);
const DropIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
  </svg>
);
const CloudRainIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>
  </svg>
);
const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

interface KpiGridProps {
  current: CurrentWeather;
  today?: DailyWeatherSummary;
}

export default function KpiGrid({ current, today }: KpiGridProps) {
  const uvMax = today?.uvIndexMax;

  const kpis: KpiCardProps[] = [
    {
      label: "Temperature",
      icon: <ThermoIcon />,
      value: formatTemperatureCRound(current.temperatureC),
      sub: `${wmoCodeEmoji(current.weatherCode)} ${wmoCodeDescription(current.weatherCode)}`,
      accentColor: "#ef4444",
    },
    {
      label: "Feels Like",
      icon: <ThermoIcon />,
      value: formatTemperatureCRound(current.apparentTemperatureC),
      sub: `Actual ${formatTemperatureC(current.temperatureC)}`,
      accentColor: "#f97316",
    },
    {
      label: "Humidity",
      icon: <DropIcon />,
      value: formatPercent(current.relativeHumidityPct),
      sub: `${current.surfacePressureHpa.toFixed(0)} hPa surface pressure`,
      accentColor: "#0ea5e9",
    },
    {
      label: "Wind",
      icon: <WindIcon />,
      value: formatWindKph(current.windSpeedKph),
      sub: `${windDirectionLabel(current.windDirectionDeg)} · Gusts ${formatWindKph(current.windGustsKph)}`,
      accentColor: "#10b981",
    },
    {
      label: "Precipitation",
      icon: <CloudRainIcon />,
      value: formatPrecipitationMm(current.precipitation),
      sub: `Cloud ${formatPercent(current.cloudCoverPct)} · Rain ${formatPrecipitationMm(current.rain)}`,
      accentColor: "#38bdf8",
    },
    {
      label: "UV Index",
      icon: <SunIcon />,
      value: uvMax != null ? uvMax.toFixed(1) : "—",
      sub: uvMax != null ? uvIndexLabel(uvMax) : `Cloud cover ${formatPercent(current.cloudCoverPct)}`,
      accentColor: "#f59e0b",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 16,
      }}
    >
      <style>{`
        @media (min-width: 640px) {
          .kpi-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .kpi-grid { grid-template-columns: repeat(6, 1fr) !important; }
        }
      `}</style>
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}
