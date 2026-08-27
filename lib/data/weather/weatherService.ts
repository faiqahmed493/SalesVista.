/**
 * Weather Service — public API for the data layer.
 *
 * This is the ONLY module that UI components (pages / Server Components)
 * should import from. It orchestrates:
 *
 *   LocationConfig
 *       ↓
 *   openMeteoClient.fetchOpenMeteoRaw()
 *       ↓
 *   weatherAdapter.adaptOpenMeteoResponse()
 *       ↓
 *   WeatherDashboardData (returned as WeatherResult)
 *
 * Error handling is entirely contained here. Callers receive a discriminated
 * union (`WeatherResult`) — they never need to catch exceptions.
 */

import {
  findLocationById,
  getDefaultLocation,
  type LocationConfig,
} from "../locations";
import { fetchOpenMeteoRaw } from "./openMeteoClient";
import { adaptOpenMeteoResponse } from "./weatherAdapter";
import type {
  WeatherDashboardData,
  WeatherError,
  WeatherResult,
} from "./weatherTypes";

// ─── Options ──────────────────────────────────────────────────────────────────

export interface GetWeatherOptions {
  /**
   * Location ID from `SUPPORTED_LOCATIONS`.
   * Defaults to `DEFAULT_LOCATION_ID` ("karachi") if omitted.
   */
  locationId?: string;
  /**
   * When true, bypasses the Next.js Data Cache and forces a live API call.
   * Use this in Route Handlers that serve a "refresh" action.
   */
  forceRefresh?: boolean;
}

// ─── Core function ────────────────────────────────────────────────────────────

/**
 * Retrieves and normalises weather data for the specified location.
 *
 * @example
 * ```ts
 * // In a Server Component:
 * const result = await getWeather({ locationId: "lahore" });
 * if (!result.success) {
 *   // handle result.error
 * }
 * const { current, hourly, daily } = result.data;
 * ```
 */
export async function getWeather(
  options: GetWeatherOptions = {}
): Promise<WeatherResult> {
  const { locationId, forceRefresh = false } = options;

  // ── 1. Resolve location ──────────────────────────────────────────────────
  let location: LocationConfig;

  if (locationId) {
    const found = findLocationById(locationId);
    if (!found) {
      return {
        success: false,
        error: {
          kind: "invalid_location",
          message: `Location "${locationId}" is not supported. Valid IDs: karachi, lahore, islamabad.`,
        } satisfies WeatherError,
      };
    }
    location = found;
  } else {
    location = getDefaultLocation();
  }

  // ── 2. Fetch raw data ────────────────────────────────────────────────────
  let raw;
  try {
    raw = await fetchOpenMeteoRaw(location, { forceRefresh });
  } catch (err) {
    // The client throws typed `WeatherError` objects — re-wrap as result
    const weatherErr = err as WeatherError;
    if (weatherErr?.kind) {
      return { success: false, error: weatherErr };
    }
    return {
      success: false,
      error: {
        kind: "unknown",
        message: "An unexpected error occurred while fetching weather data.",
        cause: err,
      },
    };
  }

  // ── 3. Adapt ─────────────────────────────────────────────────────────────
  try {
    const data: WeatherDashboardData = adaptOpenMeteoResponse(raw, location);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: {
        kind: "malformed_response",
        message: "Failed to normalise weather data from API response.",
        cause: err,
      },
    };
  }
}

// ─── Convenience re-exports ───────────────────────────────────────────────────
// So callers only need one import path for types + the service function

export type { WeatherDashboardData, WeatherError, WeatherResult } from "./weatherTypes";
export type { HourlyWeatherPoint, DailyWeatherSummary, CurrentWeather, WeatherLocation } from "./weatherTypes";
