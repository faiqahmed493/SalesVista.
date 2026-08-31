/**
 * Weather data tool implementations for the AI chat system.
 *
 * These are the ONLY functions the LLM can trigger to access data.
 * No arbitrary HTTP requests, no SQL, no code execution.
 *
 * Architecture:
 *   LLM calls a tool name (string) → executeTool() dispatches here
 *   → returns { summary (sent to LLM), chartData (returned to frontend) }
 *
 * Field names in the payloads are the CONTRACT between this module and the LLM.
 * The system prompt documents these exact names.
 * The LLM uses them in visualization config (xKey, series[].key).
 * ChartRenderer renders them as-is.
 */

import type {
  WeatherDashboardData,
  HourlyWeatherPoint,
  DailyWeatherSummary,
} from "@/lib/data/weather/weatherTypes";
import type { DataRecord } from "@/lib/visualization/types";
import { wmoCodeDescription } from "@/lib/utils/formatters";
import { getHourlyWindow } from "@/lib/utils/chartHelpers";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ToolArgs {
  hours?: number;
  days?: number;
}

export type ToolName =
  | "get_current_weather"
  | "get_hourly_weather"
  | "get_daily_weather";

export interface ToolResult {
  /**
   * JSON-serialisable summary sent to the LLM in the tool response message.
   * Kept lean — the LLM only needs to see what it needs to form an answer.
   */
  summary: unknown;
  /**
   * Full normalised array for ChartRenderer.
   * Only populated for tools that return array data.
   */
  chartData: DataRecord[];
  /** Canonical tool name used (for diagnostics) */
  toolName: ToolName;
}

// ─── Tool: get_current_weather ──────────────────────────────────────────────

/**
 * Returns current weather conditions as a flat object.
 *
 * LLM-visible fields (documented in system prompt):
 *   tempC, feelsLikeC, humidityPct, windSpeedKph, windGustsKph,
 *   precipMm, cloudCoverPct, uvIndex, pressureHpa, windDeg, condition, observedAt
 */
export function buildCurrentPayload(data: WeatherDashboardData): DataRecord {
  const c = data.current;
  return {
    tempC: parseFloat(c.temperatureC.toFixed(1)),
    feelsLikeC: parseFloat(c.apparentTemperatureC.toFixed(1)),
    humidityPct: c.relativeHumidityPct,
    windSpeedKph: parseFloat(c.windSpeedKph.toFixed(1)),
    windGustsKph: parseFloat(c.windGustsKph.toFixed(1)),
    precipMm: parseFloat(c.precipitation.toFixed(2)),
    cloudCoverPct: c.cloudCoverPct,
    uvIndex: 0, // current UV not in model; placeholder
    pressureHpa: parseFloat(c.surfacePressureHpa.toFixed(1)),
    windDeg: c.windDirectionDeg,
    condition: wmoCodeDescription(c.weatherCode),
    observedAt: c.observedAt,
    locationName: data.location.name,
    locationCountry: data.location.country,
  };
}

// ─── Tool: get_hourly_weather ───────────────────────────────────────────────

/**
 * Returns hourly forecast data as an array of records.
 *
 * LLM-visible fields:
 *   time (HH:MM), tempC, feelsLikeC, humidityPct, windSpeedKph,
 *   windGustsKph, precipMm, cloudCoverPct, uvIndex, pressureHpa, snowfallCm
 */
export function buildHourlyPayload(
  data: WeatherDashboardData,
  hours: number
): DataRecord[] {
  const clampedHours = Math.min(Math.max(hours, 1), 48);
  const slice: HourlyWeatherPoint[] = getHourlyWindow(
    data.hourly,
    data.current.observedAt,
    clampedHours
  );

  return slice.map((h) => ({
    time: h.time.slice(11, 16), // "14:00"
    tempC: parseFloat(h.temperatureC.toFixed(1)),
    feelsLikeC: parseFloat(h.apparentTemperatureC.toFixed(1)),
    humidityPct: h.relativeHumidityPct,
    windSpeedKph: parseFloat(h.windSpeedKph.toFixed(1)),
    windGustsKph: parseFloat(h.windGustsKph.toFixed(1)),
    precipMm: parseFloat(h.precipitation.toFixed(2)),
    cloudCoverPct: h.cloudCoverPct,
    uvIndex: parseFloat(h.uvIndex.toFixed(1)),
    pressureHpa: parseFloat(h.surfacePressureHpa.toFixed(1)),
    snowfallCm: parseFloat(h.snowfall.toFixed(2)),
  }));
}

// ─── Tool: get_daily_weather ────────────────────────────────────────────────

/**
 * Returns daily forecast data as an array of records.
 *
 * LLM-visible fields:
 *   day (Mon), date (YYYY-MM-DD), maxTempC, minTempC, precipMm,
 *   precipProbPct, uvIndexMax, windSpeedKph, windGustsKph,
 *   sunrise (HH:MM), sunset (HH:MM), condition
 */
export function buildDailyPayload(
  data: WeatherDashboardData,
  days: number
): DataRecord[] {
  const clampedDays = Math.min(Math.max(days, 1), 7);
  const slice: DailyWeatherSummary[] = data.daily.slice(0, clampedDays);

  return slice.map((d) => {
    const dateObj = new Date(d.date);
    const dayLabel = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    return {
      day: dayLabel,
      date: d.date,
      maxTempC: parseFloat(d.temperatureMaxC.toFixed(1)),
      minTempC: parseFloat(d.temperatureMinC.toFixed(1)),
      precipMm: parseFloat(d.precipitationSumMm.toFixed(2)),
      precipProbPct: d.precipitationProbabilityMaxPct,
      uvIndexMax: parseFloat(d.uvIndexMax.toFixed(1)),
      windSpeedKph: parseFloat(d.windSpeedMaxKph.toFixed(1)),
      windGustsKph: parseFloat(d.windGustsMaxKph.toFixed(1)),
      sunrise: d.sunrise ? d.sunrise.slice(11, 16) : null,
      sunset: d.sunset ? d.sunset.slice(11, 16) : null,
      condition: wmoCodeDescription(d.weatherCode),
    };
  });
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────

/**
 * Execute a named weather tool against the in-memory WeatherDashboardData.
 *
 * @param toolName  One of the three allowed tool names
 * @param args      LLM-provided arguments (hours / days)
 * @param data      The current WeatherDashboardData
 */
export function executeTool(
  toolName: string,
  args: ToolArgs,
  data: WeatherDashboardData
): ToolResult {
  switch (toolName) {
    case "get_current_weather": {
      const payload = buildCurrentPayload(data);
      return {
        toolName: "get_current_weather",
        summary: payload,
        chartData: [payload], // single row, chart rarely needed
      };
    }

    case "get_hourly_weather": {
      const hours = typeof args.hours === "number" ? args.hours : 24;
      const chartData = buildHourlyPayload(data, hours);
      return {
        toolName: "get_hourly_weather",
        summary: {
          count: chartData.length,
          fields:
            "time, tempC, feelsLikeC, humidityPct, windSpeedKph, windGustsKph, precipMm, cloudCoverPct, uvIndex, pressureHpa, snowfallCm",
          sample: chartData.slice(0, 6),
          all: chartData,
        },
        chartData,
      };
    }

    case "get_daily_weather": {
      const days = typeof args.days === "number" ? args.days : 7;
      const chartData = buildDailyPayload(data, days);
      return {
        toolName: "get_daily_weather",
        summary: {
          count: chartData.length,
          fields:
            "day, date, maxTempC, minTempC, precipMm, precipProbPct, uvIndexMax, windSpeedKph, windGustsKph, sunrise, sunset, condition",
          all: chartData,
        },
        chartData,
      };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// ─── Provider-neutral tool definitions ─────────────────────────────────────

/**
 * Provider-neutral definitions converted by each AI provider adapter.
 */
export const AI_TOOL_DEFINITIONS = [
  {
    name: "get_current_weather",
    description:
      "Get the current weather conditions for the active location. Returns temperature, humidity, wind, precipitation, cloud cover, pressure, and weather description. No arguments needed.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_hourly_weather",
    description:
      "Get hourly weather forecast data starting from the current hour. Use for temperature trends, wind trends, humidity over time, hourly precipitation, UV index over time. Maximum 48 hours.",
    parameters: {
      type: "object",
      properties: {
        hours: {
          type: "number",
          description:
            "Number of hours to retrieve (1–48). Use 24 for next-24h questions, 48 for next-2-day questions.",
        },
      },
      required: ["hours"],
    },
  },
  {
    name: "get_daily_weather",
    description:
      "Get daily weather summary data for the forecast period. Use for day-by-day comparisons, precipitation by day, hottest/coldest day, daily UV index, wind by day, sunrise/sunset. Maximum 7 days.",
    parameters: {
      type: "object",
      properties: {
        days: {
          type: "number",
          description:
            "Number of days to retrieve (1–7). Use 7 for weekly questions, 1 for today-only questions.",
        },
      },
      required: ["days"],
    },
  },
] as const;
