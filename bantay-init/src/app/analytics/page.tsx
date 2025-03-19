"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sample data for the charts
const temperatureData = [
  { month: "Jul", heatIndex: 2, temperature: 3 },
  { month: "Aug", heatIndex: 3, temperature: 4 },
  { month: "Sep", heatIndex: 4, temperature: 5 },
  { month: "Oct", heatIndex: 5, temperature: 6 },
  { month: "Nov", heatIndex: 2.5, temperature: 7 },
  { month: "Dec", heatIndex: 6, temperature: 6 },
  { month: "Jan", heatIndex: 7, temperature: 7 },
  { month: "Feb", heatIndex: 9, temperature: 8 },
];

// Weekly data for stacked bar chart
const weeklyData = [
  { day: "MON", minTemp: 28, maxTemp: 17 },
  { day: "TUE", minTemp: 30, maxTemp: 18 },
  { day: "WED", minTemp: 27, maxTemp: 15 },
  { day: "THU", minTemp: 32, maxTemp: 18 },
  { day: "FRI", minTemp: 29, maxTemp: 17 },
  { day: "SAT", minTemp: 31, maxTemp: 16 },
  { day: "SUN", minTemp: 28, maxTemp: 17 },
];

const heatAlerts = [
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
  {
    id: 6,
    type: "Extreme Caution",
    heatIndex: "31",
    dateTime: "12/24/2025 - 2:30 PM",
  },
  {
    id: 7,
    type: "Extreme Caution",
    heatIndex: "31",
    dateTime: "12/24/2025 - 2:30 PM",
  },
  {
    id: 8,
    type: "Extreme Caution",
    heatIndex: "31",
    dateTime: "12/24/2025 - 2:30 PM",
  },
];

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
  const [selectedTimeframe, setSelectedTimeframe] = useState("Monthly");
  const [selectedAlertType, setSelectedAlertType] = useState("All Types");
  const [selectedHeatIndex, setSelectedHeatIndex] = useState("All Values");
  const [selectedDateRange, setSelectedDateRange] = useState("This Month");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Check device size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Chart configurations
  const lineChartConfig = {
    heatIndex: {
      label: "Heat Index",
      color: "var(--orange-primary)",
    },
    temperature: {
      label: "Temperature",
      color: "#000000",
    },
  };

  const barChartConfig = {
    minTemp: {
      label: "Min Heat Index",
      color: "#000000",
    },
    maxTemp: {
      label: "Max Heat Index",
      color: "var(--orange-primary)",
    },
  };

  // Stat cards component for reuse
  const StatCards = () => (
    <div className="grid grid-cols-3 md:grid-cols-1 gap-4 h-full">
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
  );

  return (
    <div className="flex min-h-screen bg-[#f2f3f5]">
      {/* Main Content */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Analytics Chart */}
          <Card className="col-span-1 lg:col-span-2 bg-white rounded-3xl shadow-sm flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
              <CardTitle className="text-xl font-semibold">
                Data Analytics
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <span className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-[var(--orange-primary)] mr-1"></span>
                    Heat Index
                  </span>
                  <span className="flex items-center ml-4">
                    <span className="h-3 w-3 rounded-full bg-black mr-1"></span>
                    Temperature
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-4">
                      {selectedTimeframe}{" "}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {timeOptions.map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => setSelectedTimeframe(option)}
                      >
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-4 flex-grow flex flex-col">
              <ChartContainer
                config={lineChartConfig}
                className="h-[300px] flex-grow aspect-auto"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={temperatureData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="var(--color-temperature)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="heatIndex"
                      stroke="var(--color-heatIndex)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="flex justify-end mt-4 pr-6">
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="mr-2 h-4 w-4" /> Export Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Highest Daily Record */}
          <Card className="col-span-1 bg-white rounded-3xl shadow-sm flex flex-col">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-xl font-semibold">
                Highest Daily Record
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-4 flex-grow justify-center">
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">28°C</span>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#f0f0f0"
                    strokeWidth="16"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="var(--orange-primary)"
                    strokeWidth="16"
                    strokeDasharray="251"
                    strokeDashoffset="70"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute -bottom-8 w-full text-center text-sm font-medium">
                  Heat Index
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 w-full mt-4">
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold">31°C</span>
                    </div>
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#f0f0f0"
                        strokeWidth="16"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#000000"
                        strokeWidth="16"
                        strokeDasharray="251"
                        strokeDashoffset="85"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                  </div>
                  <span className="text-sm mt-3 font-medium">Temperature</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold">22%</span>
                    </div>
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#f0f0f0"
                        strokeWidth="16"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#000000"
                        strokeWidth="16"
                        strokeDasharray="251"
                        strokeDashoffset="220"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                  </div>
                  <span className="text-sm mt-3 font-medium">Humidity</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          {/* Mobile Stats - Only visible on small screens */}
          <div className="md:hidden mb-4">
            <StatCards />
          </div>
          {/* Heat Alert Stats and Table */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Heat Alert Stats - Hidden on mobile, shown on md+ */}
            <div className="hidden md:block col-span-1">
              <StatCards />
            </div>

            {/* Heat Alert Table */}
            <Card className="col-span-1 md:col-span-3 bg-white rounded-3xl shadow-sm flex flex-col">
              <CardHeader className="px-6 py-4">
                <CardTitle className="text-xl font-semibold">
                  Extreme Heat Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 flex-grow flex flex-col">
                <div className="flex flex-wrap gap-2 mb-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs">
                        {selectedAlertType}{" "}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {alertTypeOptions.map((option) => (
                        <DropdownMenuItem
                          key={option}
                          onClick={() => setSelectedAlertType(option)}
                        >
                          {option}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs">
                        {selectedHeatIndex}{" "}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {heatIndexOptions.map((option) => (
                        <DropdownMenuItem
                          key={option}
                          onClick={() => setSelectedHeatIndex(option)}
                        >
                          {option}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs">
                        {selectedDateRange}{" "}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {dateOptions.map((option) => (
                        <DropdownMenuItem
                          key={option}
                          onClick={() => setSelectedDateRange(option)}
                        >
                          {option}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="overflow-auto max-h-[280px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-1/3 py-2">Type</TableHead>
                        <TableHead className="w-1/3 text-center py-2">
                          Heat Index
                        </TableHead>
                        <TableHead className="w-1/3 text-right py-2">
                          Date & Time
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {heatAlerts.map((alert) => (
                        <TableRow key={alert.id} className="hover:bg-muted/50">
                          <TableCell className="py-2 pl-2">
                            <div className="flex items-center">
                              <div
                                className={`h-3 w-3 rounded-full mr-2 ${
                                  alert.type === "Danger"
                                    ? "bg-[var(--orange-primary)]"
                                    : alert.type === "Extreme Caution"
                                    ? "bg-yellow-500"
                                    : "bg-red-600"
                                }`}
                              ></div>
                              {alert.type}
                            </div>
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            {alert.heatIndex}
                          </TableCell>
                          <TableCell className="py-2 text-gray-500 text-right">
                            {alert.dateTime}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Max & Min Chart */}
          <Card className="col-span-1 bg-white rounded-3xl shadow-sm flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
              <CardTitle className="text-xl font-semibold">
                Weekly Max & Min
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    Heat Index <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Heat Index</DropdownMenuItem>
                  <DropdownMenuItem>Temperature</DropdownMenuItem>
                  <DropdownMenuItem>Humidity</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="pb-4 flex-grow flex flex-col">
              <ChartContainer
                config={barChartConfig}
                className="h-[300px] flex-grow aspect-auto"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyData}
                    margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
                    barSize={isMobile ? 15 : isTablet ? 18 : 25}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis
                      domain={[0, 60]}
                      ticks={[0, 15, 30, 45, 60]}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="minTemp"
                      stackId="a"
                      fill="var(--color-minTemp)"
                    />
                    <Bar
                      dataKey="maxTemp"
                      stackId="a"
                      fill="var(--color-maxTemp)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-[var(--orange-primary)] mr-2"></div>
                  <span className="text-sm">Max Heat Index</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-black mr-2"></div>
                  <span className="text-sm">Min Heat Index</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
