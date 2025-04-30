"use client";

import { useState } from "react";
import WeatherGauge from "@/app/dashboard/weather-gauge";
import { DailyForecast } from "@/app/dashboard/daily-forecast";
import { HourlyForecast } from "@/app/dashboard/hourly-forecast";
import { Card, CardContent } from "@/components/ui/card";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { SuspenseCard } from "@/components/ui/suspense-card";
import dynamic from "next/dynamic";
import { LocationSearch } from "@/components/sections/location-search";
import { NotificationDropdown } from "@/components/sections/notification-dropdown";

const MapWidget = dynamic(() => import("@/app/dashboard/map-widget"), {
  ssr: false,
});

interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

export default function Dashboard() {
  const { setIsMobileMenuOpen } = useSidebar();
  const [location, setLocation] = useState<Location>({
    name: "Miagao, Iloilo",
    latitude: 10.6442,
    longitude: 122.2352,
  });

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-8 pb-8 lg:pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Weather Gauge + Search Bar */}
        <SuspenseCard
          height="min-h-[400px]"
          className="bg-white rounded-3xl shadow-md col-span-1"
        >
          <Card className="bg-white rounded-3xl shadow-md col-span-1 min-h-[400px]">
            <CardContent className="lg:p-8 p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <LocationSearch
                    initialLocation={location.name}
                    onLocationChange={(newLocation) => setLocation(newLocation)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <NotificationDropdown />
                </div>
              </div>
              <WeatherGauge location={location.name} />
            </CardContent>
          </Card>
        </SuspenseCard>

        {/* Right Column: Map */}
        <SuspenseCard
          height="min-h-[400px]"
          className="col-span-1 rounded-3xl shadow-md"
        >
          <Card className="col-span-1 min-h-[400px] flex items-center justify-center text-gray-500 rounded-3xl shadow-md">
            <MapWidget />
          </Card>
        </SuspenseCard>
      </div>

      {/* Second Row: Daily Forecast (1/3) | Hourly Forecast (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Daily Forecast Section */}
        <SuspenseCard
          height="min-h-[320px]"
          className="col-span-1 bg-white rounded-3xl shadow-md"
        >
          <Card className="col-span-1 bg-white rounded-3xl shadow-md min-h-[320px] max-h-[350px] overflow-auto">
            <CardContent className="p-4 h-full">
              <DailyForecast
                latitude={location.latitude}
                longitude={location.longitude}
              />
            </CardContent>
          </Card>
        </SuspenseCard>

        {/* Hourly Forecast Section */}
        <SuspenseCard
          height="min-h-[320px]"
          className="col-span-1 lg:col-span-2 bg-white rounded-3xl shadow-md"
        >
          <Card className="col-span-1 lg:col-span-2 bg-white rounded-3xl shadow-md min-h-[320px] max-h-[350px] overflow-auto">
            <CardContent className="p-4 h-full">
              <HourlyForecast
                latitude={location.latitude}
                longitude={location.longitude}
              />
            </CardContent>
          </Card>
        </SuspenseCard>
      </div>
    </div>
  );
}
