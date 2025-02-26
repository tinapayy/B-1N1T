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
    <div className="overflow-hidden">
      <CardHeader className="pb-0">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Daily Forecast
          </h2>
          <p className="text-sm text-muted-foreground">by AccuWeather</p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {mockForecasts.map((forecast) => {
            const Icon = getWeatherIcon(forecast.condition);
            return (
              <div
                key={forecast.day}
                className="flex items-center justify-between"
              >
                <div className="w-[100px] text-lg font-medium">
                  {forecast.day}
                </div>
                <div className="flex items-center justify-center w-[100px]">
                  <Icon className="h-8 w-8 text-gray-600" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-2 w-[100px] justify-end text-lg">
                  <span className="font-semibold">{forecast.highTemp}°</span>
                  <span className="text-muted-foreground">
                    {forecast.lowTemp}°
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </div>
  );
}
