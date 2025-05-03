"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip
} from "recharts";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart";
import { ChevronDown } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function WeeklyBarChart({ isMobile, isTablet }: any) {
  const { data, isLoading } = useSWR("/api/analytics/weekly", fetcher, {
    refreshInterval: 30000,
    dedupingInterval: 30000,
  });

  const [selectedMetric, setSelectedMetric] = useState<"temperature" | "humidity" | "heatIndex">("heatIndex");

  const chartData = (data || []).map((d: any) => ({
    day: d.day,
    minTemp: d[selectedMetric].minTemp,
    delta: d[selectedMetric].maxTemp - d[selectedMetric].minTemp,
  }));

  const config = {
    minTemp: { label: `Min ${selectedMetric}`, color: "var(--dark-gray-1)" },
    delta: { label: `Max ${selectedMetric}`, color: "var(--orange-primary)" },
  };

  return (
    <Card className="bg-white rounded-3xl shadow-sm flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 py-4">
        <CardTitle className="text-xl font-semibold">Weekly Max & Min</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {["temperature", "humidity", "heatIndex"].map((metric) => (
              <DropdownMenuItem key={metric} onClick={() => setSelectedMetric(metric as any)}>
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
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
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis domain={[0, 80]} ticks={[0, 20, 40, 60, 80]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="minTemp" stackId="a" fill="var(--dark-gray-1)" />
              <Bar dataKey="delta" stackId="a" fill="var(--orange-primary)" radius={[4, 4, 0, 0]} />
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
