/**
 * Raw Open-Meteo API response types.
 *
 * These types mirror the exact JSON shape returned by the Open-Meteo
 * Forecast API (https://api.open-meteo.com/v1/forecast).
 *
 * DO NOT import these into UI components.
 * UI components must consume normalised types from `../types.ts`.
 *
 * Verified against live API response on 2026-08-27.
 */

// ─── Unit metadata returned alongside data arrays ────────────────────────────

export interface OpenMeteoCurrentUnits {
  time: string;
  interval: string;
  temperature_2m: string;
  relative_humidity_2m: string;
  apparent_temperature: string;
  precipitation: string;
  rain: string;
  showers: string;
  snowfall: string;
  weather_code: string;
  cloud_cover: string;
  surface_pressure: string;
  wind_speed_10m: string;
  wind_direction_10m: string;
  wind_gusts_10m: string;
}

export interface OpenMeteoHourlyUnits {
  time: string;
  temperature_2m: string;
  apparent_temperature: string;
  relative_humidity_2m: string;
  precipitation: string;
  rain: string;
  snowfall: string;
  cloud_cover: string;
  wind_speed_10m: string;
  wind_gusts_10m: string;
  surface_pressure: string;
  visibility: string;
  uv_index: string;
}

export interface OpenMeteoDailyUnits {
  time: string;
  temperature_2m_max: string;
  temperature_2m_min: string;
  apparent_temperature_max: string;
  apparent_temperature_min: string;
  sunrise: string;
  sunset: string;
  precipitation_sum: string;
  rain_sum: string;
  snowfall_sum: string;
  precipitation_probability_max: string;
  wind_speed_10m_max: string;
  wind_gusts_10m_max: string;
  wind_direction_10m_dominant: string;
  uv_index_max: string;
  weather_code: string;
}

// ─── Data sections ────────────────────────────────────────────────────────────

export interface OpenMeteoCurrent {
  time: string;
  interval: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weather_code: number;
  cloud_cover: number;
  surface_pressure: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
}

export interface OpenMeteoHourly {
  time: string[];
  temperature_2m: number[];
  apparent_temperature: number[];
  relative_humidity_2m: number[];
  precipitation: number[];
  rain: number[];
  snowfall: number[];
  cloud_cover: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
  surface_pressure: number[];
  visibility: number[];
  uv_index: number[];
}

export interface OpenMeteoDaily {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  sunrise: string[];
  sunset: string[];
  precipitation_sum: number[];
  rain_sum: number[];
  snowfall_sum: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
  wind_direction_10m_dominant: number[];
  uv_index_max: number[];
  weather_code: number[];
}

// ─── Full API response ────────────────────────────────────────────────────────

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: OpenMeteoCurrentUnits;
  current: OpenMeteoCurrent;
  hourly_units: OpenMeteoHourlyUnits;
  hourly: OpenMeteoHourly;
  daily_units: OpenMeteoDailyUnits;
  daily: OpenMeteoDaily;
}

// ─── API error shape ──────────────────────────────────────────────────────────

export interface OpenMeteoErrorResponse {
  error: boolean;
  reason: string;
}
