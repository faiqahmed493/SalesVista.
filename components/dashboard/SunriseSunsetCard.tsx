import React from "react";
import type { DailyWeatherSummary } from "@/lib/data/weather/weatherTypes";
import { formatTime } from "@/lib/utils/formatters";

interface SunriseSunsetCardProps {
  today: DailyWeatherSummary;
}

function daylightDuration(sunrise: string, sunset: string): string {
  const rise = new Date(`1970-01-01T${sunrise.slice(11)}:00`);
  const set = new Date(`1970-01-01T${sunset.slice(11)}:00`);
  const diffMs = set.getTime() - rise.getTime();
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

/** Simple arc progress component showing where we are in the day */
function SunArc({ sunriseTime, sunsetTime }: { sunriseTime: string; sunsetTime: string }) {
  const now = new Date();
  const rise = new Date(`${sunriseTime.slice(0, 10)}T${sunriseTime.slice(11)}:00`);
  const set = new Date(`${sunsetTime.slice(0, 10)}T${sunsetTime.slice(11)}:00`);

  const totalMs = set.getTime() - rise.getTime();
  const elapsedMs = Math.max(0, Math.min(now.getTime() - rise.getTime(), totalMs));
  const progress = totalMs > 0 ? elapsedMs / totalMs : 0;

  // SVG arc: semi-circle in a 100×56 viewBox
  const cx = 50, cy = 50, r = 40;
  const startAngle = Math.PI; // left (sunrise)
  const endAngle = 0; // right (sunset)
  const sunAngle = Math.PI - progress * Math.PI;

  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const sunX = cx + r * Math.cos(sunAngle);
  const sunY = cy - r * Math.sin(sunAngle);

  return (
    <svg viewBox="0 0 100 56" style={{ width: "100%", maxWidth: 220 }} aria-hidden>
      {/* Track arc */}
      <path
        d={arcPath}
        fill="none"
        stroke="var(--border)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Progress arc */}
      {progress > 0 && (
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${sunX} ${sunY}`}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
      {/* Sun dot */}
      <circle cx={sunX} cy={sunY} r="5" fill="#f59e0b" />
      {/* Labels */}
      <text x={cx - r - 2} y={cy + 10} textAnchor="end" fontSize="8" fill="var(--muted-foreground)">
        Rise
      </text>
      <text x={cx + r + 2} y={cy + 10} textAnchor="start" fontSize="8" fill="var(--muted-foreground)">
        Set
      </text>
    </svg>
  );
}

export default function SunriseSunsetCard({ today }: SunriseSunsetCardProps) {
  const daylight = daylightDuration(today.sunrise, today.sunset);

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
        Sunrise & Sunset
      </h3>
      <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 16 }}>
        Today's daylight window
      </p>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <SunArc sunriseTime={today.sunrise} sunsetTime={today.sunset} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <DataPoint emoji="🌅" label="Sunrise" value={formatTime(today.sunrise)} />
        <DataPoint emoji="⏱️" label="Daylight" value={daylight} center />
        <DataPoint emoji="🌇" label="Sunset" value={formatTime(today.sunset)} right />
      </div>
    </div>
  );
}

function DataPoint({
  emoji,
  label,
  value,
  center = false,
  right = false,
}: {
  emoji: string;
  label: string;
  value: string;
  center?: boolean;
  right?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: center ? "center" : right ? "flex-end" : "flex-start",
      }}
    >
      <span style={{ fontSize: 16 }}>{emoji}</span>
      <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500 }}>
        {label}
      </span>
      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)" }}>
        {value}
      </span>
    </div>
  );
}
