/**
 * Weather adapter: Open-Meteo raw response → WeatherDashboardData
 *
 * This module is the single place responsible for the impedance mismatch
 * between the Open-Meteo API contract and our application domain model.
 *
 * Rules:
 *   - Input: `OpenMeteoResponse` (raw, validated by the client)
 *   - Output: `WeatherDashboardData` (normalised, consumed by UI)
 *   - No network calls.
 *   - No side effects.
 *   - Pure transformation functions only.
 *
 * Replacing Open-Meteo with a different provider:
 *   1. Write a new `<provider>Client.ts` + `<provider>Types.ts`
 *   2. Write a new adapter that also outputs `WeatherDashboardData`
 *   3. Swap the import in `weatherService.ts`
 *   4. Zero UI changes required
 */

import type { LocationConfig } from "../locations";
import type { OpenMeteoResponse } from "./openMeteoTypes";
import type {
  CurrentWeather,
  DailyWeatherSummary,
  HourlyWeatherPoint,
  WeatherDashboardData,
  WeatherDataMetadata,
  WeatherLocation,
} from "./weatherTypes";

// ─── Sub-adapters ─────────────────────────────────────────────────────────────

function adaptLocation(
  raw: OpenMeteoResponse,
  config: LocationConfig
): WeatherLocation {
  return {
    id: config.id,
    name: config.name,
    country: config.country,
    latitude: raw.latitude,
    longitude: raw.longitude,
    timezone: raw.timezone,
    elevationM: raw.elevation,
  };
}

function adaptCurrent(raw: OpenMeteoResponse): CurrentWeather {
  const c = raw.current;
  return {
    observedAt: c.time,
    temperatureC: c.temperature_2m,
    apparentTemperatureC: c.apparent_temperature,
    relativeHumidityPct: c.relative_humidity_2m,
    precipitation: c.precipitation,
    rain: c.rain,
    showers: c.showers,
    snowfall: c.snowfall,
    weatherCode: c.weather_code,
    cloudCoverPct: c.cloud_cover,
    surfacePressureHpa: c.surface_pressure,
    windSpeedKph: c.wind_speed_10m,
    windDirectionDeg: c.wind_direction_10m,
    windGustsKph: c.wind_gusts_10m,
  };
}

function adaptHourly(raw: OpenMeteoResponse): HourlyWeatherPoint[] {
  const h = raw.hourly;
  return h.time.map((time, i) => ({
    time,
    temperatureC: h.temperature_2m[i] ?? 0,
    apparentTemperatureC: h.apparent_temperature[i] ?? 0,
    relativeHumidityPct: h.relative_humidity_2m[i] ?? 0,
    precipitation: h.precipitation[i] ?? 0,
    rain: h.rain[i] ?? 0,
    snowfall: h.snowfall[i] ?? 0,
    cloudCoverPct: h.cloud_cover[i] ?? 0,
    windSpeedKph: h.wind_speed_10m[i] ?? 0,
    windGustsKph: h.wind_gusts_10m[i] ?? 0,
    surfacePressureHpa: h.surface_pressure[i] ?? 0,
    visibilityM: h.visibility[i] ?? 0,
    uvIndex: h.uv_index[i] ?? 0,
  }));
}

function adaptDaily(raw: OpenMeteoResponse): DailyWeatherSummary[] {
  const d = raw.daily;
  return d.time.map((date, i) => ({
    date,
    temperatureMaxC: d.temperature_2m_max[i] ?? 0,
    temperatureMinC: d.temperature_2m_min[i] ?? 0,
    apparentTemperatureMaxC: d.apparent_temperature_max[i] ?? 0,
    apparentTemperatureMinC: d.apparent_temperature_min[i] ?? 0,
    sunrise: d.sunrise[i] ?? "",
    sunset: d.sunset[i] ?? "",
    precipitationSumMm: d.precipitation_sum[i] ?? 0,
    rainSumMm: d.rain_sum[i] ?? 0,
    snowfallSumCm: d.snowfall_sum[i] ?? 0,
    precipitationProbabilityMaxPct: d.precipitation_probability_max[i] ?? 0,
    windSpeedMaxKph: d.wind_speed_10m_max[i] ?? 0,
    windGustsMaxKph: d.wind_gusts_10m_max[i] ?? 0,
    windDirectionDominantDeg: d.wind_direction_10m_dominant[i] ?? 0,
    uvIndexMax: d.uv_index_max[i] ?? 0,
    weatherCode: d.weather_code[i] ?? 0,
  }));
}

function adaptMetadata(raw: OpenMeteoResponse): WeatherDataMetadata {
  return {
    fetchedAt: new Date().toISOString(),
    source: "open-meteo",
    generationTimeMs: raw.generationtime_ms,
    utcOffsetSeconds: raw.utc_offset_seconds,
    timezoneAbbreviation: raw.timezone_abbreviation,
    hourlyCount: raw.hourly.time.length,
    dailyCount: raw.daily.time.length,
  };
}

// ─── Main adapter function ────────────────────────────────────────────────────

/**
 * Transforms a raw Open-Meteo response into a normalised `WeatherDashboardData`.
 *
 * @param raw    Validated `OpenMeteoResponse` from the HTTP client
 * @param config The `LocationConfig` used for the request
 * @returns      `WeatherDashboardData` ready for UI consumption
 */
export function adaptOpenMeteoResponse(
  raw: OpenMeteoResponse,
  config: LocationConfig
): WeatherDashboardData {
  return {
    location: adaptLocation(raw, config),
    current: adaptCurrent(raw),
    hourly: adaptHourly(raw),
    daily: adaptDaily(raw),
    metadata: adaptMetadata(raw),
  };
}
