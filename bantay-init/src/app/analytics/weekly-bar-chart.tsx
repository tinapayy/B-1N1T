"use client";

import useSWR from "swr";
import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const METRIC_LABELS = {
  temperature: "Temperature",
  humidity: "Humidity",
  heatIndex: "Heat Index",
} as const;

type MetricKey = keyof typeof METRIC_LABELS;
const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function WeeklyBarChart({
  sensorId,
  isMobile,
  isTablet,
}: {
  sensorId: string;
  isMobile: boolean;
  isTablet: boolean;
}) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("heatIndex");

  const { data = [] } = useSWR(
    sensorId
      ? `/api/analytics/bar-summary?sensorId=${sensorId}&metric=${selectedMetric}`
      : null,
    fetcher,
    {
      refreshInterval: 30000,
      dedupingInterval: 30000,
    }
  );

  const today = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const todayIndex = (today.getUTCDay() + 6) % 7;

  const rotatedLabels = [
    ...DAY_LABELS.slice(
      todayIndex - 6 < 0 ? 7 + (todayIndex - 6) : todayIndex - 6
    ),
    ...DAY_LABELS.slice(0, todayIndex + 1),
  ];

  const rotatedData = Array.isArray(data)
    ? rotatedLabels.map((label) => {
        const entry = data.find((d) => d.day === label);
        return {
          day: label,
          min: entry?.min ?? 0,
          delta: entry?.delta ?? 0,
          isToday: entry?.isToday ?? false,
        };
      })
    : [];

  const config = {
    min: {
      label: `Min ${METRIC_LABELS[selectedMetric]}`,
      color: "var(--dark-gray-1)",
    },
    delta: {
      label: `Max ${METRIC_LABELS[selectedMetric]}`,
      color: "var(--orange-primary)",
    },
  };

  return (
    <Card className="bg-white rounded-3xl shadow-sm flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 py-4">
        <CardTitle className="text-xl font-semibold">
          Weekly Min / Max
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {METRIC_LABELS[selectedMetric]}{" "}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(METRIC_LABELS) as MetricKey[]).map((metric) => (
              <DropdownMenuItem
                key={metric}
                onClick={() => setSelectedMetric(metric)}
              >
                {METRIC_LABELS[metric]}
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
              data={rotatedData}
              barSize={isMobile ? 14 : isTablet ? 16 : 20}
              barGap={8}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />

              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const isToday = payload[0]?.payload?.isToday;

                  return (
                    <div className="bg-white rounded-md border shadow-sm p-3 text-xs text-black space-y-1">
                      <div className="font-semibold mb-1">
                        {label} {isToday ? "(As of now)" : ""}
                      </div>
                      {[...payload].reverse().map((entry, index) => {
                        const isDelta = entry.dataKey === "delta";
                        const minValue = entry.payload.min;
                        const value = isDelta
                          ? minValue + (entry.payload.delta ?? 0)
                          : minValue;

                        const labelText = isDelta
                          ? `Max ${METRIC_LABELS[selectedMetric]}`
                          : `Min ${METRIC_LABELS[selectedMetric]}`;

                        return (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <div>
                              {labelText}:{" "}
                              {typeof value === "number"
                                ? value.toFixed(2)
                                : "—"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              />

              <ChartLegend
                content={<ChartLegendContent className="justify-start ml-10" />}
              />

              <Bar dataKey="min" stackId="a" fill="var(--color-min)" />

              <Bar
                dataKey="delta"
                stackId="a"
                fill="var(--color-delta)"
                radius={[4, 4, 0, 0]} // Top corners only
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
