"use client";

import { useState } from "react";
import WeatherGauge from "@/components/sections/weather-gauge";
import { Sidebar } from "@/components/sections/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bell, Menu } from "lucide-react";

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Weather Gauge + Search Bar */}
          <Card className="bg-white rounded-3xl shadow-lg col-span-1">
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

              <WeatherGauge
                temperature={28}
                humidity={77.2}
                heatIndex={31}
                location="Miagao, Iloilo"
                lastUpdated="12:08 AM"
              />
            </CardContent>
          </Card>

          {/* Right Column: Map */}
          <Card className="col-span-1 md:h-[300px] flex items-center justify-center text-gray-500">
            Placeholder for Widget 1 (Map)
          </Card>
        </div>

        {/* Second Row: Daily Forecast (1/3) | Hourly Forecast (2/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Card className="col-span-1 flex items-center justify-center h-[200px] text-gray-500">
            Placeholder for Widget 2 (Daily Forecast)
          </Card>
          <Card className="col-span-1 lg:col-span-2 flex items-center justify-center h-[200px] text-gray-500">
            Placeholder for Widget 3 (Hourly Forecast)
          </Card>
        </div>
      </div>
    </div>
  );
}
