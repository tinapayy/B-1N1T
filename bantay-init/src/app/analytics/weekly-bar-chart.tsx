"use client";

import { useState } from "react";
import { ChartContainer } from "@/components/ui/chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

type MetricKey = "Temperature" | "Humidity" | "Heat Index";

const rawData: Record<
  MetricKey,
  { day: string; minTemp: number; maxTemp: number }[]
> = {
  Temperature: [
    { day: "MON", minTemp: 28, maxTemp: 45 },
    { day: "TUE", minTemp: 30, maxTemp: 48 },
    { day: "WED", minTemp: 27, maxTemp: 42 },
    { day: "THU", minTemp: 25, maxTemp: 38 },
    { day: "FRI", minTemp: 29, maxTemp: 44 },
    { day: "SAT", minTemp: 31, maxTemp: 46 },
    { day: "SUN", minTemp: 28, maxTemp: 43 },
  ],
  Humidity: [
    { day: "MON", minTemp: 45, maxTemp: 65 },
    { day: "TUE", minTemp: 50, maxTemp: 70 },
    { day: "WED", minTemp: 48, maxTemp: 68 },
    { day: "THU", minTemp: 52, maxTemp: 72 },
    { day: "FRI", minTemp: 55, maxTemp: 75 },
    { day: "SAT", minTemp: 60, maxTemp: 80 },
    { day: "SUN", minTemp: 58, maxTemp: 78 },
  ],
  "Heat Index": [
    { day: "MON", minTemp: 30, maxTemp: 48 },
    { day: "TUE", minTemp: 32, maxTemp: 50 },
    { day: "WED", minTemp: 29, maxTemp: 45 },
    { day: "THU", minTemp: 27, maxTemp: 42 },
    { day: "FRI", minTemp: 31, maxTemp: 47 },
    { day: "SAT", minTemp: 33, maxTemp: 49 },
    { day: "SUN", minTemp: 30, maxTemp: 46 },
  ],
};

const preprocessChartData = (data: (typeof rawData)[MetricKey]) =>
  data.map((d) => ({
    ...d,
    delta: d.maxTemp - d.minTemp,
  }));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md text-sm space-y-1">
      <p className="font-semibold">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div
          key={index}
          className="flex items-center justify-between text-sm gap-2"
        >
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name}</span>
          </div>
          <span className="font-medium">
            {entry.dataKey === "delta" ? data.maxTemp : data.minTemp}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function WeeklyBarChart({ isMobile, isTablet }: any) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("Heat Index");
  const [chartData, setChartData] = useState(
    preprocessChartData(rawData["Heat Index"])
  );

  const handleMetricChange = (metric: MetricKey) => {
    setSelectedMetric(metric);
    setChartData(preprocessChartData(rawData[metric]));
  };

  const config = {
    minTemp: { label: `Min ${selectedMetric}`, color: "var(--dark-gray-1)" },
    delta: {
      label: `Max ${selectedMetric}`,
      color: "var(--orange-primary, #f97316)",
    },
  };

  return (
    <Card className="bg-white rounded-3xl shadow-sm flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 py-4">
        <CardTitle className="text-xl font-semibold">
          Weekly Max & Min
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {selectedMetric} <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(rawData) as MetricKey[]).map((metric) => (
              <DropdownMenuItem
                key={metric}
                onClick={() => handleMetricChange(metric)}
              >
                {metric}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="pb-4 flex-grow flex flex-col">
        <ChartContainer
          config={config}
          className="h-[250px] flex-grow aspect-auto"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              barSize={isMobile ? 14 : isTablet ? 16 : 20}
              barGap={8}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis
                domain={[0, 80]}
                ticks={[0, 20, 40, 60, 80]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="minTemp"
                stackId="a"
                fill="var(--dark-gray-1)"
                name={`Min ${selectedMetric}`}
              />
              <Bar
                dataKey="delta"
                stackId="a"
                fill="var(--orange-primary)"
                name={`Max ${selectedMetric}`}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="flex justify-center mt-2 gap-6">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[var(--orange-primary)] mr-2"></div>
            <span className="text-sm">{`Max ${selectedMetric}`}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[var(--dark-gray-1)] mr-2"></div>
            <span className="text-sm">{`Min ${selectedMetric}`}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}