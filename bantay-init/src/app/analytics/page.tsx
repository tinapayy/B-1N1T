"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import LatestReadingCard from "@/app/analytics/highest-daily-records";
import HeatAlertTable from "@/app/analytics/heat-alerts-table";
import AnalyticsLineChart from "@/app/analytics/analytics-line-chart";
import WeeklyBarChart from "@/app/analytics/weekly-bar-chart";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { SuspenseCard } from "@/components/ui/suspense-card";
import { LocationSearch } from "@/components/sections/location-search";
import { NotificationDropdown } from "@/components/sections/notification-dropdown";

// Sample data for the charts
const monthlyData = [
  { month: "Jul", heatIndex: 2, temperature: 3 },
  { month: "Aug", heatIndex: 3, temperature: 4 },
  { month: "Sep", heatIndex: 4, temperature: 5 },
  { month: "Oct", heatIndex: 5, temperature: 6 },
  { month: "Nov", heatIndex: 3, temperature: 7 },
  { month: "Dec", heatIndex: 6, temperature: 7 },
  { month: "Jan", heatIndex: 7, temperature: 8 },
  { month: "Feb", heatIndex: 8, temperature: 7 },
];

const weeklyData = [
  { day: "MON", minTemp: 28, maxTemp: 45 },
  { day: "TUE", minTemp: 30, maxTemp: 48 },
  { day: "WED", minTemp: 27, maxTemp: 42 },
  { day: "THU", minTemp: 25, maxTemp: 38 },
  { day: "FRI", minTemp: 29, maxTemp: 44 },
  { day: "SAT", minTemp: 31, maxTemp: 46 },
  { day: "SUN", minTemp: 28, maxTemp: 43 },
];

const alertsData = [
  {
    id: 1,
    type: "Danger",
    heatIndex: "47°C",
    dateTime: "12/24/2025 - 2:30 PM",
  },
  {
    id: 2,
    type: "Extreme Caution",
    heatIndex: "31°C",
    dateTime: "12/24/2025 - 2:30 PM",
  },
  {
    id: 3,
    type: "Extreme Danger",
    heatIndex: "52°C",
    dateTime: "12/24/2025 - 2:30 PM",
  },
  {
    id: 4,
    type: "Danger",
    heatIndex: "45°C",
    dateTime: "12/24/2025 - 2:30 PM",
  },
  {
    id: 5,
    type: "Extreme Caution",
    heatIndex: "31",
    dateTime: "12/24/2025 - 2:30 PM",
  },
];

// Latest reading data
const latestReading = {
  temperature: 31,
  humidity: 22,
  heatIndex: 28,
  timestamp: new Date().getTime(),
};

export default function Analytics() {
  const { setIsMobileMenuOpen } = useSidebar();
  const [selectedTimeframe, setSelectedTimeframe] = useState("Monthly");
  const [selectedAlertType, setSelectedAlertType] = useState("All Types");
  const [selectedHeatIndex, setSelectedHeatIndex] = useState("All Values");
  const [selectedDateRange, setSelectedDateRange] = useState("This Month");
  const [location, setLocation] = useState("Miagao, Iloilo");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-8 pb-8 lg:pb-8">
      {/* Location Search Card */}
      <SuspenseCard
        height="h-[80px]"
        className="bg-white rounded-3xl shadow-sm mb-4"
      >
        <Card className="bg-white rounded-3xl shadow-sm mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1">
                <LocationSearch
                  initialLocation={location}
                  onLocationChange={(newLocation) => setLocation(newLocation)}
                />
              </div>
              <div className="flex items-center gap-2">
                <NotificationDropdown />
              </div>
            </div>
          </CardContent>
        </Card>
      </SuspenseCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Analytics Chart */}
        <SuspenseCard
          height="min-h-[300px]"
          className="col-span-1 lg:col-span-2 bg-white rounded-3xl shadow-sm"
        >
          <AnalyticsLineChart
            data={monthlyData}
            timeframe={selectedTimeframe}
            setTimeframe={setSelectedTimeframe}
          />
        </SuspenseCard>

        {/* Highest Daily Record */}
        <SuspenseCard
          height="min-h-[300px]"
          className="col-span-1 bg-white rounded-3xl shadow-sm"
        >
          <LatestReadingCard latest={latestReading} />
        </SuspenseCard>
      </div>

      {/* Mobile Stats Cards - Only visible on small screens */}
      <div className="grid grid-cols-3 gap-4 mt-4 sm:hidden">
        <SuspenseCard
          height="h-[120px]"
          className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm"
        >
          <Card className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm h-full">
            <CardContent className="p-3 flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-xl font-bold">48</div>
                <div className="text-[10px] leading-tight mt-1 px-1">
                  Monthly
                  <br />
                  Alerts
                </div>
              </div>
            </CardContent>
          </Card>
        </SuspenseCard>

        <SuspenseCard
          height="h-[120px]"
          className="bg-[var(--orange-primary)] text-white rounded-3xl shadow-sm"
        >
          <Card className="bg-[var(--orange-primary)] text-white rounded-3xl shadow-sm h-full">
            <CardContent className="p-3 flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-xl font-bold">51°C</div>
                <div className="text-[10px] leading-tight mt-1 px-1">
                  Peak
                  <br />
                  Heat Index
                </div>
              </div>
            </CardContent>
          </Card>
        </SuspenseCard>

        <SuspenseCard
          height="h-[120px]"
          className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm"
        >
          <Card className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm h-full">
            <CardContent className="p-3 flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-xl font-bold">+2°C</div>
                <div className="text-[10px] leading-tight mt-1 px-1">
                  Change
                  <br />
                  Since Last Month
                </div>
              </div>
            </CardContent>
          </Card>
        </SuspenseCard>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-4 mt-4">
        {/* Stats Cards - Hidden on small screens, row layout on medium screens */}
        <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-1 col-span-12 lg:col-span-2 xl:col-span-2 gap-4 text-center">
          <SuspenseCard
            height="h-[120px]"
            className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm"
          >
            <Card className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm h-full">
              <CardContent className="p-4 flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">48</div>
                  <div className="text-xs mt-1">Monthly Extreme Alerts</div>
                </div>
              </CardContent>
            </Card>
          </SuspenseCard>

          <SuspenseCard
            height="h-[120px]"
            className="bg-[var(--orange-primary)] text-white rounded-3xl shadow-sm"
          >
            <Card className="bg-[var(--orange-primary)] text-white rounded-3xl shadow-sm h-full">
              <CardContent className="p-4 flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">51°C</div>
                  <div className="text-xs mt-1 px-1 sm:px-0">
                    Peak Heat Index
                  </div>
                </div>
              </CardContent>
            </Card>
          </SuspenseCard>

          <SuspenseCard
            height="h-[120px]"
            className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm"
          >
            <Card className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm h-full">
              <CardContent className="p-4 flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">+2°C</div>
                  <div className="text-xs mt-1 px-1 sm:px-0">
                    Change Since Last Month
                  </div>
                </div>
              </CardContent>
            </Card>
          </SuspenseCard>
        </div>

        {/* Heat Alerts Table and Weekly Chart - Stack between 1028px and 1400px */}
        <div className="col-span-12 lg:col-span-10 xl:grid xl:grid-cols-10 gap-4">
          <div className="xl:col-span-6 mb-4 xl:mb-0">
            <SuspenseCard
              height="min-h-[350px]"
              className="bg-white rounded-3xl shadow-sm"
            >
              <HeatAlertTable
                alerts={alertsData}
                selectedAlertType={selectedAlertType}
                setSelectedAlertType={setSelectedAlertType}
                selectedHeatIndex={selectedHeatIndex}
                setSelectedHeatIndex={setSelectedHeatIndex}
                selectedDateRange={selectedDateRange}
                setSelectedDateRange={setSelectedDateRange}
              />
            </SuspenseCard>
          </div>

          <div className="xl:col-span-4">
            <SuspenseCard
              height="min-h-[350px]"
              className="bg-white rounded-3xl shadow-sm"
            >
              <WeeklyBarChart
                data={weeklyData}
                isMobile={isMobile}
                isTablet={isTablet}
              />
            </SuspenseCard>
          </div>
        </div>
      </div>
    </div>
  );
}
