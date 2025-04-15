"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { ChevronDown, Download } from "lucide-react";
import { useState, useEffect } from "react";

// Sample data for different timeframes
const weeklyData = [
  { label: "Mon", heatIndex: 32, temperature: 30 },
  { label: "Tue", heatIndex: 35, temperature: 32 },
  { label: "Wed", heatIndex: 33, temperature: 31 },
  { label: "Thu", heatIndex: 36, temperature: 33 },
  { label: "Fri", heatIndex: 34, temperature: 32 },
  { label: "Sat", heatIndex: 31, temperature: 29 },
  { label: "Sun", heatIndex: 30, temperature: 28 },
];

const monthlyData = [
  { label: "Jul", heatIndex: 32, temperature: 30 },
  { label: "Aug", heatIndex: 33, temperature: 31 },
  { label: "Sep", heatIndex: 34, temperature: 32 },
  { label: "Oct", heatIndex: 35, temperature: 33 },
  { label: "Nov", heatIndex: 33, temperature: 31 },
  { label: "Dec", heatIndex: 36, temperature: 34 },
  { label: "Jan", heatIndex: 37, temperature: 35 },
  { label: "Feb", heatIndex: 38, temperature: 36 },
];

const yearlyData = [
  { label: "2018", heatIndex: 33, temperature: 31 },
  { label: "2019", heatIndex: 34, temperature: 32 },
  { label: "2020", heatIndex: 35, temperature: 33 },
  { label: "2021", heatIndex: 36, temperature: 34 },
  { label: "2022", heatIndex: 37, temperature: 35 },
  { label: "2023", heatIndex: 38, temperature: 36 },
  { label: "2024", heatIndex: 39, temperature: 37 },
];

export default function AnalyticsLineChart({ timeframe, setTimeframe }: any) {
  const [chartData, setChartData] = useState(monthlyData);

  useEffect(() => {
    switch (timeframe) {
      case "Weekly":
        setChartData(weeklyData);
        break;
      case "Monthly":
        setChartData(monthlyData);
        break;
      case "Yearly":
        setChartData(yearlyData);
        break;
      default:
        setChartData(monthlyData);
    }
  }, [timeframe]);

  const config = {
    heatIndex: { label: "Heat Index", color: "var(--orange-primary, #f97316)" },
    temperature: { label: "Temperature", color: "var(--dark-gray-1, #353535)" },
  };

  // Dynamically calculate Y-axis min/max with padding
  const getYDomain = (data: any[]) => {
    const all = data.flatMap((d) => [d.heatIndex, d.temperature]);
    const min = Math.min(...all);
    const max = Math.max(...all);
    const padding = 2;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  };

  const yDomain = getYDomain(chartData);

  return (
    <Card className="col-span-1 lg:col-span-2 bg-white rounded-3xl shadow-sm flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 py-4">
        <CardTitle className="text-xl font-semibold">Data Analytics</CardTitle>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2 sm:ml-4">
                {timeframe} <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {["Weekly", "Monthly", "Yearly"].map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => setTimeframe(option)}
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
          config={config}
          className="h-[250px] flex-grow aspect-auto"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis axisLine={false} tickLine={false} domain={yDomain} />
              <ChartTooltip content={<ChartTooltipContent />} />

              <Line
                type="monotone"
                dataKey="heatIndex"
                stroke="var(--color-heatIndex)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="var(--color-temperature)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="flex justify-between mt-2 pr-4 sm:pr-6">
          <div className="flex flex-col sm:flex-row items-start text-xs sm:text-sm whitespace-nowrap">
            <span className="flex items-center gap-1 shrink-0 ml-10">
              <span className="w-3 h-3 min-w-[12px] min-h-[12px] rounded-full bg-[var(--orange-primary)] shrink-0"></span>
              Heat Index
            </span>
            <span className="flex items-center gap-1 shrink-0 ml-10">
              <span className="w-3 h-3 min-w-[12px] min-h-[12px] rounded-full bg-[var(--dark-gray-1,#353535)] shrink-0"></span>
              Temperature
            </span>
          </div>
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
