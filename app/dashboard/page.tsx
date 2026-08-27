import type { Metadata } from "next";
import { getWeather } from "@/lib/data/weather/weatherService";
import { SUPPORTED_LOCATIONS } from "@/lib/data/locations";
import DashboardContainer from "@/components/dashboard/DashboardContainer";

export const metadata: Metadata = {
  title: "Weather Analytics Dashboard",
  description:
    "Real-time weather intelligence and forecast analytics powered by Open-Meteo.",
};

interface PageProps {
  searchParams: Promise<{ location?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { location: locationParam } = await searchParams;
  const locationId = locationParam ?? "karachi";

  const result = await getWeather({ locationId });

  return (
    <DashboardContainer
      initialData={result.success ? result.data : null}
      initialLocationId={locationId}
      initialError={result.success ? null : result.error}
      locations={SUPPORTED_LOCATIONS}
    />
  );
}
