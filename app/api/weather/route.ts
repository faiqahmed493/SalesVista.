/**
 * Route Handler: GET /api/weather
 *
 * Proxies the weather service and returns normalised JSON.
 * Client Components can call this endpoint to refresh weather data
 * without exposing the Open-Meteo URL to the browser.
 *
 * Query params:
 *   ?location=karachi   (optional, defaults to "karachi")
 *   ?refresh=true       (optional, bypasses cache)
 *
 * Responses:
 *   200 { success: true,  data: WeatherDashboardData }
 *   400 { success: false, error: WeatherError }       — invalid location
 *   500 { success: false, error: WeatherError }       — upstream failure
 */

import { type NextRequest } from "next/server";
import { getWeather } from "@/lib/data/weather/weatherService";

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = request.nextUrl;

  const locationId = searchParams.get("location") ?? undefined;
  const forceRefresh = searchParams.get("refresh") === "true";

  const result = await getWeather({ locationId, forceRefresh });

  if (!result.success) {
    const statusCode =
      result.error.kind === "invalid_location" ? 400 : 500;

    return Response.json(result, { status: statusCode });
  }

  return Response.json(result, {
    status: 200,
    headers: {
      // Allow CDN / browser caching in line with ISR period
      "Cache-Control": forceRefresh
        ? "no-store"
        : "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}
