"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import HighestDailyRecords from "@/app/analytics/highest-daily-records";
import HeatAlertTable from "@/app/analytics/heat-alerts-table";
import AnalyticsLineChart from "@/app/analytics/analytics-line-chart";
import WeeklyBarChart from "@/app/analytics/weekly-bar-chart";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { SuspenseCard } from "@/components/ui/suspense-card";
import { LocationSearch } from "@/components/sections/location-search";
import { NotificationDropdown } from "@/components/sections/notification-dropdown";
import { SensorDropdown } from "@/components/sections/sensor-dropdown";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Analytics() {
  const { setIsMobileMenuOpen } = useSidebar();

  const [selectedTimeframe, setSelectedTimeframe] = useState("Monthly");
  const [selectedAlertType, setSelectedAlertType] = useState("All Types");
  const [selectedHeatIndex, setSelectedHeatIndex] = useState("All Values");
  const [selectedDateRange, setSelectedDateRange] = useState("This Month");

  const [selectedSensorId, setSelectedSensorId] = useState<string | null>("SENSOR_002");

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const sensorId = selectedSensorId?.startsWith("SENSOR_") ? selectedSensorId : null;

  // SWRs only fire when a valid sensorId is set
  const { data: summaryData } = useSWR(
    sensorId ? `/api/analytics/summary?sensorId=${sensorId}` : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
    }
  );

  const { data: weeklyData } = useSWR(
    sensorId ? `/api/analytics/weekly?sensorId=${sensorId}` : null,
    fetcher
  );

  const { data: alertData } = useSWR(
    sensorId ? `/api/analytics/alerts?sensorId=${sensorId}&range=month` : null,
    fetcher
  );
  
  const { data: highestData } = useSWR(
    sensorId ? `/api/analytics/highest?sensorId=${sensorId}` : null,
    fetcher
  );

  const { data: peakData } = useSWR(
    sensorId ? `/api/analytics/peak?sensorId=${sensorId}` : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );
  
  
  console.log("PEAK DATA:", peakData); 

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
      <SuspenseCard height="h-[80px]" className="bg-white rounded-3xl shadow-sm mb-4">
        <Card className="bg-white rounded-3xl shadow-sm mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1">
              <SensorDropdown
                selected={selectedSensorId ?? ""}
                onChange={(sensorId) => {
                  if (sensorId?.startsWith("SENSOR_")) {
                    setSelectedSensorId(sensorId);
                  }
                }}
              />
              </div>
              <div className="flex items-center gap-2">
                <NotificationDropdown />
              </div>
            </div>
          </CardContent>
        </Card>
      </SuspenseCard>

      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SuspenseCard height="min-h-[300px]" className="col-span-1 lg:col-span-2 bg-white rounded-3xl shadow-sm">
        <AnalyticsLineChart
          sensorId={sensorId}
          timeframe={selectedTimeframe}
          setTimeframe={setSelectedTimeframe}
        />
        </SuspenseCard>
        <SuspenseCard height="min-h-[300px]" className="col-span-1 bg-white rounded-3xl shadow-sm">
        <HighestDailyRecords sensorId={sensorId} />

        </SuspenseCard>
      </div>

      {/* Mobile Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 sm:hidden">
        <SuspenseCard height="h-[120px]" className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm">
          <Card className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm h-full">
            <CardContent className="p-3 flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-xl font-bold">{alertData?.alertCount || 0}</div>
                <div className="text-[10px] leading-tight mt-1 px-1">Monthly<br />Alerts</div>
              </div>
            </CardContent>
          </Card>
        </SuspenseCard>
        <SuspenseCard height="h-[120px]" className="bg-[var(--orange-primary)] text-white rounded-3xl shadow-sm">
        <Card className="bg-[var(--orange-primary)] text-white rounded-3xl shadow-sm h-full">
          <CardContent className="p-3 flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-xl font-bold">
                {peakData?.alltimeMax?.heatIndex != null
                  ? `${Number(peakData.alltimeMax.heatIndex).toFixed(1)}°C`
                  : "—"}
              </div>
              <div className="text-[10px] leading-tight mt-1 px-1">Peak<br />Heat Index</div>
            </div>
          </CardContent>
        </Card>
      </SuspenseCard>

        <SuspenseCard height="h-[120px]" className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm">
          <Card className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm h-full">
            <CardContent className="p-3 flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-xl font-bold">+2°C</div>
                <div className="text-[10px] leading-tight mt-1 px-1">Change<br />Since Last Month</div>
              </div>
            </CardContent>
          </Card>
        </SuspenseCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-4 mt-4">
        <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-1 col-span-12 lg:col-span-2 xl:col-span-2 gap-4 text-center">
          <SuspenseCard height="h-[120px]" className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm">
            <Card className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm h-full">
              <CardContent className="p-4 flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{alertData?.alertCount || 0}</div>
                  <div className="text-xs mt-1">Monthly Extreme Alerts</div>
                </div>
              </CardContent>
            </Card>
          </SuspenseCard>
          <SuspenseCard height="h-[120px]" className="bg-[var(--orange-primary)] text-white rounded-3xl shadow-sm">
            <Card className="bg-[var(--orange-primary)] text-white rounded-3xl shadow-sm h-full">
              <CardContent className="p-4 flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{peakData?.alltimeMax?.heatIndex != null
                  ? `${Number(peakData.alltimeMax.heatIndex).toFixed(1)}°C`
                  : "—"}</div>
                  <div className="text-xs mt-1 px-1 sm:px-0">Peak Heat Index</div>
                </div>
              </CardContent>
            </Card>
          </SuspenseCard>
          <SuspenseCard height="h-[120px]" className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm">
            <Card className="bg-[var(--dark-gray-1)] text-white rounded-3xl shadow-sm h-full">
              <CardContent className="p-4 flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">+2°C</div>
                  <div className="text-xs mt-1 px-1 sm:px-0">Change Since Last Month</div>
                </div>
              </CardContent>
            </Card>
          </SuspenseCard>
        </div>

        <div className="col-span-12 lg:col-span-10 xl:grid xl:grid-cols-10 gap-4">
          <div className="xl:col-span-6 mb-4 xl:mb-0">
            <SuspenseCard height="min-h-[350px]" className="bg-white rounded-3xl shadow-sm">
              <HeatAlertTable
                alerts={alertData?.alerts || []}
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
            <SuspenseCard height="min-h-[350px]" className="bg-white rounded-3xl shadow-sm">
            <WeeklyBarChart
              sensorId={sensorId ?? ""}
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
