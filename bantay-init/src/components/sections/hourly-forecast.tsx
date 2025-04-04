"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { CardHeader, CardContent } from "@/components/ui/card";
import {
  Cloud,
  CloudRain,
  CloudLightning,
  Sun,
  CloudSun,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftIndicator(scrollLeft > 0);
      setShowRightIndicator(scrollLeft + clientWidth < scrollWidth);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 150; // Adjust scroll step
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Mouse Drag Scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Adjust sensitivity
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

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    if (scrollRef.current) {
      scrollRef.current.addEventListener("scroll", checkScroll);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (scrollRef.current) {
        scrollRef.current.removeEventListener("scroll", checkScroll);
      }
    };
  }, []);

  return (
    <div className="overflow-hidden relative">
      <CardHeader className="pb-0">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Hourly Forecast</h2>
          <p className="text-sm text-gray-500">by AccuWeather</p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative">
          {/* Mobile View (Column Layout) */}
          <div className="sm:hidden grid grid-cols-1 gap-3">
            {mockHourlyForecasts.map((forecast) => {
              const Icon = getWeatherIcon(forecast.condition);
              return (
                <div
                  key={forecast.time}
                  className="bg-[#2f2f2f] rounded-[16px] flex items-center p-3 text-white"
                  style={{
                    boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                    background:
                      "linear-gradient(180deg, #2f2f2f 0%, #262626 100%)",
                  }}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{forecast.time}</span>
                    <span className="text-lg font-semibold mt-1">
                      {forecast.temperature}°C
                    </span>
                  </div>
                  <div className="ml-auto">
                    <Icon className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View (Original Row Layout) */}
          <div
            ref={scrollRef}
            className="hidden sm:flex overflow-x-auto pb-4 gap-4 scrollbar-hide scroll-smooth cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
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

          {/* Left Scroll Button (Desktop only) */}
          {showLeftIndicator && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-gray-800/50 rounded-full cursor-pointer hidden sm:block"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Right Scroll Button (Desktop only) */}
          {showRightIndicator && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-gray-800/50 rounded-full cursor-pointer hidden sm:block"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
      </CardContent>
    </div>
  );
}
