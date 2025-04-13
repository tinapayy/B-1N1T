"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { MapPin, Thermometer, Droplets } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";

interface WeatherGaugeProps {
  location: string;
}

interface Reading {
  id: string;
  heatIndex: number;
  temperature: number;
  humidity: number;
  timestamp: number | { ".sv": string };
}

export default function WeatherGauge({ location }: WeatherGaugeProps) {
  const [latestReading, setLatestReading] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  useEffect(() => {
    fetch("/api/readings/latest?sensorId=sensor-001")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch latest reading");
        return res.json();
      })
      .then((data) => {
        setLatestReading({
          id: data.sensorId,
          heatIndex: data.heatIndex,
          temperature: data.temperature,
          humidity: data.humidity,
          timestamp: data.timestamp,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading sensor data:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  if (loading || !latestReading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  const { temperature, humidity, heatIndex, timestamp } = latestReading;
  const heatIndexNumber = heatIndex ? parseFloat(heatIndex.toFixed(4)) : 0;

  const isServerTimestamp =
    typeof timestamp === "object" && ".sv" in timestamp;
  let actualTimestamp = Date.now();

  if (!isServerTimestamp && timestamp) {
    const parsed = new Date(timestamp);
    if (!isNaN(parsed.getTime())) {
      actualTimestamp = parsed.getTime();
    }
  }

  const formattedDate = format(
    new Date(actualTimestamp),
    "MMM. d, yyyy, EEEE"
  );
  const formattedTime = format(new Date(actualTimestamp), "h:mm:ss a");

  const getHeatIndexStatus = (value: number) => {
    if (value < 27)
      return {
        level: "Not Hazardous",
        color: "#90EE90",
        message: "Conditions are safe for outdoor activities.",
      };
    if (value < 32)
      return {
        level: "Caution",
        color: "#FFD700",
        message:
          "Fatigue is possible with prolonged exposure and activity. Continuing activity could lead to heat cramps.",
      };
    if (value < 41)
      return {
        level: "Extreme Caution",
        color: "#FFA500",
        message: "Heat cramps and heat exhaustion are possible.",
      };
    if (value < 51)
      return {
        level: "Danger",
        color: "#FF4500",
        message: "Heat cramps and heat exhaustion are likely.",
      };
    return {
      level: "Extreme Danger",
      color: "#8B0000",
      message: "Heat stroke is highly likely.",
    };
  };

  const status = getHeatIndexStatus(heatIndexNumber);
  const dataPie = [
    { value: heatIndexNumber },
    { value: 60 - heatIndexNumber },
  ];

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
            <div>{formattedDate}</div>
            <div>Last Updated: {formattedTime}</div>
          </div>
        </div>

        {/* Gauge */}
        <div className="relative w-full h-32 sm:h-36 lg:h-28 mb-3 sm:mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataPie}
                cx="50%"
                cy="90%"
                startAngle={180}
                endAngle={0}
                innerRadius="130%"
                outerRadius="180%"
                paddingAngle={0}
                dataKey="value"
              >
                <Cell fill={status.color} />
                <Cell fill="#D1D5DB" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-2 text-center">
            <div className="text-2xl sm:text-3xl lg:text-3xl font-bold">
              {heatIndexNumber.toFixed(2)}°C
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Heat Index</div>
          </div>
        </div>

        {/* Readings */}
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Thermometer className="w-4 h-4" />
            <span>{temperature.toFixed(1)}°C</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="text-xs sm:text-sm font-medium"
              style={{ color: status.color }}
            >
              {status.level}
            </div>
            <div className="text-gray-500 text-[10px] sm:text-xs">
              Classification
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Droplets className="w-4 h-4" />
            <span>{humidity.toFixed(1)}%</span>
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
                left: `${(heatIndexNumber / 60) * 100}%`,
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
          <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
            <TooltipTrigger
              asChild
              onClick={() => setIsTooltipOpen(!isTooltipOpen)}
            >
              <span className="cursor-pointer line-clamp-2 max-h-[3rem] overflow-hidden text-ellipsis sm:text-xs md:text-xs lg:text-[10px] xl:text-[12px]">
                {status.message}
              </span>
            </TooltipTrigger>

            <TooltipContent
              side="top"
              align="center"
              className="max-w-[300px] sm:max-w-[350px]"
            >
              <p>{status.message}</p>
              {status.level === "Caution" && (
                <>
                  <p className="mt-1 text-[var(--orange-primary)] font-medium">
                    First Aid Tips:
                  </p>
                  <ul className="list-disc list-inside text-xs">
                    <li>Stay hydrated</li>
                    <li>Rest in a cool place</li>
                    <li>Apply cold compress</li>
                  </ul>
                </>
              )}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
