"use client";

import React, { useState } from "react";
import {
  LineChart,
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

interface TemperatureChartProps {
  hourly: HourlyWeatherPoint[];
  observedAt: string;
}

type TimeWindow = 24 | 48;

interface ChartEntry {
  time: string;
  Temperature: number;
  "Feels Like": number;
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
      <p
        style={{
          fontWeight: 600,
          marginBottom: 6,
          color: "var(--foreground)",
        }}
      >
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, margin: "2px 0" }}>
          {entry.name}: <strong>{entry.value.toFixed(1)}°C</strong>
        </p>
      ))}
    </div>
  );
}

export default function TemperatureChart({
  hourly,
  observedAt,
}: TemperatureChartProps) {
  const [window, setWindow] = useState<TimeWindow>(24);

  const slice = getHourlyWindow(hourly, observedAt, window);
  const data: ChartEntry[] = slice.map((h) => ({
    time: formatHourLabel(h.time),
    Temperature: parseFloat(h.temperatureC.toFixed(1)),
    "Feels Like": parseFloat(h.apparentTemperatureC.toFixed(1)),
  }));

  const toggle = (
    <div
      style={{
        display: "flex",
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {([24, 48] as TimeWindow[]).map((w) => (
        <button
          key={w}
          onClick={() => setWindow(w)}
          style={{
            padding: "4px 12px",
            fontSize: 11,
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
            background: window === w ? "var(--accent)" : "transparent",
            color: window === w ? "var(--accent-foreground)" : "var(--muted-foreground)",
            transition: "all 0.15s",
          }}
        >
          {w}h
        </button>
      ))}
    </div>
  );

  return (
    <ChartCard
      title="Temperature Forecast"
      subtitle={`Next ${window} hours · °C`}
      action={toggle}
    >
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
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
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}°`}
            domain={["dataMin - 2", "dataMax + 2"]}
            width={38}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey="Temperature"
            stroke="var(--chart-blue, #3b82f6)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="Feels Like"
            stroke="var(--chart-purple, #8b5cf6)"
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
