"use client"

import { useState } from "react"
import WeatherGauge from "@/app/dashboard/weather-gauge"
import { DailyForecast } from "@/app/dashboard/daily-forecast"
import { HourlyForecast } from "@/app/dashboard/hourly-forecast"
import { Card, CardContent } from "@/components/ui/card"
import { SuspenseCard } from "@/components/ui/suspense-card"
import dynamic from "next/dynamic"
import { LocationSearch } from "@/components/sections/location-search"
import { NotificationDropdown } from "@/components/sections/notification-dropdown"
import { useSidebar } from "@/components/providers/sidebar-provider"

const MapWidget = dynamic(() => import("@/app/dashboard/map-widget"), {
  ssr: false,
})

interface Location {
  name: string
  latitude: number
  longitude: number
}

export default function Dashboard() {
    const { setIsMobileMenuOpen } = useSidebar();

  const [location, setLocation] = useState<Location>({
    name: "Miagao, Iloilo",
    latitude: 10.6442,
    longitude: 122.2352,
  })

  const [selectedSensorId, setSelectedSensorId] = useState("SENSOR_001")
  const [searchMode, setSearchMode] = useState<"forecast" | "analytics">("forecast")

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-8 pb-8 lg:pb-8">
      {/* Top Row: Weather Gauge and Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 transition-all duration-300 ease-in-out">
        <SuspenseCard height="min-h-[50vh] md:min-h-[400px]" className="bg-white rounded-3xl shadow-md col-span-1">
          <Card className="bg-white rounded-3xl shadow-md col-span-1 min-h-[50vh] md:min-h-[400px]">
            <CardContent className="p-4 md:p-6 lg:p-8 space-y-4">
              {/* Mobile and Desktop Layout */}
              <div className="space-y-4">
                {/* Top row - Search bar and notification button */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 max-w-[450px]">
                    <LocationSearch
                      mode={searchMode}
                      initialLocation={location.name}
                      onLocationChange={(loc) => {
                        if (searchMode === "forecast") setLocation(loc)
                      }}
                      onSensorSelect={(sensorId) => {
                        if (searchMode === "analytics") setSelectedSensorId(sensorId)
                      }}
                    />
                  </div>

                  {/* Toggle buttons - visible on larger screens only */}
                  <div className="hidden sm:flex items-center gap-1 mr-2 w-full max-w-[200px]">
                    <button
                      onClick={() => setSearchMode("forecast")}
                      className={`px-4 py-2 rounded-full flex-1 ${
                        searchMode === "forecast"
                          ? "bg-[var(--orange-primary)] text-white border-0"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      Forecast
                    </button>
                    <button
                      onClick={() => setSearchMode("analytics")}
                      className={`px-4 py-2 rounded-full flex-1 ${
                        searchMode === "analytics"
                          ? "bg-[var(--orange-primary)] text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      Sensor
                    </button>
                  </div>

                  {/* Notification button - always visible */}
                  <div className="flex-shrink-0">
                    <NotificationDropdown sensorId={selectedSensorId} />
                  </div>
                </div>

                {/* Second row - Toggle buttons now full width on mobile only */}
                <div className="sm:hidden flex items-center justify-between gap-1 w-full">
                  <button
                    onClick={() => setSearchMode("forecast")}
                    className={`flex-1 py-1.5 text-sm rounded-full ${
                      searchMode === "forecast"
                        ? "bg-[var(--orange-primary)] text-white border-0"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    Forecast
                  </button>
                  <button
                    onClick={() => setSearchMode("analytics")}
                    className={`flex-1 py-1.5 text-sm rounded-full ${
                      searchMode === "analytics" ? "bg-[var(--orange-primary)] text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    Sensor
                  </button>
                </div>
              </div>

              <WeatherGauge sensorId={selectedSensorId} />
            </CardContent>
          </Card>
        </SuspenseCard>

        <SuspenseCard
          height="min-h-[50vh] md:min-h-[400px]"
          className="bg-white rounded-3xl shadow-md col-span-1 aspect-[4/3] md:aspect-[16/9]"
        >
          <Card className="bg-white rounded-3xl shadow-md col-span-1 min-h-[50vh] md:min-h-[400px] flex items-center justify-center">
            <MapWidget onSensorSelect={setSelectedSensorId} />
          </Card>
        </SuspenseCard>
      </div>

      {/* Forecast Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <SuspenseCard height="min-h-[320px]" className="bg-white rounded-3xl shadow-md col-span-1">
          <Card className="bg-white rounded-3xl shadow-md col-span-1 min-h-[320px] max-h-[350px] overflow-auto">
            <CardContent className="p-4 h-full">
              <DailyForecast latitude={location.latitude} longitude={location.longitude} />
            </CardContent>
          </Card>
        </SuspenseCard>

        <SuspenseCard height="min-h-[320px]" className="bg-white rounded-3xl shadow-md col-span-1 lg:col-span-2">
          <Card className="bg-white rounded-3xl shadow-md col-span-1 lg:col-span-2 min-h-[320px] max-h-[350px] overflow-auto">
            <CardContent className="p-4 h-full">
              <HourlyForecast latitude={location.latitude} longitude={location.longitude} />
            </CardContent>
          </Card>
        </SuspenseCard>
      </div>
    </div>
  )
}
