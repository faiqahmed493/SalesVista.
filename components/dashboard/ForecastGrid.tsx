import React from "react";
import type { DailyWeatherSummary } from "@/lib/data/weather/weatherTypes";
import {
  formatTemperatureCRound,
  formatWeekday,
  formatDate,
  formatWindKph,
  formatPercent,
  wmoCodeDescription,
  wmoCodeEmoji,
  formatPrecipitationMm,
} from "@/lib/utils/formatters";

interface ForecastCardProps {
  day: DailyWeatherSummary;
  isToday?: boolean;
}

export function ForecastCard({ day, isToday = false }: ForecastCardProps) {
  return (
    <div
      style={{
        background: isToday ? "var(--accent)" : "var(--card)",
        border: `1px solid ${isToday ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 12,
        padding: "16px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minWidth: 130,
        flex: "0 0 auto",
      }}
    >
      {/* Day label */}
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: isToday ? "rgba(255,255,255,0.7)" : "var(--muted-foreground)",
          }}
        >
          {isToday ? "TODAY" : formatWeekday(day.date)}
        </div>
        <div
          style={{
            fontSize: 11,
            color: isToday ? "rgba(255,255,255,0.6)" : "var(--muted-foreground)",
            marginTop: 1,
          }}
        >
          {formatDate(day.date)}
        </div>
      </div>

      {/* Weather icon + condition */}
      <div>
        <div style={{ fontSize: 26, lineHeight: 1, marginBottom: 4 }}>
          {wmoCodeEmoji(day.weatherCode)}
        </div>
        <div
          style={{
            fontSize: 11,
            color: isToday ? "rgba(255,255,255,0.85)" : "var(--muted-foreground)",
            lineHeight: 1.3,
          }}
        >
          {wmoCodeDescription(day.weatherCode)}
        </div>
      </div>

      {/* Temperature range */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 4,
          color: isToday ? "#ffffff" : "var(--foreground)",
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 700 }}>
          {formatTemperatureCRound(day.temperatureMaxC)}
        </span>
        <span
          style={{
            fontSize: 13,
            color: isToday ? "rgba(255,255,255,0.6)" : "var(--muted-foreground)",
          }}
        >
          / {formatTemperatureCRound(day.temperatureMinC)}
        </span>
      </div>

      {/* Details */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <DetailRow
          label="💧"
          value={formatPrecipitationMm(day.precipitationSumMm)}
          sub={formatPercent(day.precipitationProbabilityMaxPct)}
          isToday={isToday}
        />
        <DetailRow
          label="💨"
          value={formatWindKph(day.windSpeedMaxKph)}
          isToday={isToday}
        />
        <DetailRow
          label="☀️"
          value={`UV ${day.uvIndexMax.toFixed(1)}`}
          isToday={isToday}
        />
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  sub,
  isToday,
}: {
  label: string;
  value: string;
  sub?: string;
  isToday: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        color: isToday ? "rgba(255,255,255,0.8)" : "var(--muted-foreground)",
      }}
    >
      <span style={{ fontSize: 12 }}>{label}</span>
      <span>{value}</span>
      {sub && (
        <span style={{ opacity: 0.7, marginLeft: 2 }}>({sub})</span>
      )}
    </div>
  );
}

interface ForecastGridProps {
  daily: DailyWeatherSummary[];
}

export default function ForecastGrid({ daily }: ForecastGridProps) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--foreground)",
            marginBottom: 2,
          }}
        >
          7-Day Forecast
        </h3>
        <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          Daily weather summary and conditions
        </p>
      </div>

      {/* Horizontally scrollable on mobile */}
      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {daily.map((day, idx) => (
          <ForecastCard key={day.date} day={day} isToday={idx === 0} />
        ))}
      </div>
    </div>
  );
}
