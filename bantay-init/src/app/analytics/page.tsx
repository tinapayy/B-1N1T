"use client";

import { useEffect, useState, useMemo } from "react";
import useFirebaseData from "@/lib/useFirebaseData";
import LatestReadingCard from "@/app/analytics/LatestReadingCard";
import HeatAlertTable from "@/app/analytics/HeatAlertTable";
import AnalyticsLineChart from "@/app/analytics/AnalyticsLineChart";
import WeeklyBarChart from "@/app/analytics/WeeklyBarChart";
import { Card } from "@/components/ui/card";

const timeOptions = ["Daily", "Weekly", "Monthly", "Yearly"];
const alertTypeOptions = [
  "All Types",
  "Danger",
  "Extreme Caution",
  "Extreme Danger",
];
const heatIndexOptions = ["All Values", "30°C+", "40°C+", "50°C+"];
const dateOptions = ["Today", "This Week", "This Month", "Custom Range"];

export default function Analytics() {
  const {
    data: firebaseReadings,
    loading,
    error,
  } = useFirebaseData("/readings");
  const [latestReading, setLatestReading] = useState(null);
  const [filteredAlerts, setFilteredAlerts] = useState([]);

  const [selectedTimeframe, setSelectedTimeframe] = useState("Monthly");
  const [selectedAlertType, setSelectedAlertType] = useState("All Types");
  const [selectedHeatIndex, setSelectedHeatIndex] = useState("All Values");
  const [selectedDateRange, setSelectedDateRange] = useState("This Month");
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

  useEffect(() => {
    if (firebaseReadings.length > 0) {
      const latest = firebaseReadings.reduce((a, b) =>
        a.timestamp > b.timestamp ? a : b
      );
      setLatestReading(latest);
    }
  }, [firebaseReadings]);

  const parsedAlerts = useMemo(() => {
    return firebaseReadings
      .filter((r) => r.heatIndex >= 40)
      .map((r, i) => {
        const date = new Date(r.timestamp);
        let type = "Extreme Caution";
        if (r.heatIndex >= 52) type = "Extreme Danger";
        else if (r.heatIndex >= 41) type = "Danger";

        return {
          id: i,
          type,
          heatIndex: `${r.heatIndex.toFixed(1)}°C`,
          rawHeatIndex: r.heatIndex,
          dateTime: date.toLocaleString("en-PH", {
            hour: "2-digit",
            minute: "2-digit",
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
        };
      });
  }, [firebaseReadings]);

  useEffect(() => {
    let alerts = parsedAlerts;
    if (selectedAlertType !== "All Types") {
      alerts = alerts.filter((a) => a.type === selectedAlertType);
    }
    if (selectedHeatIndex === "30°C+")
      alerts = alerts.filter((a) => a.rawHeatIndex >= 30);
    if (selectedHeatIndex === "40°C+")
      alerts = alerts.filter((a) => a.rawHeatIndex >= 40);
    if (selectedHeatIndex === "50°C+")
      alerts = alerts.filter((a) => a.rawHeatIndex >= 50);
    setFilteredAlerts(alerts as any);
  }, [parsedAlerts, selectedAlertType, selectedHeatIndex]);

  const chartData = useMemo(
    () =>
      firebaseReadings.slice(-8).map((r, i) => ({
        month: `T${i + 1}`,
        heatIndex: r.heatIndex,
        temperature: r.temperature,
      })),
    [firebaseReadings]
  );

  const weeklyChartData = useMemo(
    () =>
      firebaseReadings.slice(-7).map((r, i) => ({
        day: `D${i + 1}`,
        minTemp: r.heatIndex - 3,
        maxTemp: r.heatIndex,
      })),
    [firebaseReadings]
  );

  if (loading || !latestReading)
    return (
      <div className="p-6 text-center text-gray-500">
        Loading real-time analytics...
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        Error loading data: {error.message}
      </div>
    );

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex-1 p-4 flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-1 lg:col-span-2">
            <AnalyticsLineChart
              data={chartData}
              timeframe={selectedTimeframe}
              setTimeframe={setSelectedTimeframe}
            />
          </div>
          <div className="col-span-1">
            <LatestReadingCard latest={latestReading} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          <div className="col-span-1 hidden md:block">
            <div className="grid grid-rows-3 gap-4 h-full">
              <Card className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold">48</div>
                  <div className="text-xs mt-1">Monthly</div>
                  <div className="text-xs">Extreme Alerts</div>
                </div>
              </Card>
              <Card className="bg-[var(--orange-primary)] text-white rounded-3xl shadow-sm p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold">51°C</div>
                  <div className="text-xs mt-1">Peak</div>
                  <div className="text-xs">Heat Index</div>
                </div>
              </Card>
              <Card className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold">+2°C</div>
                  <div className="text-xs mt-1">Change Since</div>
                  <div className="text-xs">Last Month</div>
                </div>
              </Card>
            </div>
          </div>
          <div className="col-span-3">
            <HeatAlertTable
              alerts={filteredAlerts}
              selectedAlertType={selectedAlertType}
              setSelectedAlertType={setSelectedAlertType}
              selectedHeatIndex={selectedHeatIndex}
              setSelectedHeatIndex={setSelectedHeatIndex}
              selectedDateRange={selectedDateRange}
              setSelectedDateRange={setSelectedDateRange}
            />
          </div>
          <div className="col-span-2">
            <WeeklyBarChart
              data={weeklyChartData}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
