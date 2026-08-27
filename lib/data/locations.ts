/**
 * Location configuration for the dashboard.
 *
 * Adding a new city: add an entry to SUPPORTED_LOCATIONS.
 * The UI will automatically reflect the new location.
 * Timezones follow IANA tz database names (e.g., "Asia/Karachi").
 */

export interface LocationConfig {
  /** Unique slug used as a query param / key */
  id: string;
  /** Display name shown in UI */
  name: string;
  /** Country or region label */
  country: string;
  latitude: number;
  longitude: number;
  /** IANA timezone identifier */
  timezone: string;
}

export const SUPPORTED_LOCATIONS: LocationConfig[] = [
  {
    id: "karachi",
    name: "Karachi",
    country: "Pakistan",
    latitude: 24.8607,
    longitude: 67.0011,
    timezone: "Asia/Karachi",
  },
  {
    id: "lahore",
    name: "Lahore",
    country: "Pakistan",
    latitude: 31.5204,
    longitude: 74.3587,
    timezone: "Asia/Karachi",
  },
  {
    id: "islamabad",
    name: "Islamabad",
    country: "Pakistan",
    latitude: 33.6844,
    longitude: 73.0479,
    timezone: "Asia/Karachi",
  },
];

/** Default location used when none is specified. */
export const DEFAULT_LOCATION_ID = "karachi";

/**
 * Finds a location by its ID.
 * Returns `undefined` if the location is not found.
 */
export function findLocationById(id: string): LocationConfig | undefined {
  return SUPPORTED_LOCATIONS.find((loc) => loc.id === id);
}

/**
 * Returns the default location config.
 * Safe to call without arguments – always returns a valid location.
 */
export function getDefaultLocation(): LocationConfig {
  return SUPPORTED_LOCATIONS.find((l) => l.id === DEFAULT_LOCATION_ID)!;
}
