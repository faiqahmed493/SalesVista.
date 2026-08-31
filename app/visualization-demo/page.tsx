/**
 * Visualization System Demo — /visualization-demo
 *
 * Demonstrates ChartRenderer with 4 real weather data examples:
 *   1. Line chart — temperature (actual + feels-like)
 *   2. Bar chart  — 7-day precipitation totals
 *   3. Pie chart  — cloud cover distribution
 *   4. Area chart — wind speed and gusts
 *
 * All charts are driven by `VisualizationConfig` JSON objects —
 * exactly as an AI would produce them.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getWeather } from "@/lib/data/weather/weatherService";
import { getHourlyWindow } from "@/lib/utils/chartHelpers";
import { formatWeekday } from "@/lib/utils/formatters";
import type { VisualizationConfig } from "@/lib/visualization/types";
import ChartRenderer from "@/components/visualization/ChartRenderer";

export const metadata: Metadata = {
  title: "Visualization System Demo — Weather Analytics",
  description:
    "Demonstration of the generic ChartRenderer component driven by JSON configuration.",
};

export default async function VisualizationDemoPage() {
  const result = await getWeather({ locationId: "karachi" });

  if (!result.success) {
    return (
      <div style={{ padding: 40, color: "var(--foreground)" }}>
        <h1>Failed to load weather data</h1>
        <p style={{ color: "var(--muted-foreground)" }}>{result.error.message}</p>
        <Link href="/dashboard" style={{ color: "var(--accent)" }}>
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const { hourly, daily, current } = result.data;

  // ── 1. Line chart: temperature + feels-like (next 24h) ───────────────
  const tempSlice = getHourlyWindow(hourly, current.observedAt, 24);
  const tempData = tempSlice.map((h) => ({
    time: h.time.slice(11, 16),
    temperature: parseFloat(h.temperatureC.toFixed(1)),
    feelsLike: parseFloat(h.apparentTemperatureC.toFixed(1)),
  }));

  const lineConfig: VisualizationConfig = {
    type: "line",
    title: "Temperature Forecast",
    description: "Actual vs feels-like temperature — next 24 hours",
    xKey: "time",
    series: [
      { key: "temperature", label: "Temperature", color: "#3b82f6" },
      { key: "feelsLike", label: "Feels Like", color: "#8b5cf6", dashed: true },
    ],
    unit: "°C",
    legend: true,
    tooltip: { enabled: true, decimals: 1 },
    yAxis: { decimals: 0 },
    height: 260,
  };

  // ── 2. Bar chart: daily precipitation (7 days) ───────────────────────
  const precipData = daily.map((d) => ({
    day: formatWeekday(d.date),
    precipitation: parseFloat(d.precipitationSumMm.toFixed(2)),
    probability: d.precipitationProbabilityMaxPct,
  }));

  const barConfig: VisualizationConfig = {
    type: "bar",
    title: "7-Day Precipitation",
    description: "Daily rainfall totals and max probability",
    xKey: "day",
    series: [
      { key: "precipitation", label: "Rainfall (mm)", color: "#38bdf8" },
    ],
    unit: "mm",
    legend: false,
    tooltip: { enabled: true, decimals: 2 },
    height: 260,
  };

  // ── 3. Pie chart: cloud cover distribution (next 24h) ────────────────
  const cloudBuckets: Record<string, number> = {
    "Clear (0–20%)": 0,
    "Partly Cloudy (21–60%)": 0,
    "Overcast (>60%)": 0,
  };
  tempSlice.forEach((h) => {
    if (h.cloudCoverPct <= 20) cloudBuckets["Clear (0–20%)"]++;
    else if (h.cloudCoverPct <= 60) cloudBuckets["Partly Cloudy (21–60%)"]++;
    else cloudBuckets["Overcast (>60%)"]++;
  });
  const pieData = Object.entries(cloudBuckets)
    .filter(([, v]) => v > 0)
    .map(([condition, hours]) => ({ condition, hours }));

  const pieConfig: VisualizationConfig = {
    type: "pie",
    title: "Sky Conditions",
    description: "Cloud cover distribution — next 24 hours",
    xKey: "condition",
    series: [{ key: "hours", label: "Hours" }],
    legend: true,
    tooltip: { enabled: true, decimals: 0 },
    height: 260,
  };

  // ── 4. Area chart: wind speed + gusts (next 24h) ─────────────────────
  const windData = tempSlice.map((h) => ({
    time: h.time.slice(11, 16),
    gusts: parseFloat(h.windGustsKph.toFixed(1)),
    speed: parseFloat(h.windSpeedKph.toFixed(1)),
  }));

  const areaConfig: VisualizationConfig = {
    type: "area",
    title: "Wind Speed Forecast",
    description: "Wind gusts and speed — next 24 hours",
    xKey: "time",
    series: [
      { key: "gusts", label: "Gusts", color: "#f59e0b", fillOpacity: 0.8 },
      { key: "speed", label: "Speed", color: "#10b981", fillOpacity: 0.8 },
    ],
    unit: "km/h",
    legend: true,
    tooltip: { enabled: true, decimals: 1 },
    yAxis: { domain: [0, "dataMax"], decimals: 0 },
    height: 260,
  };

  // ── Example JSON (shown on page to illustrate AI-readiness) ──────────
  const exampleJson = JSON.stringify(
    {
      type: "line",
      title: "Temperature Forecast",
      description: "Actual vs feels-like temperature — next 24 hours",
      xKey: "time",
      series: [
        { key: "temperature", label: "Temperature", color: "#3b82f6" },
        { key: "feelsLike", label: "Feels Like", color: "#8b5cf6", dashed: true },
      ],
      unit: "°C",
      legend: true,
      tooltip: { enabled: true, decimals: 1 },
    },
    null,
    2
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      {/* ── Header ───────────────────────────────────────────────────── */}
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
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--foreground)",
                letterSpacing: "-0.02em",
              }}
            >
              Generic Visualization System
            </span>
            <span
              style={{
                marginLeft: 10,
                fontSize: 11,
                color: "var(--muted-foreground)",
                background: "var(--muted)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "2px 8px",
                fontWeight: 500,
              }}
            >
              ChartRenderer demo
            </span>
          </div>
          <Link
            href="/dashboard"
            style={{
              fontSize: 12,
              color: "var(--muted-foreground)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
              border: "1px solid var(--border)",
              padding: "6px 12px",
              borderRadius: 8,
              background: "var(--card)",
            }}
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "32px 24px 56px",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {/* Intro section */}
        <section>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--foreground)",
              marginBottom: 8,
            }}
          >
            JSON-driven Visualization
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--muted-foreground)",
              maxWidth: 640,
              lineHeight: 1.7,
            }}
          >
            Every chart below is rendered by a single{" "}
            <code
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 12,
                background: "var(--muted)",
                padding: "1px 5px",
                borderRadius: 4,
              }}
            >
              &lt;ChartRenderer&gt;
            </code>{" "}
            component receiving a plain JSON configuration. The AI will produce
            these configurations — the frontend renders them without executing
            any AI-provided code.
          </p>
        </section>

        {/* Architecture callout */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "20px 24px",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--muted-foreground)",
              marginBottom: 12,
            }}
          >
            Data Flow
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              flexWrap: "wrap",
              rowGap: 8,
            }}
          >
            {[
              ["AI Response", "JSON config object"],
              ["validateConfig()", "Security boundary"],
              ["ChartRenderer", "Dispatch logic"],
              ["Recharts", "SVG output"],
            ].map(([step, sub], i, arr) => (
              <div key={step} style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    background: "var(--muted)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "8px 14px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--foreground)",
                    }}
                  >
                    {step}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--muted-foreground)",
                      marginTop: 2,
                    }}
                  >
                    {sub}
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <span
                    style={{
                      fontSize: 18,
                      color: "var(--muted-foreground)",
                      margin: "0 8px",
                    }}
                  >
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Charts grid ─────────────────────────────────────────────── */}
        <section>
          <SectionLabel label="Live Examples" sub="Real data from Open-Meteo · Karachi" />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 20,
            }}
          >
            {/* Row 1: full-width line chart */}
            <ChartRenderer config={lineConfig} data={tempData} />

            {/* Row 2: bar + pie side by side on desktop */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 20,
              }}
              className="md:grid-cols-2"
            >
              <ChartRenderer config={barConfig} data={precipData} />
              <ChartRenderer config={pieConfig} data={pieData} />
            </div>

            {/* Row 3: full-width area chart */}
            <ChartRenderer config={areaConfig} data={windData} />
          </div>
        </section>

        {/* ── JSON config example ──────────────────────────────────────── */}
        <section>
          <SectionLabel
            label="Example Config"
            sub="This JSON is all ChartRenderer needs — no React code required"
          />

          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--foreground)",
                }}
              >
                VisualizationConfig (line chart)
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "var(--muted-foreground)",
                  background: "var(--muted)",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontWeight: 500,
                }}
              >
                JSON · safe · validated
              </span>
            </div>
            <pre
              style={{
                margin: 0,
                padding: "20px",
                fontSize: 12,
                lineHeight: 1.7,
                color: "var(--foreground)",
                fontFamily: "var(--font-mono, monospace)",
                overflowX: "auto",
                background: "transparent",
              }}
            >
              {exampleJson}
            </pre>
          </div>
        </section>

        {/* ── Supported types reference ──────────────────────────────── */}
        <section>
          <SectionLabel label="Supported Chart Types" sub="Pass as config.type" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
            }}
          >
            {[
              { type: "line", emoji: "📈", desc: "Trends over time" },
              { type: "bar", emoji: "📊", desc: "Category comparisons" },
              { type: "area", emoji: "🌊", desc: "Volume trends" },
              { type: "pie", emoji: "🥧", desc: "Part-of-whole" },
              { type: "composed", emoji: "🎛️", desc: "Mixed series types" },
            ].map((t) => (
              <div
                key={t.type}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "14px 16px",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>{t.emoji}</div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--foreground)",
                    fontFamily: "var(--font-mono, monospace)",
                    marginBottom: 3,
                  }}
                >
                  &quot;{t.type}&quot;
                </div>
                <div
                  style={{ fontSize: 11, color: "var(--muted-foreground)" }}
                >
                  {t.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 16,
            fontSize: 11,
            color: "var(--muted-foreground)",
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <span>
            Data:{" "}
            <a
              href="https://open-meteo.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)" }}
            >
              Open-Meteo
            </a>
          </span>
          <span>Charts: Recharts</span>
          <span>Config: validated JSON — no eval()</span>
        </footer>
      </main>
    </div>
  );
}

// ─── Small helper ────────────────────────────────────────────────────────────

function SectionLabel({ label, sub }: { label: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "var(--foreground)",
          letterSpacing: "-0.01em",
          marginBottom: sub ? 3 : 0,
        }}
      >
        {label}
      </h2>
      {sub && (
        <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{sub}</p>
      )}
    </div>
  );
}
