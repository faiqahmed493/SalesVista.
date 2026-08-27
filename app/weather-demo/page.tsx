/**
 * Weather Data Layer Demo Page
 *
 * Route: /weather-demo
 *
 * Purpose: Proves the full data layer pipeline is functional.
 *   - Fetches from Open-Meteo via the weather service
 *   - Normalises through the adapter
 *   - Renders raw data in a structured, readable layout
 *
 * This is a diagnostic/development page — it is NOT the final dashboard.
 * Visual polish is intentionally minimal.
 */

import { getWeather } from "@/lib/data/weather/weatherService";
import type { WeatherDashboardData, HourlyWeatherPoint, DailyWeatherSummary } from "@/lib/data/weather/weatherTypes";
import { SUPPORTED_LOCATIONS } from "@/lib/data/locations";
import {
  formatTemperatureCRound,
  formatWindKph,
  formatPercent,
  formatPrecipitationMm,
  formatPressureHpa,
  formatVisibilityKm,
  formatTime,
  formatDate,
  wmoCodeDescription,
  wmoCodeEmoji,
  uvIndexLabel,
  windDirectionLabel,
} from "@/lib/utils/formatters";

export const metadata = {
  title: "Weather Data Layer Demo",
  description: "Diagnostic page proving the Open-Meteo data pipeline works",
};

interface PageProps {
  searchParams: Promise<{ location?: string }>;
}

export default async function WeatherDemoPage({ searchParams }: PageProps) {
  const { location: locationParam } = await searchParams;

  // Fetch for all supported locations in parallel for the demo
  const results = await Promise.all(
    SUPPORTED_LOCATIONS.map((loc) =>
      getWeather({ locationId: loc.id }).then((r) => ({ loc, r }))
    )
  );

  // Focus data on the selected/first location for detailed view
  const selectedId = locationParam ?? SUPPORTED_LOCATIONS[0].id;
  const primary = results.find((x) => x.loc.id === selectedId) ?? results[0];

  return (
    <div style={{ fontFamily: "monospace", padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
        🌦️ Weather Data Layer — Demo
      </h1>
      <p style={{ color: "#666", marginBottom: "2rem", fontSize: "0.85rem" }}>
        This page demonstrates the full pipeline:{" "}
        <code>Open-Meteo → openMeteoClient → weatherAdapter → weatherService → UI</code>
      </p>

      {/* Location selector */}
      <nav style={{ marginBottom: "2rem", display: "flex", gap: "1rem" }}>
        {SUPPORTED_LOCATIONS.map((loc) => (
          <a
            key={loc.id}
            href={`/weather-demo?location=${loc.id}`}
            style={{
              padding: "0.4rem 1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              textDecoration: "none",
              background: loc.id === selectedId ? "#000" : "#fff",
              color: loc.id === selectedId ? "#fff" : "#000",
              fontSize: "0.85rem",
            }}
          >
            {loc.name}
          </a>
        ))}
      </nav>

      {/* Primary location detail */}
      {primary.r.success ? (
        <PrimaryDetail result={primary.r.data} />
      ) : (
        <ErrorDisplay error={primary.r.error} locationId={primary.loc.id} />
      )}

      {/* All-locations summary table */}
      <h2 style={{ fontSize: "1.1rem", marginTop: "3rem", marginBottom: "1rem" }}>
        All Locations — Current Conditions
      </h2>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.8rem" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            {["City", "Status", "Temp", "Feels Like", "Humidity", "Wind", "Condition", "Fetched At"].map((h) => (
              <th key={h} style={{ padding: "0.5rem", border: "1px solid #ddd", textAlign: "left" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map(({ loc, r }) => (
            <tr key={loc.id}>
              <td style={{ padding: "0.5rem", border: "1px solid #ddd" }}>{loc.name}</td>
              <td style={{ padding: "0.5rem", border: "1px solid #ddd" }}>
                {r.success ? "✅ OK" : `❌ ${r.error.kind}`}
              </td>
              {r.success ? (
                <>
                  <td style={{ padding: "0.5rem", border: "1px solid #ddd" }}>
                    {formatTemperatureCRound(r.data.current.temperatureC)}
                  </td>
                  <td style={{ padding: "0.5rem", border: "1px solid #ddd" }}>
                    {formatTemperatureCRound(r.data.current.apparentTemperatureC)}
                  </td>
                  <td style={{ padding: "0.5rem", border: "1px solid #ddd" }}>
                    {formatPercent(r.data.current.relativeHumidityPct)}
                  </td>
                  <td style={{ padding: "0.5rem", border: "1px solid #ddd" }}>
                    {formatWindKph(r.data.current.windSpeedKph)}{" "}
                    {windDirectionLabel(r.data.current.windDirectionDeg)}
                  </td>
                  <td style={{ padding: "0.5rem", border: "1px solid #ddd" }}>
                    {wmoCodeEmoji(r.data.current.weatherCode)}{" "}
                    {wmoCodeDescription(r.data.current.weatherCode)}
                  </td>
                  <td style={{ padding: "0.5rem", border: "1px solid #ddd", fontSize: "0.75rem" }}>
                    {r.data.metadata.fetchedAt}
                  </td>
                </>
              ) : (
                <td colSpan={6} style={{ padding: "0.5rem", border: "1px solid #ddd", color: "red" }}>
                  {r.error.message}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <footer style={{ marginTop: "3rem", fontSize: "0.7rem", color: "#aaa" }}>
        Data source: <a href="https://open-meteo.com" style={{ color: "#aaa" }}>Open-Meteo</a>{" "}
        (free, no API key required) • Cached for 5 minutes via Next.js ISR
      </footer>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PrimaryDetail({ result }: { result: WeatherDashboardData }) {
  const { location, current, hourly, daily, metadata } = result;

  // Show only the next 24 hourly points
  const next24h = hourly.slice(0, 24);

  return (
    <div>
      {/* Header */}
      <div style={{ background: "#f9f9f9", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>
          {wmoCodeEmoji(current.weatherCode)} {location.name}, {location.country}
        </h2>
        <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "#666" }}>
          {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E •{" "}
          Elevation: {location.elevationM}m • TZ: {location.timezone}
        </p>
        <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#999" }}>
          Source: {metadata.source} • Generated in {metadata.generationTimeMs.toFixed(1)}ms •
          Fetched: {metadata.fetchedAt} •{" "}
          {metadata.hourlyCount}h hourly / {metadata.dailyCount} daily points
        </p>
      </div>

      {/* Current conditions grid */}
      <h3 style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>Current Conditions</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "2rem" }}>
        {[
          ["🌡️ Temperature", formatTemperatureCRound(current.temperatureC)],
          ["🤔 Feels Like", formatTemperatureCRound(current.apparentTemperatureC)],
          ["💧 Humidity", formatPercent(current.relativeHumidityPct)],
          ["🌧️ Precipitation", formatPrecipitationMm(current.precipitation)],
          ["🌂 Rain", formatPrecipitationMm(current.rain)],
          ["🚿 Showers", formatPrecipitationMm(current.showers)],
          ["❄️ Snowfall", `${current.snowfall.toFixed(2)} cm`],
          ["☁️ Cloud Cover", formatPercent(current.cloudCoverPct)],
          ["🔴 Pressure", formatPressureHpa(current.surfacePressureHpa)],
          ["💨 Wind Speed", formatWindKph(current.windSpeedKph)],
          ["🧭 Wind Dir", `${windDirectionLabel(current.windDirectionDeg)} (${current.windDirectionDeg}°)`],
          ["💨 Gusts", formatWindKph(current.windGustsKph)],
          ["📋 Condition", wmoCodeDescription(current.weatherCode)],
          ["🕐 Observed At", formatTime(current.observedAt)],
        ].map(([label, value]) => (
          <div key={label as string} style={{ background: "#fff", border: "1px solid #eee", borderRadius: "6px", padding: "0.75rem" }}>
            <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: "0.25rem" }}>{label}</div>
            <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Hourly table */}
      <h3 style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>Next 24 Hours</h3>
      <div style={{ overflowX: "auto", marginBottom: "2rem" }}>
        <table style={{ borderCollapse: "collapse", fontSize: "0.75rem", minWidth: "900px" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              {["Time", "Temp", "Feels", "Humidity", "Precip", "Cloud", "Wind", "Gusts", "Pressure", "Visibility", "UV"].map((h) => (
                <th key={h} style={{ padding: "0.4rem 0.6rem", border: "1px solid #ddd" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {next24h.map((h: HourlyWeatherPoint) => (
              <tr key={h.time}>
                <td style={{ padding: "0.4rem 0.6rem", border: "1px solid #ddd", whiteSpace: "nowrap" }}>{formatTime(h.time)}</td>
                <td style={{ padding: "0.4rem 0.6rem", border: "1px solid #ddd" }}>{formatTemperatureCRound(h.temperatureC)}</td>
                <td style={{ padding: "0.4rem 0.6rem", border: "1px solid #ddd" }}>{formatTemperatureCRound(h.apparentTemperatureC)}</td>
                <td style={{ padding: "0.4rem 0.6rem", border: "1px solid #ddd" }}>{formatPercent(h.relativeHumidityPct)}</td>
                <td style={{ padding: "0.4rem 0.6rem", border: "1px solid #ddd" }}>{formatPrecipitationMm(h.precipitation)}</td>
                <td style={{ padding: "0.4rem 0.6rem", border: "1px solid #ddd" }}>{formatPercent(h.cloudCoverPct)}</td>
                <td style={{ padding: "0.4rem 0.6rem", border: "1px solid #ddd" }}>{formatWindKph(h.windSpeedKph)}</td>
                <td style={{ padding: "0.4rem 0.6rem", border: "1px solid #ddd" }}>{formatWindKph(h.windGustsKph)}</td>
                <td style={{ padding: "0.4rem 0.6rem", border: "1px solid #ddd" }}>{formatPressureHpa(h.surfacePressureHpa)}</td>
                <td style={{ padding: "0.4rem 0.6rem", border: "1px solid #ddd" }}>{formatVisibilityKm(h.visibilityM)}</td>
                <td style={{ padding: "0.4rem 0.6rem", border: "1px solid #ddd" }}>{h.uvIndex.toFixed(1)} ({uvIndexLabel(h.uvIndex)})</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Daily summaries */}
      <h3 style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>7-Day Forecast</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.75rem" }}>
        {daily.map((d: DailyWeatherSummary) => (
          <div key={d.date} style={{ background: "#fff", border: "1px solid #eee", borderRadius: "6px", padding: "0.75rem", fontSize: "0.75rem" }}>
            <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>{formatDate(d.date)}</div>
            <div style={{ fontSize: "1.2rem" }}>{wmoCodeEmoji(d.weatherCode)}</div>
            <div>{wmoCodeDescription(d.weatherCode)}</div>
            <div style={{ marginTop: "0.4rem" }}>
              ↑ {formatTemperatureCRound(d.temperatureMaxC)} / ↓ {formatTemperatureCRound(d.temperatureMinC)}
            </div>
            <div style={{ color: "#666" }}>
              ↑ feels {formatTemperatureCRound(d.apparentTemperatureMaxC)}
            </div>
            <div style={{ marginTop: "0.4rem" }}>
              🌅 {formatTime(d.sunrise)} 🌇 {formatTime(d.sunset)}
            </div>
            <div style={{ marginTop: "0.4rem" }}>
              🌧️ {formatPrecipitationMm(d.precipitationSumMm)} ({formatPercent(d.precipitationProbabilityMaxPct)})
            </div>
            <div>💨 {formatWindKph(d.windSpeedMaxKph)}</div>
            <div>☀️ UV max: {d.uvIndexMax.toFixed(1)} ({uvIndexLabel(d.uvIndexMax)})</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorDisplay({
  error,
  locationId,
}: {
  error: { kind: string; message: string };
  locationId: string;
}) {
  return (
    <div style={{ background: "#fff0f0", border: "1px solid #ffaaaa", borderRadius: "8px", padding: "1.5rem" }}>
      <strong>❌ Failed to load weather for &quot;{locationId}&quot;</strong>
      <p style={{ margin: "0.5rem 0 0", color: "#c00" }}>
        [{error.kind}] {error.message}
      </p>
    </div>
  );
}
