/**
 * Normalised application-level weather types.
 *
 * UI components import ONLY from this file.
 * Raw Open-Meteo shapes are kept in `weather/openMeteoTypes.ts`.
 *
 * Naming conventions:
 *   - Temperature always in °C
 *   - Wind speed always in km/h
 *   - Pressure always in hPa
 *   - Precipitation / rain / snowfall in the unit noted in the field JSDoc
 *   - Visibility in metres
 *   - Percentages as 0-100 numbers
 *   - Timestamps as ISO 8601 strings
 */

// ─── Location ─────────────────────────────────────────────────────────────────

export interface WeatherLocation {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  /** Elevation in metres above sea level */
  elevationM: number;
}

// ─── Current conditions ───────────────────────────────────────────────────────

export interface CurrentWeather {
  /** ISO 8601 observation time */
  observedAt: string;
  /** °C */
  temperatureC: number;
  /** °C, feels-like */
  apparentTemperatureC: number;
  /** 0-100 % */
  relativeHumidityPct: number;
  /** mm */
  precipitation: number;
  /** mm */
  rain: number;
  /** mm */
  showers: number;
  /** cm */
  snowfall: number;
  /** WMO weather interpretation code */
  weatherCode: number;
  /** 0-100 % */
  cloudCoverPct: number;
  /** hPa */
  surfacePressureHpa: number;
  /** km/h */
  windSpeedKph: number;
  /** Degrees 0-360 */
  windDirectionDeg: number;
  /** km/h */
  windGustsKph: number;
}

// ─── Hourly data point ────────────────────────────────────────────────────────

export interface HourlyWeatherPoint {
  /** ISO 8601 */
  time: string;
  /** °C */
  temperatureC: number;
  /** °C */
  apparentTemperatureC: number;
  /** 0-100 % */
  relativeHumidityPct: number;
  /** mm */
  precipitation: number;
  /** mm */
  rain: number;
  /** cm */
  snowfall: number;
  /** 0-100 % */
  cloudCoverPct: number;
  /** km/h */
  windSpeedKph: number;
  /** km/h */
  windGustsKph: number;
  /** hPa */
  surfacePressureHpa: number;
  /** metres */
  visibilityM: number;
  /** UV index value */
  uvIndex: number;
}

// ─── Daily summary ────────────────────────────────────────────────────────────

export interface DailyWeatherSummary {
  /** ISO 8601 date (YYYY-MM-DD) */
  date: string;
  /** °C */
  temperatureMaxC: number;
  /** °C */
  temperatureMinC: number;
  /** °C */
  apparentTemperatureMaxC: number;
  /** °C */
  apparentTemperatureMinC: number;
  /** ISO 8601 datetime */
  sunrise: string;
  /** ISO 8601 datetime */
  sunset: string;
  /** mm */
  precipitationSumMm: number;
  /** mm */
  rainSumMm: number;
  /** cm */
  snowfallSumCm: number;
  /** 0-100 % */
  precipitationProbabilityMaxPct: number;
  /** km/h */
  windSpeedMaxKph: number;
  /** km/h */
  windGustsMaxKph: number;
  /** Degrees 0-360 */
  windDirectionDominantDeg: number;
  /** UV index maximum */
  uvIndexMax: number;
  /** WMO weather interpretation code */
  weatherCode: number;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export interface WeatherDataMetadata {
  /** ISO 8601 timestamp of when the data was fetched from the API */
  fetchedAt: string;
  /** Data source identifier (allows future replacement) */
  source: "open-meteo";
  /** Seconds the API took to generate the response */
  generationTimeMs: number;
  /** UTC offset in seconds for the location's timezone */
  utcOffsetSeconds: number;
  /** IANA timezone abbreviation */
  timezoneAbbreviation: string;
  /** Number of hourly points returned */
  hourlyCount: number;
  /** Number of daily summaries returned */
  dailyCount: number;
}

// ─── Top-level dashboard data model ──────────────────────────────────────────

/**
 * The single normalised structure the dashboard consumes.
 * Regardless of the underlying data source, the UI always receives this shape.
 */
export interface WeatherDashboardData {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyWeatherPoint[];
  daily: DailyWeatherSummary[];
  metadata: WeatherDataMetadata;
}

// ─── Service result (includes error handling) ─────────────────────────────────

export type WeatherResult =
  | { success: true; data: WeatherDashboardData }
  | { success: false; error: WeatherError };

export type WeatherErrorKind =
  | "network_failure"
  | "api_error"
  | "malformed_response"
  | "invalid_location"
  | "empty_data"
  | "unknown";

export interface WeatherError {
  kind: WeatherErrorKind;
  message: string;
  /** Original error if available */
  cause?: unknown;
}
