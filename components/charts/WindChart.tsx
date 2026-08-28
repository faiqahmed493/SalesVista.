"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { HourlyWeatherPoint } from "@/lib/data/weather/weatherTypes";
import { getHourlyWindow, formatHourLabel, xAxisInterval } from "@/lib/utils/chartHelpers";
import ChartCard from "@/components/dashboard/ChartCard";

interface WindChartProps {
  hourly: HourlyWeatherPoint[];
  observedAt: string;
}

interface ChartEntry {
  time: string;
  "Wind Speed": number;
  "Gusts": number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
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
          {entry.name}: <strong>{entry.value.toFixed(1)} km/h</strong>
        </p>
      ))}
    </div>
  );
}

export default function WindChart({
  hourly,
  observedAt,
}: WindChartProps) {
  const slice = getHourlyWindow(hourly, observedAt, 24);
  const data: ChartEntry[] = slice.map((h) => ({
    time: formatHourLabel(h.time),
    "Wind Speed": parseFloat(h.windSpeedKph.toFixed(1)),
    "Gusts": parseFloat(h.windGustsKph.toFixed(1)),
  }));

  const maxGust = Math.max(...data.map((d) => d["Gusts"]));
  const avgSpeed = data.reduce((s, d) => s + d["Wind Speed"], 0) / data.length;

  return (
    <ChartCard
      title="Wind Analytics"
      subtitle={`Next 24h · Avg ${avgSpeed.toFixed(0)} km/h · Max gusts ${maxGust.toFixed(0)} km/h`}
    >
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="rgba(128,128,128,0.12)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            interval={xAxisInterval(data.length)}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11, dx: 30 }}
            axisLine={false}
            tickLine={false}
            tickMargin={16}
          />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 11, textAnchor: "start", dx: -26}}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
            width={36}
            domain={[0, "dataMax + 5"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            iconType="circle"
            iconSize={8}
          />
          <ReferenceLine
            y={avgSpeed}
            stroke="rgba(16,185,129,0.3)"
            strokeDasharray="3 3"
          />
          <Line
            type="monotone"
            dataKey="Wind Speed"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="Gusts"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
