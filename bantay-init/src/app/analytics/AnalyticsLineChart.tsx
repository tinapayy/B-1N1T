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

export default function AnalyticsLineChart({
  data,
  timeframe,
  setTimeframe,
}: any) {
  const config = {
    heatIndex: { label: "Heat Index", color: "var(--orange-primary, #f97316)" },
    temperature: { label: "Temperature", color: "#000000" },
  };

  return (
    <Card className="col-span-1 lg:col-span-2 bg-white rounded-3xl shadow-sm flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
        <CardTitle className="text-xl font-semibold">Data Analytics</CardTitle>
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
                {timeframe} <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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
              data={data}
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
        <div className="flex justify-end mt-2 pr-6">
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
