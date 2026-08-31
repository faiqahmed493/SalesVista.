"use client";

import React from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { HourlyWeatherPoint } from "@/lib/data/weather/weatherTypes";
import { getHourlyWindow, formatHourLabel, xAxisInterval } from "@/lib/utils/chartHelpers";
import ChartCard from "@/components/dashboard/ChartCard";

interface HumidityPressureChartProps {
  hourly: HourlyWeatherPoint[];
  observedAt: string;
}

interface ChartEntry {
  time: string;
  "Humidity (%)": number;
  "Pressure (hPa)": number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { color: string; name: string; value: number; unit?: string }[];
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
        <p key={entry.name} style={{ color: entry.color, margin: "2px 0" }}>
          {entry.name}:{" "}
          <strong>
            {entry.name.includes("Humidity")
              ? `${entry.value.toFixed(0)}%`
              : `${entry.value.toFixed(1)} hPa`}
          </strong>
        </p>
      ))}
    </div>
  );
}

export default function HumidityPressureChart({
  hourly,
  observedAt,
}: HumidityPressureChartProps) {
  const slice = getHourlyWindow(hourly, observedAt, 24);
  const data: ChartEntry[] = slice.map((h) => ({
    time: formatHourLabel(h.time),
    "Humidity (%)": parseFloat(h.relativeHumidityPct.toFixed(0)),
    "Pressure (hPa)": parseFloat(h.surfacePressureHpa.toFixed(1)),
  }));

  const pressureValues = data.map((d) => d["Pressure (hPa)"]);
  const pressureMin = Math.min(...pressureValues);
  const pressureMax = Math.max(...pressureValues);

  return (
    <ChartCard title="Humidity & Pressure" subtitle="Next 24 hours · dual axis">
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0 }}>
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
            tickMargin={16}
          />
          {/* Left axis: Humidity 0-100% */}
          <YAxis
            yAxisId="humidity"
            domain={[0, 100]}
            tick={{ fill: "#14b8a6", fontSize: 11, textAnchor: "start", dx: -30 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            width={38}
          />
          {/* Right axis: Pressure auto-scaled */}
          <YAxis
            yAxisId="pressure"
            orientation="right"
            domain={[pressureMin - 3, pressureMax + 3]}
            tick={{ fill: "#818cf8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v.toFixed(0)}`}
            width={46}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 18 }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            yAxisId="humidity"
            type="monotone"
            dataKey="Humidity (%)"
            stroke="#14b8a6"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Line
            yAxisId="pressure"
            type="monotone"
            dataKey="Pressure (hPa)"
            stroke="#818cf8"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
