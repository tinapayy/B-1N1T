"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sections/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bell, Menu, Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import LatestReadingCard from "@/app/analytics/LatestReadingCard";
import HeatAlertTable from "@/app/analytics/HeatAlertTable";
import AnalyticsLineChart from "@/app/analytics/AnalyticsLineChart";
import WeeklyBarChart from "@/app/analytics/WeeklyBarChart";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("Monthly");
  const [selectedAlertType, setSelectedAlertType] = useState("All Types");
  const [selectedHeatIndex, setSelectedHeatIndex] = useState("All Values");
  const [selectedDateRange, setSelectedDateRange] = useState("This Month");
  const [location, setLocation] = useState("Miagao, Iloilo");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [trendData, setTrendData] = useState([]);
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await fetch("/api/analytics/trends");
        const data = await res.json();

        const formatted = data.map((d: {
          date: string;
          averageHeatIndex: number;
          averageTemperature: number;
          averageHumidity: number;
        }) => ({
          month: d.date,
          heatIndex: d.averageHeatIndex,
          temperature: d.averageTemperature,
          humidity: d.averageHumidity,
        }));

        setTrendData(formatted);
      } catch (err) {
        console.error("Error fetching trends:", err);
      }
    };

    fetchTrends(); // initial fetch

    const interval = setInterval(fetchTrends, 5000); // fetch every 5 seconds

    return () => clearInterval(interval); // cleanup
  }, []);

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
    <div className="flex flex-col min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 lg:p-6 lg:pt-4">
        {/* Location Search Card */}
        <Card className="bg-white rounded-3xl shadow-sm mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[var(--orange-primary)]" />
                <span className="font-medium">{location}</span>
              </div>
              <div className="relative flex-1 max-w-md ml-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search city..."
                  className="pl-10 w-full"
                  onChange={(e) => {
                    if (e.target.value) {
                      // In a real app, this would trigger a search
                    }
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Analytics Chart */}
          <AnalyticsLineChart
            data={trendData}
            timeframe={selectedTimeframe}
            setTimeframe={setSelectedTimeframe}
          />

          {/* Highest Daily Record */}
          <LatestReadingCard latest={latestReading} />
        </div>

        {/* Mobile Stats Cards - Only visible on small screens */}
        <div className="grid grid-cols-3 gap-4 mt-4 sm:hidden">
          <Card className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold">48</div>
                <div className="text-xs mt-1">Monthly</div>
                <div className="text-xs">Alerts</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--orange-primary)] text-white rounded-3xl shadow-sm">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold">51°C</div>
                <div className="text-xs mt-1">Peak</div>
                <div className="text-xs">Heat</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold">+2°C</div>
                <div className="text-xs mt-1">Change</div>
                <div className="text-xs">Since</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-4 mt-4">
          {/* Stats Cards - Hidden on small screens, row layout on medium screens */}
          <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-1 col-span-12 lg:col-span-2 xl:col-span-2 gap-4 text-center">
            <Card className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">48</div>
                  <div className="text-xs mt-1">Monthly</div>
                  <div className="text-xs">Extreme Alerts</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--orange-primary)] text-white rounded-3xl shadow-sm">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">51°C</div>
                  <div className="text-xs mt-1">Peak</div>
                  <div className="text-xs">Heat Index</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">+2°C</div>
                  <div className="text-xs mt-1">Change Since</div>
                  <div className="text-xs">Last Month</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Heat Alerts Table and Weekly Chart - Stack between 1028px and 1400px */}
          <div className="col-span-12 lg:col-span-10 xl:grid xl:grid-cols-10 gap-4">
            <div className="xl:col-span-6 mb-4 xl:mb-0">
              <HeatAlertTable
                alerts={alertsData}
                selectedAlertType={selectedAlertType}
                setSelectedAlertType={setSelectedAlertType}
                selectedHeatIndex={selectedHeatIndex}
                setSelectedHeatIndex={setSelectedHeatIndex}
                selectedDateRange={selectedDateRange}
                setSelectedDateRange={setSelectedDateRange}
              />
            </div>

            <div className="xl:col-span-4">
              <WeeklyBarChart
                data={weeklyData}
                isMobile={isMobile}
                isTablet={isTablet}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
