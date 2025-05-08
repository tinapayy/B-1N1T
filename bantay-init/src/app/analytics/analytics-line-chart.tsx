// analytics/analytics-line-chart.tsx

"use client";

import useSWR from "swr";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
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
  TooltipProps,
} from "recharts";
import { Button } from "@/components/ui/button";
import { ChevronDown, Download } from "lucide-react";
import { convertToCSV, downloadCSV } from "@/lib/csv";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const TIMEFRAME_MAP: Record<string, string> = {
  Weekly: "week",
  Monthly: "month",
  Yearly: "year",
};

export default function AnalyticsLineChart({
  sensorId,
  timeframe,
  setTimeframe,
}: {
  sensorId: string;
  timeframe: string;
  setTimeframe: (val: string) => void;
}) {
  const mappedTimeframe = TIMEFRAME_MAP[timeframe] || "week";

  const { data = [], isLoading } = useSWR(
    sensorId
      ? `/api/analytics/summary?sensorId=${sensorId}&timeframe=${mappedTimeframe}`
      : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const transformed = Array.isArray(data)
    ? data
        .filter(
          (entry) =>
            typeof entry.avgHeatIndex === "number" &&
            typeof entry.avgTemp === "number"
        )
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        .map((entry: any) => ({
          label: formatLabel(entry.timestamp, timeframe),
          heatIndex: entry.avgHeatIndex,
          temperature: entry.avgTemp,
          isPartial: entry.isPartial ?? false,
        }))
    : [];

  const config = {
    heatIndex: {
      label: "Heat Index",
      color: "var(--orange-primary, #f97316)",
    },
    temperature: {
      label: "Temperature",
      color: "var(--dark-gray-1, #353535)",
    },
  };

  const getYDomain = (entries: any[]) => {
    const values = entries.flatMap((d) => [d.heatIndex, d.temperature]);
    const valid = values.filter((v) => typeof v === "number");
    if (!valid.length) return [0, 50];
    const min = Math.min(...valid);
    const max = Math.max(...valid);
    return [Math.floor(min - 2), Math.ceil(max + 2)];
  };

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
              data={transformed}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                domain={getYDomain(transformed)}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="heatIndex"
                stroke={config.heatIndex.color}
                strokeWidth={2}
                dot={(props) =>
                  props.payload?.isPartial ? (
                    <circle
                      {...props}
                      r={4}
                      stroke={config.heatIndex.color}
                      fill="transparent"
                      strokeDasharray="2 2"
                    />
                  ) : (
                    <circle {...props} r={3} stroke="none" />
                  )
                }
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke={config.temperature.color}
                strokeWidth={2}
                dot={(props) =>
                  props.payload?.isPartial ? (
                    <circle
                      {...props}
                      r={4}
                      stroke={config.temperature.color}
                      fill="transparent"
                      strokeDasharray="2 2"
                    />
                  ) : (
                    <circle {...props} r={3} stroke="none" />
                  )
                }
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
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => {
              if (transformed.length === 0) return;
              const csv = convertToCSV(transformed, ["label", "temperature", "heatIndex"]);
              downloadCSV(csv, `analytics-${mappedTimeframe}.csv`);
            }}
          >
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function formatLabel(timestamp: string, timeframe: string) {
  const date = new Date(timestamp);
  if (timeframe === "Weekly")
    return date.toLocaleDateString("en-US", { weekday: "short" });
  if (timeframe === "Monthly")
    return date.toLocaleDateString("en-US", { month: "short" });
  if (timeframe === "Yearly") return date.getFullYear().toString();
  return timestamp;
}
