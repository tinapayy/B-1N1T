"use client";

import { useState, useEffect } from "react";
import { CardHeader, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { DailyForecastData, fetchDailyForecast } from "@/lib/open-meteo";
import { getWeatherIconInfo } from "@/components/ui/weather-icons";

interface DailyForecastProps {
  latitude: number;
  longitude: number;
}

const formatCondition = (condition: DailyForecastData["condition"]) => {
  return condition
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function DailyForecast({ latitude, longitude }: DailyForecastProps) {
  const [forecasts, setForecasts] = useState<DailyForecastData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDailyForecast = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchDailyForecast(latitude, longitude);
        setForecasts(data);
      } catch (err) {
        setError("Failed to fetch daily forecast");
      }
      setIsLoading(false);
    };
    loadDailyForecast();
  }, [latitude, longitude]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <TooltipProvider>
      <div className="h-[320px] overflow-hidden">
        <CardHeader className="pb-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">5-Day Forecast</h2>
            <p className="text-sm text-gray-500">by Open-Meteo</p>
          </div>
        </CardHeader>
        <CardContent className="pt-4 h-full overflow-y-auto">
          <div className="space-y-4">
            {forecasts.map((forecast, index) => {
              const { weatherIconPath } = getWeatherIconInfo(
                forecast.condition
              );
              return (
                <Tooltip key={forecast.day}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <span className="w-20 text-base font-medium">
                        {forecast.day}
                      </span>
                      <img
                        src={weatherIconPath}
                        alt={forecast.condition}
                        className="h-6 w-6"
                      />
                      <div className="w-20 flex justify-end gap-2">
                        <span className="font-semibold">
                          {forecast.highTemp}°
                        </span>
                        <span className="text-gray-500">
                          {forecast.lowTemp}°
                        </span>
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white text-gray-800 rounded-lg shadow-lg p-2 text-sm">
                    <div className="flex gap-2">
                      <span>{formatCondition(forecast.condition)}</span>
                      <span>•</span>
                      <span>
                        High: {forecast.highTemp}°C, Low: {forecast.lowTemp}°C
                      </span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </CardContent>
      </div>
    </TooltipProvider>
  );
}
