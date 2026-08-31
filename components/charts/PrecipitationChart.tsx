"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { HourlyWeatherPoint } from "@/lib/data/weather/weatherTypes";
import { getHourlyWindow, formatHourLabel, xAxisInterval } from "@/lib/utils/chartHelpers";
import ChartCard from "@/components/dashboard/ChartCard";

interface PrecipitationChartProps {
  hourly: HourlyWeatherPoint[];
  observedAt: string;
}

interface ChartEntry {
  time: string;
  "Precip (mm)": number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        fontSize: 12,
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: 6, color: "var(--foreground)" }}>
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: "#38bdf8", margin: "2px 0" }}>
          {entry.name}: <strong>{entry.value.toFixed(2)} mm</strong>
        </p>
      ))}
    </div>
  );
}

export default function PrecipitationChart({
  hourly,
  observedAt,
}: PrecipitationChartProps) {
  const slice = getHourlyWindow(hourly, observedAt, 24);
  const data: ChartEntry[] = slice.map((h) => ({
    time: formatHourLabel(h.time),
    "Precip (mm)": parseFloat(h.precipitation.toFixed(2)),
  }));

  // Check if there's any precipitation at all
  const hasRain = data.some((d) => d["Precip (mm)"] > 0);

  return (
    <ChartCard title="Precipitation" subtitle="Next 24 hours · mm">
      {!hasRain ? (
        <div
          style={{
            height: 220,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted-foreground)",
            fontSize: 13,
            gap: 8,
          }}
        >
          <span style={{ fontSize: 28 }}>☀️</span>
          <span>No precipitation expected</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: 15, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="rgba(128,128,128,0.12)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              interval={xAxisInterval(data.length)}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11, textAnchor: "start", dx: -48, }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}mm`}
              width={42}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(56,189,248,0.06)" }} />
            <Bar dataKey="Precip (mm)" radius={[3, 3, 0, 0]} maxBarSize={20}>
              {data.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry["Precip (mm)"] > 0 ? "#38bdf8" : "rgba(56,189,248,0.15)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
