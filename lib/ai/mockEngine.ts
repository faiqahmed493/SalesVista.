/**
 * Mock AI response engine.
 *
 * Produces realistic `AIResponsePayload` objects from natural-language questions,
 * using the real WeatherDashboardData already loaded by the dashboard.
 *
 * Architecture:
 *   - Pure function: `getMockResponse(question, data) → AIResponsePayload`
 *   - No network calls, no side effects
 *   - Uses actual chart configs + real data → looks genuinely realistic
 *
 * Swap this module for a real LLM client when ready.
 * The ChatPanel only imports `AIResponsePayload` — the swap is transparent.
 */

import type { WeatherDashboardData } from "@/lib/data/weather/weatherTypes";
import type { AIResponsePayload } from "@/lib/ai/chatTypes";
import type { VisualizationConfig, DataRecord } from "@/lib/visualization/types";
import { getHourlyWindow } from "@/lib/utils/chartHelpers";
import {
  formatTemperatureCRound,
  formatTemperatureC,
  formatWeekday,
  formatWindKph,
  formatPrecipitationMm,
  uvIndexLabel,
  wmoCodeDescription,
  wmoCodeEmoji,
} from "@/lib/utils/formatters";

// ─── Pattern matchers ─────────────────────────────────────────────────────────

const has = (q: string, ...words: string[]) =>
  words.some((w) => q.includes(w));

// ─── Builder helpers ──────────────────────────────────────────────────────────

function hourlyTempData(
  data: WeatherDashboardData,
  hours = 24
): DataRecord[] {
  return getHourlyWindow(data.hourly, data.current.observedAt, hours).map(
    (h) => ({
      time: h.time.slice(11, 16),
      temperature: parseFloat(h.temperatureC.toFixed(1)),
      feelsLike: parseFloat(h.apparentTemperatureC.toFixed(1)),
    })
  );
}

function lineConfig(
  title: string,
  description: string,
  height = 200
): VisualizationConfig {
  return {
    type: "line",
    title,
    description,
    xKey: "time",
    series: [
      { key: "temperature", label: "Temperature", color: "#3b82f6" },
      { key: "feelsLike", label: "Feels Like", color: "#8b5cf6", dashed: true },
    ],
    unit: "°C",
    legend: true,
    tooltip: { enabled: true, decimals: 1 },
    height,
  };
}

// ─── Response builders ────────────────────────────────────────────────────────

/** "Show me the temperature trend for the next 24 hours" */
function buildTemperatureTrend(data: WeatherDashboardData): AIResponsePayload {
  const slice = getHourlyWindow(data.hourly, data.current.observedAt, 24);
  const peak = slice.reduce(
    (max, h) => (h.temperatureC > max.temperatureC ? h : max),
    slice[0]!
  );
  const trough = slice.reduce(
    (min, h) => (h.temperatureC < min.temperatureC ? h : min),
    slice[0]!
  );

  return {
    content: `The temperature peaks at ${formatTemperatureCRound(peak.temperatureC)} around ${peak.time.slice(11, 16)}, then cools to ${formatTemperatureCRound(trough.temperatureC)} by ${trough.time.slice(11, 16)}. The dashed line shows how it feels accounting for humidity and wind.`,
    visualization: {
      config: lineConfig(
        "Temperature Forecast",
        "Actual vs feels-like · next 24 hours"
      ),
      data: hourlyTempData(data, 24),
    },
    canAddToDashboard: false,
  };
}

/** "What will the temperature be tomorrow?" */
function buildTomorrowTemp(data: WeatherDashboardData): AIResponsePayload {
  const tomorrow = data.daily[1];
  const today = data.daily[0];
  if (!tomorrow || !today) {
    return {
      content: "Tomorrow's forecast isn't available yet — try again shortly.",
    };
  }

  const comparison =
    tomorrow.temperatureMaxC > today.temperatureMaxC
      ? `warmer than today (${formatTemperatureCRound(today.temperatureMaxC)})`
      : tomorrow.temperatureMaxC < today.temperatureMaxC
      ? `cooler than today (${formatTemperatureCRound(today.temperatureMaxC)})`
      : "about the same as today";

  return {
    content: `Tomorrow (${formatWeekday(tomorrow.date)}) will be ${comparison}, with a high of ${formatTemperatureCRound(tomorrow.temperatureMaxC)} and a low of ${formatTemperatureCRound(tomorrow.temperatureMinC)}. Conditions: ${wmoCodeEmoji(tomorrow.weatherCode)} ${wmoCodeDescription(tomorrow.weatherCode)}.`,
  };
}

/** "Which day will have the highest temperature?" */
function buildHottestDay(data: WeatherDashboardData): AIResponsePayload {
  const sorted = [...data.daily].sort(
    (a, b) => b.temperatureMaxC - a.temperatureMaxC
  );
  const hottest = sorted[0]!;
  const second = sorted[1];

  const dayLabel =
    data.daily.indexOf(hottest) === 0 ? "Today" : formatWeekday(hottest.date);

  return {
    content: `${dayLabel} will be the hottest day of the week, reaching ${formatTemperatureCRound(hottest.temperatureMaxC)}${second ? ` — ${formatTemperatureCRound(second.temperatureMaxC)} ahead of ${formatWeekday(second.date)}` : ""}. ${wmoCodeEmoji(hottest.weatherCode)} ${wmoCodeDescription(hottest.weatherCode)}.`,
    insights: [
      `Peak temperature: ${formatTemperatureC(hottest.temperatureMaxC)}`,
      `Night low: ${formatTemperatureC(hottest.temperatureMinC)}`,
      `UV index: ${hottest.uvIndexMax.toFixed(1)} (${uvIndexLabel(hottest.uvIndexMax)})`,
      `Wind: ${formatWindKph(hottest.windSpeedMaxKph)}`,
    ],
  };
}

/** "Show precipitation for the next 7 days" */
function buildPrecipitation(data: WeatherDashboardData): AIResponsePayload {
  const chartData: DataRecord[] = data.daily.map((d) => ({
    day: formatWeekday(d.date),
    precipitation: parseFloat(d.precipitationSumMm.toFixed(2)),
    probability: d.precipitationProbabilityMaxPct,
  }));

  const wettest = data.daily.reduce(
    (max, d) => (d.precipitationSumMm > max.precipitationSumMm ? d : max),
    data.daily[0]!
  );

  const totalRain = data.daily.reduce(
    (sum, d) => sum + d.precipitationSumMm,
    0
  );
  const rainyDays = data.daily.filter(
    (d) => d.precipitationSumMm > 0.1
  ).length;

  return {
    content:
      rainyDays === 0
        ? `The next 7 days look dry with no significant rainfall expected. Total accumulated: ${formatPrecipitationMm(totalRain)}.`
        : `${formatWeekday(wettest.date)} looks like the wettest day with ${formatPrecipitationMm(wettest.precipitationSumMm)} expected. ${rainyDays} of 7 days have some rainfall. Total: ${formatPrecipitationMm(totalRain)}.`,
    visualization: {
      config: {
        type: "bar",
        title: "7-Day Precipitation",
        description: "Daily rainfall totals",
        xKey: "day",
        series: [
          {
            key: "precipitation",
            label: "Rainfall (mm)",
            color: "#38bdf8",
          },
        ],
        unit: "mm",
        legend: false,
        tooltip: { enabled: true, decimals: 2 },
        height: 200,
      },
      data: chartData,
    },
    canAddToDashboard: true,
  };
}

/** "Compare wind speed and wind gusts" */
function buildWindComparison(data: WeatherDashboardData): AIResponsePayload {
  const slice = getHourlyWindow(data.hourly, data.current.observedAt, 24);
  const chartData: DataRecord[] = slice.map((h) => ({
    time: h.time.slice(11, 16),
    gusts: parseFloat(h.windGustsKph.toFixed(1)),
    speed: parseFloat(h.windSpeedKph.toFixed(1)),
  }));

  const maxGust = slice.reduce(
    (max, h) => (h.windGustsKph > max ? h.windGustsKph : max),
    0
  );
  const avgSpeed =
    slice.reduce((s, h) => s + h.windSpeedKph, 0) / slice.length;

  return {
    content: `Average wind speed over the next 24 hours is ${formatWindKph(avgSpeed)}, with gusts reaching ${formatWindKph(maxGust)}. The shaded area shows how gusts spike well above sustained speed — useful for planning outdoor activities.`,
    visualization: {
      config: {
        type: "area",
        title: "Wind Speed vs Gusts",
        description: "Next 24 hours",
        xKey: "time",
        series: [
          {
            key: "gusts",
            label: "Gusts",
            color: "#f59e0b",
            fillOpacity: 0.7,
          },
          {
            key: "speed",
            label: "Wind Speed",
            color: "#10b981",
            fillOpacity: 0.7,
          },
        ],
        unit: "km/h",
        legend: true,
        tooltip: { enabled: true, decimals: 1 },
        yAxis: { domain: [0, "dataMax"], decimals: 0 },
        height: 200,
      },
      data: chartData,
    },
    canAddToDashboard: true,
  };
}

/** "Which day has the highest chance of rain?" */
function buildRainChance(data: WeatherDashboardData): AIResponsePayload {
  const sorted = [...data.daily].sort(
    (a, b) =>
      b.precipitationProbabilityMaxPct - a.precipitationProbabilityMaxPct
  );
  const rainiest = sorted[0]!;
  const dayLabel =
    data.daily.indexOf(rainiest) === 0
      ? "Today"
      : formatWeekday(rainiest.date);

  const hasSignificantRain = data.daily.some(
    (d) => d.precipitationProbabilityMaxPct >= 40
  );

  return {
    content: hasSignificantRain
      ? `${dayLabel} has the highest rain probability at ${rainiest.precipitationProbabilityMaxPct}% with ${formatPrecipitationMm(rainiest.precipitationSumMm)} expected. ${wmoCodeEmoji(rainiest.weatherCode)} ${wmoCodeDescription(rainiest.weatherCode)}.`
      : `Rain is unlikely across the next 7 days. The highest chance is ${rainiest.precipitationProbabilityMaxPct}% on ${dayLabel}, but total expected rainfall is only ${formatPrecipitationMm(rainiest.precipitationSumMm)}.`,
    insights: data.daily
      .filter((d) => d.precipitationProbabilityMaxPct > 0)
      .slice(0, 5)
      .map(
        (d) =>
          `${formatWeekday(d.date)}: ${d.precipitationProbabilityMaxPct}% · ${formatPrecipitationMm(d.precipitationSumMm)}`
      ),
  };
}

/** "Show me the UV index for the next week" */
function buildUVIndex(data: WeatherDashboardData): AIResponsePayload {
  const chartData: DataRecord[] = data.daily.map((d) => ({
    day: formatWeekday(d.date),
    uvIndex: parseFloat(d.uvIndexMax.toFixed(1)),
  }));

  const peakDay = data.daily.reduce(
    (max, d) => (d.uvIndexMax > max.uvIndexMax ? d : max),
    data.daily[0]!
  );

  return {
    content: `UV index peaks at ${peakDay.uvIndexMax.toFixed(1)} (${uvIndexLabel(peakDay.uvIndexMax)}) on ${formatWeekday(peakDay.date)}. ${peakDay.uvIndexMax >= 6 ? "Sunscreen and protective clothing recommended during midday hours." : "UV levels are manageable but sun protection is always advisable."}`,
    visualization: {
      config: {
        type: "bar",
        title: "UV Index Forecast",
        description: "Daily maximum UV index — 7 days",
        xKey: "day",
        series: [
          { key: "uvIndex", label: "UV Index", color: "#f59e0b" },
        ],
        unit: "",
        legend: false,
        tooltip: { enabled: true, decimals: 1 },
        yAxis: { domain: [0, "dataMax"], decimals: 0 },
        height: 200,
      },
      data: chartData,
    },
    canAddToDashboard: true,
  };
}

/** "Summarize tomorrow's weather" */
function buildTomorrowSummary(data: WeatherDashboardData): AIResponsePayload {
  const tomorrow = data.daily[1] ?? data.daily[0]!;
  const next24 = getHourlyWindow(data.hourly, data.current.observedAt, 24);
  const peak = next24.reduce(
    (max, h) => (h.temperatureC > max.temperatureC ? h : max),
    next24[0]!
  );

  return {
    content: `${formatWeekday(tomorrow.date)}: ${wmoCodeEmoji(tomorrow.weatherCode)} ${wmoCodeDescription(tomorrow.weatherCode)}. High of ${formatTemperatureCRound(tomorrow.temperatureMaxC)}, low of ${formatTemperatureCRound(tomorrow.temperatureMinC)}.`,
    insights: [
      `🌡️ Temperature: ${formatTemperatureC(tomorrow.temperatureMinC)} → ${formatTemperatureC(tomorrow.temperatureMaxC)}`,
      `💧 Rain chance: ${tomorrow.precipitationProbabilityMaxPct}% · ${formatPrecipitationMm(tomorrow.precipitationSumMm)}`,
      `💨 Wind: ${formatWindKph(tomorrow.windSpeedMaxKph)}`,
      `☀️ UV Index: ${tomorrow.uvIndexMax.toFixed(1)} (${uvIndexLabel(tomorrow.uvIndexMax)})`,
      `🌅 Sunrise: ${data.daily[1]?.sunrise?.slice(11, 16) ?? data.daily[0]?.sunrise?.slice(11, 16) ?? "—"}`,
    ],
    canAddToDashboard: false,
  };
}

/** Fallback for unrecognized questions */
function buildFallback(data: WeatherDashboardData): AIResponsePayload {
  const temp = formatTemperatureCRound(data.current.temperatureC);
  return {
    content: `Currently ${temp} in your location — ${wmoCodeEmoji(data.current.weatherCode)} ${wmoCodeDescription(data.current.weatherCode)}. You can ask me about temperature trends, precipitation, wind, UV index, or request comparisons and summaries.`,
    insights: [
      "Try: \"Show me the temperature trend\"",
      "Try: \"Which day has the most rain?\"",
      "Try: \"Compare wind speed and gusts\"",
      "Try: \"Summarize tomorrow's weather\"",
    ],
  };
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

/**
 * Generate a mock AI response for the given question.
 *
 * Uses keyword matching against the normalised (lowercased, trimmed) question.
 * Returns an `AIResponsePayload` — the caller wraps it into a `ChatMessage`.
 *
 * @param question  Raw user question string
 * @param data      The current WeatherDashboardData (provides real values)
 */
export function getMockResponse(
  question: string,
  data: WeatherDashboardData
): AIResponsePayload {
  const q = question.toLowerCase().trim();

  // Temperature trend (24h chart)
  if (
    has(q, "temperature", "temp") &&
    has(q, "trend", "24", "hour", "next", "forecast", "chart", "show", "graph")
  ) {
    return buildTemperatureTrend(data);
  }

  // Tomorrow's temperature (text-only)
  if (
    has(q, "tomorrow") &&
    has(q, "temperature", "temp", "hot", "cold", "warm", "cool", "weather", "be")
  ) {
    // Distinguish: "summarize tomorrow" → summary, "temperature tomorrow" → simple
    if (has(q, "summarize", "summary", "overview", "tell")) {
      return buildTomorrowSummary(data);
    }
    return buildTomorrowTemp(data);
  }

  // Hottest day (text + insights)
  if (
    has(q, "highest", "hottest", "warmest", "maximum") &&
    has(q, "temperature", "temp", "day")
  ) {
    return buildHottestDay(data);
  }

  // Precipitation / rainfall (chart + add to dashboard)
  if (has(q, "precipitation", "rainfall", "rain") && has(q, "7", "week", "days", "forecast", "show", "next")) {
    return buildPrecipitation(data);
  }

  // Wind comparison (chart + add to dashboard)
  if (has(q, "wind") && has(q, "compare", "gust", "speed", "vs", "versus", "show")) {
    return buildWindComparison(data);
  }

  // Rain chance (text + insights)
  if (
    (has(q, "rain", "rainfall") && has(q, "chance", "probability", "likely", "highest")) ||
    has(q, "rain forecast", "will it rain")
  ) {
    return buildRainChance(data);
  }

  // UV index (chart + add to dashboard)
  if (has(q, "uv", "ultraviolet", "sun", "sunburn")) {
    return buildUVIndex(data);
  }

  // Tomorrow summary (text + insights)
  if (has(q, "summarize", "summary", "overview") || (has(q, "tomorrow") && has(q, "weather"))) {
    return buildTomorrowSummary(data);
  }

  // Fallback
  return buildFallback(data);
}
