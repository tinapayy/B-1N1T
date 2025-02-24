"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { MapPin, Thermometer, Droplets } from "lucide-react";

interface WeatherGaugeProps {
  temperature: number; // Dynamic: Temperature value
  humidity: number; // Dynamic: Humidity value
  heatIndex: number; // Dynamic: Heat index value
  location: string; // Dynamic: Location name
  lastUpdated: string; // Dynamic: Last updated timestamp
}

export default function WeatherGauge({
  temperature,
  humidity,
  heatIndex,
  location,
  lastUpdated,
}: WeatherGaugeProps) {
  const data = [{ value: 50 }, { value: 50 }]; // Placeholder data for the pie chart

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Location Header */}
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 bg-[#2f2f2f] text-white px-4 py-2 rounded-full">
          <MapPin className="w-4 h-4" />
          <span className="text-sm sm:text-base">{location}</span>{" "}
          {/* Dynamic: Location name */}
        </div>
        <div className="text-gray-500 text-xs sm:text-sm text-center sm:text-right">
          <div>Feb. 5, 2025, Tuesday</div> {/* Static: Date placeholder */}
          <div>Last Updated: {lastUpdated}</div>{" "}
          {/* Dynamic: Last updated timestamp */}
        </div>
      </div>

      {/* Gauge */}
      <div className="relative w-full h-40 sm:h-48 lg:h-56 mb-6 sm:mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data} // Placeholder data for the pie chart
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill="#FFD700" />{" "}
              {/* Static: Color for the first segment */}
              <Cell fill="#D1D5DB" />{" "}
              {/* Static: Color for the second segment */}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-1">
            {heatIndex}°C
          </div>{" "}
          {/* Dynamic: Heat index value */}
          <div className="text-lg sm:text-xl lg:text-2xl text-gray-600">
            Heat Index
          </div>{" "}
          {/* Static: Label */}
        </div>
      </div>

      {/* Readings */}
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-base sm:text-lg lg:text-xl">
            {temperature}°C
          </span>{" "}
          {/* Dynamic: Temperature value */}
        </div>
        <div className="flex flex-col items-center">
          <div className="text-[#FFD700] text-lg sm:text-xl lg:text-2xl font-medium">
            Caution
          </div>{" "}
          {/* Static: Caution label */}
          <div className="text-gray-500 text-xs sm:text-sm">
            Classification
          </div>{" "}
          {/* Static: Classification label */}
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-base sm:text-lg lg:text-xl">
            {humidity}%
          </span>{" "}
          {/* Dynamic: Humidity value */}
        </div>
      </div>

      {/* Heat Index Scale */}
      <div className="w-full mb-6">
        <div
          className="h-2 sm:h-3 w-full rounded-full mb-2 relative"
          style={{
            background:
              "linear-gradient(to right, #90EE90, #FFD700, #FFA500, #FF4500, #8B0000)", // Static: Gradient background
          }}
        >
          <div
            className="absolute w-1 h-3 sm:h-4 bg-black top-1/2 transform -translate-y-1/2"
            style={{
              left: `${(heatIndex / 60) * 100}%`, // Dynamic: Position based on heat index
              transition: "left 0.3s ease-in-out",
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] sm:text-xs">
          <div className="text-center">
            <div className="text-gray-600">{"< 27°C"}</div>
            <div className="text-gray-400 whitespace-pre-line">
              Not{"\n"}Hazardous
            </div>{" "}
            {/* Static: Hazardous label */}
          </div>
          <div className="text-center">
            <div className="text-gray-600">27 - 32°C</div>
            <div className="text-gray-400">Caution</div>{" "}
            {/* Static: Caution label */}
          </div>
          <div className="text-center">
            <div className="text-gray-600">33 - 41°C</div>
            <div className="text-gray-400 whitespace-pre-line">
              Extreme{"\n"}Caution
            </div>{" "}
            {/* Static: Extreme caution label */}
          </div>
          <div className="text-center">
            <div className="text-gray-600">42 - 51°C</div>
            <div className="text-gray-400">Danger</div>{" "}
            {/* Static: Danger label */}
          </div>
          <div className="text-center">
            <div className="text-gray-600">{"> 52°C"}</div>
            <div className="text-gray-400 whitespace-pre-line">
              Extreme{"\n"}Danger
            </div>{" "}
            {/* Static: Extreme danger label */}
          </div>
        </div>
      </div>

      {/* Warning Message */}
      <div className="bg-[#2f2f2f] text-white rounded-lg p-3 sm:p-4 text-center text-xs sm:text-sm">
        Fatigue is possible with prolonged exposure and activity.{" "}
        {/* Static: Warning message */}
        <br />
        Continuing activity could lead to heat cramps{" "}
        {/* Static: Warning message */}
      </div>
    </div>
  );
}
