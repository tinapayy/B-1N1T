"use client";

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
} from "recharts";
import { Button } from "@/components/ui/button";
import { ChevronDown, Download } from "lucide-react";

export default function AnalyticsLineChart({ data, timeframe, setTimeframe }: any) {
  const config = {
    heatIndex: { label: "Heat Index", color: "var(--orange-primary, #f97316)" },
    temperature: { label: "Temperature", color: "var(--dark-gray-1, #353535)" },
  };

  const getYDomain = (data: any[]) => {
    const all = data.flatMap((d) => [d.heatIndex, d.temperature]);
    const min = Math.min(...all);
    const max = Math.max(...all);
    const padding = 2;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  };

  const yDomain = getYDomain(data);

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
              data={[...data].reverse()}
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
