"use client";
import WeatherGauge from "@/components/sections/weather-gauge";
import MapWidget from "@/components/sections/map-widget";
import { DailyForecast } from "@/components/sections/daily-forecast";
import { HourlyForecast } from "@/components/sections/hourly-forecast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bell, Menu } from "lucide-react";
import { useSidebar } from "@/components/providers/sidebar-provider";

export default function Dashboard() {
  const { setIsMobileMenuOpen } = useSidebar();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Main Content - Improved height handling */}
      <div className="flex-1 overflow-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Weather Gauge + Search Bar */}
          <Card className="bg-white rounded-3xl shadow-lg col-span-1 min-h-[400px]">
            <CardContent className="p-4 space-y-4">
              {/* Search Bar & Icons inside Weather Gauge Section */}
              <div className="flex items-center gap-4">
                <div className="w-full">
                  <Input
                    type="search"
                    placeholder="Search City"
                    className="w-full"
                  />
                </div>
                <button className="p-2 border border-gray-300 rounded-md">
                  <Bell className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-2 border border-gray-300 rounded-md md:hidden"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>

              {/* WeatherGauge now handles dynamic Firebase data internally */}
              <WeatherGauge location="Miagao, Iloilo" />
            </CardContent>
          </Card>

          {/* Right Column: Map */}
          <Card className="col-span-1 min-h-[400px] flex items-center justify-center text-gray-500 rounded-3xl shadow-lg">
            <MapWidget />
          </Card>
        </div>

        {/* Second Row: Daily Forecast (1/3) | Hourly Forecast (2/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Daily Forecast Section */}
          <Card className="col-span-1 bg-white rounded-3xl shadow-lg min-h-[320px] max-h-[350px] overflow-auto">
            <CardContent className="p-4 h-full">
              <DailyForecast />
            </CardContent>
          </Card>

          {/* Hourly Forecast Section */}
          <Card className="col-span-1 lg:col-span-2 bg-white rounded-3xl shadow-lg min-h-[320px] max-h-[350px] overflow-auto">
            <CardContent className="p-4 h-full">
              <HourlyForecast />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
