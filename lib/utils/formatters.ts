/**
 * Shared utility formatters.
 *
 * All functions are pure (no side effects) and work in both
 * Server Components and Client Components.
 */

// ─── Temperature ──────────────────────────────────────────────────────────────

/** Format °C to one decimal place: "27.0°C" */
export function formatTemperatureC(value: number): string {
  return `${value.toFixed(1)}°C`;
}

/** Format °C to a whole number: "27°C" */
export function formatTemperatureCRound(value: number): string {
  return `${Math.round(value)}°C`;
}

// ─── Wind ─────────────────────────────────────────────────────────────────────

/** Format km/h to one decimal: "17.0 km/h" */
export function formatWindKph(value: number): string {
  return `${value.toFixed(1)} km/h`;
}

/** Convert wind direction degrees to a compass label */
export function windDirectionLabel(degrees: number): string {
  const dirs = [
    "N", "NNE", "NE", "ENE",
    "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW",
    "W", "WNW", "NW", "NNW",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return dirs[index] ?? "N";
}

// ─── Pressure ─────────────────────────────────────────────────────────────────

/** Format hPa to one decimal: "1002.9 hPa" */
export function formatPressureHpa(value: number): string {
  return `${value.toFixed(1)} hPa`;
}

// ─── Precipitation ────────────────────────────────────────────────────────────

/** Format mm to two decimal places: "0.60 mm" */
export function formatPrecipitationMm(value: number): string {
  return `${value.toFixed(2)} mm`;
}

// ─── Percentages ──────────────────────────────────────────────────────────────

/** Format a 0-100 number as a percentage: "82%" */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

// ─── Visibility ───────────────────────────────────────────────────────────────

/** Format visibility in metres → display in km: "14.2 km" */
export function formatVisibilityKm(metres: number): string {
  return `${(metres / 1000).toFixed(1)} km`;
}

// ─── Time / Date ──────────────────────────────────────────────────────────────

/**
 * Format an ISO 8601 datetime string to a short time: "20:15"
 * Uses the browser / server locale.
 */
export function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Format an ISO 8601 date string to a short weekday label: "Thu"
 */
export function formatWeekday(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

/**
 * Format an ISO 8601 date string to a human-readable date: "27 Aug"
 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/**
 * Format an ISO 8601 datetime string to "HH:mm, DD Mon": "20:15, 27 Aug"
 */
export function formatDateTimeShort(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    day: "numeric",
    month: "short",
  });
}

// ─── UV Index ─────────────────────────────────────────────────────────────────

/** Return a human-readable UV risk label */
export function uvIndexLabel(value: number): string {
  if (value < 3) return "Low";
  if (value < 6) return "Moderate";
  if (value < 8) return "High";
  if (value < 11) return "Very High";
  return "Extreme";
}

// ─── WMO Weather Code ────────────────────────────────────────────────────────

/**
 * Convert a WMO weather interpretation code to a human-readable description.
 * Codes reference: https://open-meteo.com/en/docs (WMO Code table)
 */
export function wmoCodeDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight showers",
    81: "Moderate showers",
    82: "Violent showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm w/ hail",
    99: "Thunderstorm w/ heavy hail",
  };
  return descriptions[code] ?? `Weather code ${code}`;
}

/** Return an emoji icon for a WMO weather code */
export function wmoCodeEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌧️";
  if (code <= 65) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦️";
  if (code <= 86) return "🌨️";
  return "⛈️";
}
