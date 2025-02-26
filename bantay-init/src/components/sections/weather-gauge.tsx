"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { MapPin, Thermometer, Droplets } from "lucide-react";

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
    <div className="p-4 sm:p-5 overflow-hidden lg:h-[400px]">
      {/* Location Header */}
      <div className="flex flex-col sm:flex-row justify-between mb-3 sm:mb-4 gap-4">
        <div className="flex items-center gap-2 bg-[#2f2f2f] text-white px-4 py-2 rounded-full text-xs sm:text-sm">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
        <div className="text-gray-500 text-xs sm:text-sm text-center sm:text-right">
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
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius="55%"
              outerRadius="75%"
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill="#FFD700" />
              <Cell fill="#D1D5DB" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
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
        <div className="flex justify-between text-[9px] sm:text-xs">
          <div className="text-center">
            <div className="text-gray-600">{"< 27°C"}</div>
            <div className="text-gray-400">Not Hazardous</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">27 - 32°C</div>
            <div className="text-gray-400">Caution</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">33 - 41°C</div>
            <div className="text-gray-400">Extreme Caution</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">42 - 51°C</div>
            <div className="text-gray-400">Danger</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">{"> 52°C"}</div>
            <div className="text-gray-400">Extreme Danger</div>
          </div>
        </div>
      </div>

      {/* Warning Message */}
      <div className="bg-[#2f2f2f] text-white rounded-lg p-2 sm:p-2.5 text-center text-xs sm:text-sm">
        Fatigue is possible with prolonged exposure and activity.
        <br />
        Continuing activity could lead to heat cramps.
      </div>
    </div>
  );
}
