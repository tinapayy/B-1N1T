"use client";

import { CardHeader, CardContent } from "@/components/ui/card";
import { Cloud, CloudRain, CloudLightning, Sun, CloudSun } from "lucide-react";

// Types that match AccuWeather API structure for future integration
interface DailyForecastData {
  day: string;
  condition: "sunny" | "partly-cloudy" | "cloudy" | "rain" | "storm";
  highTemp: number;
  lowTemp: number;
}

// Mock data - will be replaced with API data later
const mockForecasts: DailyForecastData[] = [
  { day: "Today", condition: "partly-cloudy", highTemp: 24, lowTemp: 13 },
  { day: "Mon", condition: "rain", highTemp: 22, lowTemp: 17 },
  { day: "Tue", condition: "sunny", highTemp: 21, lowTemp: 15 },
  { day: "Wed", condition: "cloudy", highTemp: 20, lowTemp: 16 },
  { day: "Thu", condition: "storm", highTemp: 22, lowTemp: 15 },
];

const getWeatherIcon = (condition: DailyForecastData["condition"]) => {
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

export function DailyForecast() {
  return (
    <div className="h-[320px] overflow-hidden">
      <CardHeader className="pb-2">
        <h2 className="text-xl font-semibold">Daily Forecast</h2>
        <p className="text-xs text-gray-500">by AccuWeather</p>
      </CardHeader>
      <CardContent className="pt-4 h-full overflow-y-auto">
        <div className="space-y-4">
          {mockForecasts.map((forecast) => {
            const Icon = getWeatherIcon(forecast.condition);
            return (
              <div
                key={forecast.day}
                className="flex items-center justify-between"
              >
                <div className="w-[80px] text-base font-medium">
                  {forecast.day}
                </div>
                <Icon className="h-6 w-6 text-gray-600" strokeWidth={1.5} />
                <div className="flex items-center gap-3 w-[80px] justify-end text-base">
                  <span className="font-semibold">{forecast.highTemp}°</span>
                  <span className="text-gray-500">{forecast.lowTemp}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </div>
  );
}
