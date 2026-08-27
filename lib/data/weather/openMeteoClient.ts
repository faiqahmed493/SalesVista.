/**
 * Open-Meteo HTTP client.
 *
 * Responsibilities:
 *   1. Build the API URL with correct query parameters.
 *   2. Execute the HTTP fetch with appropriate cache settings.
 *   3. Validate the raw HTTP/API response.
 *   4. Return the raw `OpenMeteoResponse` or throw a structured `WeatherError`.
 *
 * This module must NOT normalise data — that is the adapter's job.
 * This module must NOT be imported by UI components.
 */

import type { LocationConfig } from "../locations";
import type {
  OpenMeteoErrorResponse,
  OpenMeteoResponse,
} from "./openMeteoTypes";
import type { WeatherError } from "./weatherTypes";

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.OPEN_METEO_BASE_URL ?? "https://api.open-meteo.com/v1";

/**
 * How long (in seconds) the Next.js Data Cache will consider a response fresh.
 * Balances freshness vs. API load; weather rarely changes minute-to-minute.
 * Set to 0 to always fetch live data.
 */
const CACHE_REVALIDATE_SECONDS = 300; // 5 minutes

// ─── Parameter lists (verified against Open-Meteo live API 2026-08-27) ────────

const CURRENT_PARAMS = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "precipitation",
  "rain",
  "showers",
  "snowfall",
  "weather_code",
  "cloud_cover",
  "surface_pressure",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
].join(",");

const HOURLY_PARAMS = [
  "temperature_2m",
  "apparent_temperature",
  "relative_humidity_2m",
  "precipitation",
  "rain",
  "snowfall",
  "cloud_cover",
  "wind_speed_10m",
  "wind_gusts_10m",
  "surface_pressure",
  "visibility",
  "uv_index",
].join(",");

const DAILY_PARAMS = [
  "temperature_2m_max",
  "temperature_2m_min",
  "apparent_temperature_max",
  "apparent_temperature_min",
  "sunrise",
  "sunset",
  "precipitation_sum",
  "rain_sum",
  "snowfall_sum",
  "precipitation_probability_max",
  "wind_speed_10m_max",
  "wind_gusts_10m_max",
  "wind_direction_10m_dominant",
  "uv_index_max",
  "weather_code",
].join(",");

// ─── URL builder ──────────────────────────────────────────────────────────────

function buildForecastUrl(location: LocationConfig): string {
  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    current: CURRENT_PARAMS,
    hourly: HOURLY_PARAMS,
    daily: DAILY_PARAMS,
    timezone: location.timezone,
    forecast_days: "7",
  });

  return `${BASE_URL}/forecast?${params.toString()}`;
}

// ─── Type guard ───────────────────────────────────────────────────────────────

function isApiError(body: unknown): body is OpenMeteoErrorResponse {
  return (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    (body as Record<string, unknown>).error === true
  );
}

function isValidResponse(body: unknown): body is OpenMeteoResponse {
  return (
    typeof body === "object" &&
    body !== null &&
    "current" in body &&
    "hourly" in body &&
    "daily" in body
  );
}

// ─── Public fetcher ───────────────────────────────────────────────────────────

/**
 * Fetches raw weather data from Open-Meteo for the given location.
 *
 * @throws `WeatherError` on any failure (network, API, malformed response).
 *
 * Uses Next.js `fetch` with ISR-style revalidation.
 * Pass `{ cache: 'no-store' }` to force a live request (e.g., from a route handler).
 */
export async function fetchOpenMeteoRaw(
  location: LocationConfig,
  options?: { forceRefresh?: boolean }
): Promise<OpenMeteoResponse> {
  const url = buildForecastUrl(location);

  let response: Response;

  try {
    response = await fetch(url, {
      next: options?.forceRefresh
        ? { revalidate: 0 }
        : { revalidate: CACHE_REVALIDATE_SECONDS },
    });
  } catch (err) {
    const error: WeatherError = {
      kind: "network_failure",
      message: `Failed to reach Open-Meteo API: ${
        err instanceof Error ? err.message : "Unknown network error"
      }`,
      cause: err,
    };
    throw error;
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch (err) {
    const error: WeatherError = {
      kind: "malformed_response",
      message: "Open-Meteo response body was not valid JSON.",
      cause: err,
    };
    throw error;
  }

  // HTTP-level error
  if (!response.ok) {
    if (isApiError(body)) {
      const error: WeatherError = {
        kind: "api_error",
        message: `Open-Meteo API error: ${body.reason}`,
        cause: body,
      };
      throw error;
    }

    const error: WeatherError = {
      kind: "api_error",
      message: `Open-Meteo returned HTTP ${response.status}: ${response.statusText}`,
      cause: body,
    };
    throw error;
  }

  // Shape validation
  if (!isValidResponse(body)) {
    const error: WeatherError = {
      kind: "malformed_response",
      message:
        "Open-Meteo response is missing expected fields (current, hourly, daily).",
      cause: body,
    };
    throw error;
  }

  // Sanity check — ensure we received actual data
  if (
    body.hourly.time.length === 0 ||
    body.daily.time.length === 0
  ) {
    const error: WeatherError = {
      kind: "empty_data",
      message:
        "Open-Meteo returned an empty hourly or daily dataset for this location.",
      cause: body,
    };
    throw error;
  }

  return body;
}
