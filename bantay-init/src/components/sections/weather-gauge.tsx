"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { MapPin, Thermometer, Droplets, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WeatherGaugeProps {
  temperature: number;
  humidity: number;
  heatIndex: number;
  location: string;
  lastUpdated: string;
}

export default function WeatherGauge({
  temperature,
  humidity,
  heatIndex,
  location,
  lastUpdated,
}: WeatherGaugeProps) {
  const data = [{ value: 50 }, { value: 50 }];

  return (
    <TooltipProvider>
      <div className="p-4 sm:p-5 overflow-hidden lg:h-[400px]">
        {/* Location Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-4">
          <div className="flex items-center gap-2 bg-[#2f2f2f] text-white px-3 py-1.5 rounded-full text-[10px] sm:text-sm sm:max-w-[40%] md:max-w-[40%] lg:max-w-[30%] truncate">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="text-gray-500 text-[10px] sm:text-xs text-center sm:text-right leading-tight whitespace-nowrap">
            <div>Feb. 5, 2025, Tuesday</div>
            <div>Last Updated: {lastUpdated}</div>
          </div>
        </div>

        {/* Gauge */}
        <div className="relative w-full h-32 sm:h-36 lg:h-28 mb-3 sm:mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="90%"
                startAngle={180}
                endAngle={0}
                innerRadius="130%"
                outerRadius="180%" // Increase outer radius for a larger gauge
                paddingAngle={0}
                dataKey="value"
              >
                <Cell fill="#FFD700" />
                <Cell fill="#D1D5DB" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-2 text-center">
            <div className="text-2xl sm:text-3xl lg:text-3xl font-bold">
              {heatIndex}°C
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Heat Index</div>
          </div>
        </div>

        {/* Readings */}
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Thermometer className="w-4 h-4" />
            <span>{temperature}°C</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-[#FFD700] text-xs sm:text-sm font-medium">
              Caution
            </div>
            <div className="text-gray-500 text-[10px] sm:text-xs">
              Classification
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Droplets className="w-4 h-4" />
            <span>{humidity}%</span>
          </div>
        </div>

        {/* Heat Index Scale */}
        <div className="w-full mb-3 sm:mb-4">
          <div
            className="h-2 sm:h-2.5 w-full rounded-full mb-1 relative"
            style={{
              background:
                "linear-gradient(to right, #90EE90, #FFD700, #FFA500, #FF4500, #8B0000)",
            }}
          >
            <div
              className="absolute w-1 h-3 sm:h-3.5 bg-black top-1/2 transform -translate-y-1/2"
              style={{
                left: `${(heatIndex / 60) * 100}%`,
                transition: "left 0.3s ease-in-out",
              }}
            />
          </div>
          <div className="grid grid-cols-5 text-[8px] sm:text-[10px] md:text-xs lg:text-[8px] xl:text-xs text-center w-full">
            {[
              {
                range: "< 27°C",
                label: "Not Hazardous",
                color: "text-gray-400",
              },
              { range: "27 - 32°C", label: "Caution", color: "text-gray-400" },
              {
                range: "33 - 41°C",
                label: "Extreme Caution",
                color: "text-gray-400",
              },
              { range: "42 - 51°C", label: "Danger", color: "text-gray-400" },
              {
                range: "> 52°C",
                label: "Extreme Danger",
                color: "text-gray-400",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center px-1 min-w-[50px]"
              >
                <div className="text-gray-600 font-medium">{item.range}</div>
                <div
                  className={`${item.color} leading-tight whitespace-nowrap`}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Message with Tooltip */}
        <div className="bg-[#2f2f2f] text-white rounded-lg p-2 md:p-4 sm:p-2 text-justify text-xs sm:text-xs relative flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="line-clamp-2 max-h-[3rem] overflow-hidden text-ellipsis sm:text-xs md:text-xs lg:text-[10px] xl:text-[12px]">
                Fatigue is possible with prolonged exposure and activity.
                Continuing activity could lead to heat cramps. Lorem ipsum dolor
                sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                veniam
              </span>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
              className="max-w-[300px] sm:max-w-[350px]"
            >
              <p>
                Fatigue is possible with prolonged exposure and activity.
                Continuing activity could lead to heat cramps.
              </p>
              <p className="mt-1 text-[var(--orange-primary)] font-medium">
                First Aid Tips:
              </p>
              <ul className="list-disc list-inside text-xs">
                <li>Stay hydrated</li>
                <li>Rest in a cool place</li>
                <li>Apply cold compress</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
