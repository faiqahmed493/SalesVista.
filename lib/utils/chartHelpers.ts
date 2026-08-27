/**
 * Chart helper utilities.
 *
 * Pure functions for preparing data windows for chart components.
 * No UI imports — usable in both Server and Client contexts.
 */

import type { HourlyWeatherPoint } from "@/lib/data/weather/weatherTypes";

/**
 * Returns a slice of hourly data starting from approximately now.
 *
 * The Open-Meteo API returns data from midnight of today.
 * This function finds the current hour and returns `hours` points from there.
 *
 * @param hourly   Full hourly array from WeatherDashboardData
 * @param observedAt  The current observation time string (e.g. "2026-08-27T20:15")
 * @param hours    How many hours to include (e.g. 24 or 48)
 */
export function getHourlyWindow(
  hourly: HourlyWeatherPoint[],
  observedAt: string,
  hours: number
): HourlyWeatherPoint[] {
  // Match on the first 13 chars: "2026-08-27T20"
  const currentHourPrefix = observedAt.slice(0, 13);
  let startIdx = hourly.findIndex((h) =>
    h.time.startsWith(currentHourPrefix)
  );
  if (startIdx < 0) startIdx = 0;
  return hourly.slice(startIdx, startIdx + hours);
}

/**
 * Format an hourly time string to a short axis label.
 * "2026-08-27T14:00" → "14:00"
 */
export function formatHourLabel(isoTime: string): string {
  return isoTime.slice(11, 16);
}

/**
 * Determine a good X-axis tick interval for a given number of data points.
 * Returns every Nth point so the axis stays readable.
 */
export function xAxisInterval(dataLength: number): number {
  if (dataLength <= 12) return 1;
  if (dataLength <= 24) return 3;
  if (dataLength <= 48) return 5;
  return Math.floor(dataLength / 8);
}
