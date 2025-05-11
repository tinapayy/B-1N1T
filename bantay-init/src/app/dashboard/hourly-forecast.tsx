"use client";

import { useState, useRef, useEffect } from "react";
import { CardHeader, CardContent } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { HourlyForecastData, fetchHourlyForecast } from "@/lib/open-meteo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getWeatherIconInfo } from "@/components/ui/weather-icons";

interface HourlyForecastProps {
  latitude: number;
  longitude: number;
}

const formatCondition = (
  condition: HourlyForecastData["condition"],
  isNight: boolean
) => {
  const displayCondition =
    isNight && condition === "sunny" ? "clear" : condition;
  return displayCondition
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function HourlyForecast({ latitude, longitude }: HourlyForecastProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [forecasts, setForecasts] = useState<HourlyForecastData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHourlyForecast = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchHourlyForecast(latitude, longitude);
        const now = new Date();
        const startTime = new Date(now);
        startTime.setHours(now.getHours() - 3, 0, 0, 0);
        const endTime = new Date(now);
        endTime.setHours(now.getHours() + 20, 0, 0, 0);

        const filteredData = data.filter((forecast) => {
          const forecastTime = new Date(forecast.timestamp);
          return forecastTime >= startTime && forecastTime <= endTime;
        });

        setForecasts(filteredData);
      } catch (err) {
        setError("Failed to fetch hourly forecast");
      }
      setIsLoading(false);
    };
    loadHourlyForecast();
  }, [latitude, longitude]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftIndicator(scrollLeft > 0);
      setShowRightIndicator(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 150;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (scrollRef.current) {
        const { scrollWidth, clientWidth } = scrollRef.current;
        setShowRightIndicator(scrollWidth > clientWidth);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    if (scrollRef.current) {
      scrollRef.current.addEventListener("scroll", checkScroll);
      const currentHourIndex = forecasts.findIndex((forecast) => {
        const forecastHour = new Date(forecast.timestamp).getHours();
        return forecastHour === new Date().getHours();
      });
      if (currentHourIndex >= 1) {
        const cardWidth = 125;
        scrollRef.current.scrollTo({
          left: (currentHourIndex - 1) * cardWidth + 20,
          behavior: "smooth",
        });
      }
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (scrollRef.current) {
        scrollRef.current.removeEventListener("scroll", checkScroll);
      }
    };
  }, [forecasts]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <TooltipProvider>
      <div className="h-[320px] overflow-hidden relative">
        <CardHeader className="pb-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Hourly Forecast</h2>
            <p className="text-sm text-gray-500">by Open-Meteo</p>
          </div>
        </CardHeader>

        <CardContent className="pt-4 h-[calc(100%-70px)]">
          <div className="relative h-full">
            {/* Mobile View */}
            <div className="sm:hidden h-full overflow-y-scroll scrollbar-hide grid grid-cols-1 gap-3">
              {forecasts.map((forecast, index) => {
                const {
                  weatherIconPath,
                  isNight,
                  nightIconPath,
                  showOnlyNightIcon,
                } = getWeatherIconInfo(forecast.condition, forecast.time);
                return (
                  <Tooltip key={forecast.time}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-[#2f2f2f] rounded-[16px] flex items-center p-3 text-white cursor-pointer"
                        style={{
                          boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                          background:
                            "linear-gradient(180deg, #2f2f2f 0%, #262626 100%)",
                        }}
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">
                            {forecast.time}
                          </span>
                          <span className="text-lg font-semibold mt-1">
                            {forecast.temperature}°C
                          </span>
                        </div>
                        <div className="ml-auto flex items-center gap-1">
                          {showOnlyNightIcon ? (
                            <img
                              src={nightIconPath}
                              alt="night"
                              className="w-8 h-8"
                            />
                          ) : (
                            <>
                              <img
                                src={weatherIconPath}
                                alt={forecast.condition}
                                className="w-8 h-8"
                              />
                              {isNight && (
                                <img
                                  src={nightIconPath}
                                  alt="night"
                                  className="w-8 h-8"
                                />
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white text-gray-800 rounded-lg shadow-lg p-2 text-sm">
                      <div className="flex gap-2">
                        <span>
                          {formatCondition(forecast.condition, isNight)}
                        </span>
                        <span>•</span>
                        <span>Temperature: {forecast.temperature}°C</span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            {/* Desktop View */}
            <div
              ref={scrollRef}
              className="hidden sm:flex overflow-x-auto pb-4 gap-4 scrollbar-hide scroll-smooth cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {forecasts.map((forecast, index) => {
                const {
                  weatherIconPath,
                  isNight,
                  nightIconPath,
                  showOnlyNightIcon,
                } = getWeatherIconInfo(forecast.condition, forecast.time);
                return (
                  <Tooltip key={forecast.time}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex-none w-[120px] h-[185px] bg-[#2f2f2f] rounded-[24px] flex flex-col items-center justify-between p-6 text-white cursor-pointer mr-0.5"
                        style={{
                          boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                          background:
                            "linear-gradient(180deg, #2f2f2f 0%, #262626 100%)",
                        }}
                      >
                        <span className="text-base font-medium">
                          {forecast.time}
                        </span>
                        <div className="flex-1 flex items-center justify-center gap-2">
                          {showOnlyNightIcon ? (
                            <img
                              src={nightIconPath}
                              alt="night"
                              className="w-12 h-12"
                            />
                          ) : (
                            <>
                              <img
                                src={weatherIconPath}
                                alt={forecast.condition}
                                className="w-12 h-12"
                              />
                              {isNight && (
                                <img
                                  src={nightIconPath}
                                  alt="night"
                                  className="w-12 h-12"
                                />
                              )}
                            </>
                          )}
                        </div>
                        <span className="text-2xl font-semibold">
                          {forecast.temperature}°C
                        </span>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white text-gray-800 rounded-lg shadow-lg p-2 text-sm">
                      <div className="flex gap-2">
                        <span>
                          {formatCondition(forecast.condition, isNight)}
                        </span>
                        <span>•</span>
                        <span>Temperature: {forecast.temperature}°C</span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            {/* Chevron Scroll Buttons */}
            {showLeftIndicator && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-gray-800/50 rounded-full cursor-pointer hidden sm:block"
                aria-label="Scroll hourly forecast left"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}
            {showRightIndicator && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-gray-800/50 rounded-full cursor-pointer hidden sm:block"
                aria-label="Scroll hourly forecast right"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}
          </div>
        </CardContent>
      </div>
    </TooltipProvider>
  );
}
