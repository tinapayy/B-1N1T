// src/components/analytics/WeeklyBarChart.tsx
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
  } from "@/components/ui/chart";
  import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
  import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
  } from "recharts";
  
  export default function WeeklyBarChart({ data, isMobile, isTablet }: any) {
    const config = {
      minTemp: { label: "Min Heat Index", color: "#000000" },
      maxTemp: { label: "Max Heat Index", color: "var(--orange-primary)" },
    };
  
    return (
      <Card className="col-span-1 bg-white rounded-3xl shadow-sm flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
          <CardTitle className="text-xl font-semibold">Weekly Max & Min</CardTitle>
        </CardHeader>
        <CardContent className="pb-4 flex-grow flex flex-col">
          <ChartContainer config={config} className="h-[300px] flex-grow aspect-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barSize={isMobile ? 15 : isTablet ? 18 : 25}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis domain={[0, 60]} ticks={[0, 15, 30, 45, 60]} axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="minTemp" stackId="a" fill="var(--color-minTemp)" />
                <Bar dataKey="maxTemp" stackId="a" fill="var(--color-maxTemp)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }
  