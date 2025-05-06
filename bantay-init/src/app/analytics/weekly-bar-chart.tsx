// app/analytics/weekly-bar-chart.tsx
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
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(res => res.json());

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
    sensorId ? `/api/analytics/weekly?sensorId=${sensorId}` : null,
    fetcher,
    {
      refreshInterval: 30000,
      dedupingInterval: 30000,
    }
  );

  const sorted = Array.isArray(data)
    ? [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  const metricFieldMap: Record<MetricKey, { min: string; max: string }> = {
    temperature: { min: "minTemp", max: "maxTemp" },
    humidity: { min: "minHumidity", max: "maxHumidity" },
    heatIndex: { min: "minHeatIndex", max: "maxHeatIndex" },
  };

  const { min: minKey, max: maxKey } = metricFieldMap[selectedMetric];

  const chartData = sorted.map((d) => {
    const min = d[minKey] ?? null;
    const max = d[maxKey] ?? null;
    const localTs = new Date(new Date(d.date).getTime() + 8 * 60 * 60 * 1000); 
    const dayLabel = DAY_LABELS[(localTs.getDay() + 6) % 7];

    return {
      day: dayLabel,
      min,
      delta: typeof min === "number" && typeof max === "number" ? max - min : null,
    };
  });

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
        <CardTitle className="text-xl font-semibold">Weekly Min / Max</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {METRIC_LABELS[selectedMetric]} <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(METRIC_LABELS) as MetricKey[]).map((metric) => (
              <DropdownMenuItem key={metric} onClick={() => setSelectedMetric(metric)}>
                {METRIC_LABELS[metric]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="pb-4 flex-grow flex flex-col">
        <ChartContainer config={config} className="h-[250px] flex-grow aspect-auto">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              barSize={isMobile ? 14 : isTablet ? 16 : 20}
              barGap={8}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="bg-white rounded-md border shadow-sm p-3 text-xs text-black space-y-1">
                      <div className="font-semibold mb-1">{label}</div>
                      {payload.map((entry, index) => {
                        const isDelta = entry.dataKey === "delta";
                        const minValue = entry.payload.min;
                        const value = isDelta
                          ? minValue + (entry.payload.delta ?? 0)
                          : entry.value;

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
                              {labelText}: {typeof value === "number" ? value.toFixed(2) : "—"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="min" stackId="a" fill="var(--color-min)" />
              <Bar dataKey="delta" stackId="a" fill="var(--color-delta)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
