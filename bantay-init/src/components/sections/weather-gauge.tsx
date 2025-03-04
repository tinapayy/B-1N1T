"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { MapPin, Thermometer, Droplets } from "lucide-react";
import useFirebaseData from "../lib/useFirebaseData";
import { format } from "date-fns";
import { useEffect, useState } from "react";

interface WeatherGaugeProps {
  location: string;
}

interface Reading {
  id: string; // Firebase auto-generated key
  heatIndex: number;
  temperature: number;
  humidity: number;
  timestamp: number | { ".sv": string }; // Handle server timestamp placeholder
}

export default function WeatherGauge({ location }: WeatherGaugeProps) {
  const { data, loading, error } = useFirebaseData("/readings");
  const [latestReading, setLatestReading] = useState<Reading | null>(null);

  useEffect(() => {
    if (data) {
      let latestReading: Reading | null = null;
  
      // Iterate through the Firebase data object
      for (const key in data) {
        const reading = data[key] as Reading;
        if (!latestReading || reading.timestamp > latestReading.timestamp) {
          latestReading = reading;
        }
      }
  
      setLatestReading(latestReading);
    }
  }, [data]);

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error.message}</div>;
  }

  if (!data || Object.keys(data).length === 0) {
    return <div className="p-4 text-center">No data available</div>;
  }

  if (!latestReading) {
    return <div className="p-4 text-center">No latest reading available</div>;
  }

  const { temperature, humidity, heatIndex, timestamp } = latestReading;
  const heatIndexNumber = heatIndex ? parseFloat(heatIndex.toFixed(4)) : 0;

  // Handle server timestamp placeholder
  const isServerTimestamp = typeof timestamp === "object" && ".sv" in timestamp;
  const actualTimestamp = isServerTimestamp ? Date.now() : timestamp;

  // Format the date and time
  const formattedDate = format(new Date(actualTimestamp), "MMM. d, yyyy, EEEE");
  const formattedTime = format(new Date(actualTimestamp), "h:mm:ss a");

  const getHeatIndexStatus = (value: number) => {
    if (value < 27)
      return { level: "Not Hazardous", color: "#90EE90", message: "Conditions are safe for outdoor activities." };
    if (value < 32)
      return {
        level: "Caution",
        color: "#FFD700",
        message: "Fatigue is possible with prolonged exposure and activity.",
      };
    if (value < 41)
      return { level: "Extreme Caution", color: "#FFA500", message: "Heat cramps and heat exhaustion are possible." };
    if (value < 51) return { level: "Danger", color: "#FF4500", message: "Heat cramps and heat exhaustion are likely." };
    return { level: "Extreme Danger", color: "#8B0000", message: "Heat stroke is highly likely." };
  };

  const status = getHeatIndexStatus(heatIndexNumber);
  const gaugeData = [
    { name: "value", value: heatIndexNumber },
    { name: "remainder", value: 60 - heatIndexNumber },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-lg">
      {/* Location Header */}
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 bg-[#2f2f2f] text-white px-4 py-2 rounded-full">
          <MapPin className="w-4 h-4" />
          <span className="text-sm sm:text-base">{location}</span>
        </div>
        <div className="text-gray-500 text-xs sm:text-sm text-center sm:text-right">
          <div>{formattedDate}</div>
          <div>Last Updated: {formattedTime}</div>
        </div>
      </div>

      {/* Gauge (Pie Chart) */}
      <div className="relative w-full h-40 sm:h-48 lg:h-56 mb-6 sm:mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill={status.color} />
              <Cell fill="#D1D5DB" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-1">
            {heatIndexNumber.toFixed(2)}°C
          </div>
          <div className="text-lg sm:text-xl lg:text-2xl text-gray-600">Heat Index</div>
        </div>
      </div>

      {/* Readings (Temperature, Status, Humidity) */}
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-base sm:text-lg lg:text-xl">{temperature.toFixed(1)}°C</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-lg sm:text-xl lg:text-2xl font-medium" style={{ color: status.color }}>
            {status.level}
          </div>
          <div className="text-gray-500 text-xs sm:text-sm">Classification</div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-base sm:text-lg lg:text-xl">{humidity.toFixed(1)}%</span>
        </div>
      </div>

      {/* Heat Index Scale (Color Gradient) */}
      <div className="w-full mb-6">
        <div
          className="h-2 sm:h-3 w-full rounded-full mb-2 relative"
          style={{
            background: "linear-gradient(to right, #90EE90, #FFD700, #FFA500, #FF4500, #8B0000)",
          }}
        >
          <div
            className="absolute w-1 h-3 sm:h-4 bg-black top-1/2 transform -translate-y-1/2"
            style={{
              left: `${(heatIndexNumber / 60) * 100}%`,
              transition: "left 0.3s ease-in-out",
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] sm:text-xs">
          <div className="text-center">
            <div className="text-gray-600">{"< 27°C"}</div>
            <div className="text-gray-400 whitespace-pre-line">Not{"\n"}Hazardous</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">27 - 32°C</div>
            <div className="text-gray-400">Caution</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">33 - 41°C</div>
            <div className="text-gray-400 whitespace-pre-line">Extreme{"\n"}Caution</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">42 - 51°C</div>
            <div className="text-gray-400">Danger</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">{"> 52°C"}</div>
            <div className="text-gray-400 whitespace-pre-line">Extreme{"\n"}Danger</div>
          </div>
        </div>
      </div>

      {/* Warning Message (Based on Heat Index Status) */}
      <div className="bg-[#2f2f2f] text-white rounded-lg p-3 sm:p-4 text-center text-xs sm:text-sm">
        {status.message}
      </div>
    </div>
  );
}