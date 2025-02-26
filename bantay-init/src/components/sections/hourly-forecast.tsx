"use client";

import { CardHeader, CardContent } from "@/components/ui/card";
import { Cloud, CloudRain, CloudLightning, Sun, CloudSun } from "lucide-react";

interface HourlyForecastData {
  time: string;
  condition: "sunny" | "partly-cloudy" | "cloudy" | "rain" | "storm";
  temperature: number;
}

const mockHourlyForecasts: HourlyForecastData[] = [
  { time: "11 AM", condition: "partly-cloudy", temperature: 28 },
  { time: "12 NN", condition: "partly-cloudy", temperature: 31 },
  { time: "1 PM", condition: "rain", temperature: 27 },
  { time: "2 PM", condition: "storm", temperature: 29 },
  { time: "3 PM", condition: "partly-cloudy", temperature: 32 },
  { time: "4 PM", condition: "sunny", temperature: 30 },
  { time: "5 PM", condition: "cloudy", temperature: 28 },
  { time: "6 PM", condition: "rain", temperature: 26 },
];

const getWeatherIcon = (condition: HourlyForecastData["condition"]) => {
  switch (condition) {
    case "sunny":
      return Sun;
    case "partly-cloudy":
      return CloudSun;
    case "cloudy":
      return Cloud;
    case "rain":
      return CloudRain;
    case "storm":
      return CloudLightning;
    default:
      return Sun;
  }
};

export function HourlyForecast() {
  return (
    <div className="overflow-hidden">
      <CardHeader className="pb-0">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Hourly Forecast</h2>
          <p className="text-sm text-gray-500">by AccuWeather</p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative">
          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
            {mockHourlyForecasts.map((forecast) => {
              const Icon = getWeatherIcon(forecast.condition);
              return (
                <div
                  key={forecast.time}
                  className="flex-none w-[120px] h-[180px] bg-[#2f2f2f] rounded-[24px] flex flex-col items-center justify-between p-6 text-white"
                  style={{
                    boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                    background:
                      "linear-gradient(180deg, #2f2f2f 0%, #262626 100%)",
                  }}
                >
                  <span className="text-base font-medium">{forecast.time}</span>
                  <div className="flex-1 flex items-center justify-center">
                    <Icon className="w-12 h-12" strokeWidth={1.5} />
                  </div>
                  <span className="text-2xl font-semibold">
                    {forecast.temperature}°C
                  </span>
                </div>
              );
            })}
          </div>

          {/* Fade effect for scroll indication */}
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </CardContent>
    </div>
  );
}
