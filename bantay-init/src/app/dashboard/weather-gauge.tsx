import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Thermometer, Droplets } from "lucide-react";
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
  const { data, error, isLoading } = useSWR("/api/dashboard/live", fetcher, {
    refreshInterval: 30000, // Refresh every 30s
  });
  const [latestReading, setLatestReading] = useState<Reading | null>(null);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  useEffect(() => {
    if (data) {
      let latest: Reading | null = null;
      for (const key in data) {
        const reading = data[key] as Reading;
        if (!latest || reading.timestamp > latest.timestamp) {
          latest = reading;
        }
      }
      setLatestReading(latest);
    }
  }, [data]);

  if (isLoading || !latestReading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">Error: {error.message}</div>
    );
  }

  const { temperature, humidity, heatIndex, timestamp } = latestReading;
  const heatIndexNumber = heatIndex ? parseFloat(heatIndex.toFixed(4)) : 0;

  const isServerTimestamp = typeof timestamp === "object" && ".sv" in timestamp;
  const actualTimestamp = isServerTimestamp ? Date.now() : timestamp;

  let formattedDate = "-";
  let formattedTime = "-";
  
  if (actualTimestamp && !isNaN(new Date(actualTimestamp).getTime())) {
    formattedDate = format(new Date(actualTimestamp), "MMM. d, yyyy, EEEE");
    formattedTime = format(new Date(actualTimestamp), "h:mm:ss a");
  }

  const getHeatIndexStatus = (value: number) => {
    if (value < 27)
      return {
        level: "Not Hazardous",
        color: "#69CF03",
        message: "Conditions are safe for outdoor activities.",
        precautions: [
          "Stay hydrated to maintain comfort.",
          "Wear light, breathable clothing.",
        ],
      };
    if (value < 32)
      return {
        level: "Caution",
        color: "#FFD700",
        message:
          "Fatigue is possible with prolonged exposure and activity. Continuing activity could lead to heat cramps.",
        precautions: [
          "Stay hydrated with water or electrolyte drinks.",
          "Take breaks in a cool, shaded area.",
          "Apply cold compresses if feeling overheated.",
        ],
      };
    if (value < 41)
      return {
        level: "Extreme Caution",
        color: "#FFA500",
        message: "Heat cramps and heat exhaustion are possible.",
        precautions: [
          "Limit outdoor activity, especially during peak heat hours.",
          "Rest frequently in shaded or air-conditioned areas.",
          "Check for heat exhaustion signs (e.g., dizziness, nausea).",
        ],
      };
    if (value < 51)
      return {
        level: "Danger",
        color: "#FF4500",
        message: "Heat cramps and heat exhaustion are likely.",
        precautions: [
          "Avoid strenuous outdoor activities.",
          "Move to a cool environment immediately if symptoms appear.",
          "Cool the body with water or cold compresses.",
        ],
      };
    return {
      level: "Extreme Danger",
      color: "#CC0001",
      message: "Heat stroke is highly likely.",
      precautions: [
        "Seek immediate medical attention if symptoms of heat stroke appear (e.g., confusion, rapid heartbeat).",
        "Cool the body rapidly with ice packs or immersion in cold water.",
        "Do not engage in any outdoor activities.",
      ],
    };
  };

  const status = getHeatIndexStatus(heatIndexNumber);
  const dataPie = [{ value: heatIndexNumber }, { value: 60 - heatIndexNumber }];

  return (
    <TooltipProvider>
      <div className="p-4 sm:p-5 overflow-hidden lg:h-[400px]">
        {/* Date and Time Header (Removed Location) */}
        <div className="flex justify-end mb-3 sm:mb-4">
          <div className="text-gray-500 text-[10px] sm:text-xs text-right leading-tight whitespace-nowrap">
            <div>{formattedDate}</div>
            <div>Last Updated: {formattedTime}</div>
          </div>
        </div>

        {/* Gauge (Expanded) */}
        <div className="relative w-full h-40 sm:h-44 lg:h-36 mb-3 sm:mb-4">
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={dataPie}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius="150%"
                outerRadius="205%"
                paddingAngle={0}
                dataKey="value"
                isAnimationActive={true} // Keep animation for updates
                className="outline-none focus:outline-none" // Remove focus outline
              >
                <Cell fill={status.color} />
                <Cell fill="#D1D5DB" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-2 text-center">
            <div className="text-3xl sm:text-4xl lg:text-4xl font-bold">
              {heatIndexNumber.toFixed(2)}°C
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Heat Index</div>
          </div>
        </div>

        {/* Readings */}
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Thermometer className="w-4 h-4" />
            <span>{typeof temperature === "number" ? temperature.toFixed(1) : "-"}°C</span>
            </div>
          <div className="flex flex-col items-center">
            <div
              className="text-sm sm:text-base font-medium"
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
            <span>{typeof humidity === "number" ? humidity.toFixed(1) : "-"}%</span>
          </div>
        </div>

        {/* Heat Index Scale */}
        <div className="w-full mb-3 sm:mb-4">
          <div
            className="h-2 sm:h-2.5 w-full rounded-full mb-1 relative"
            style={{
              background:
                "linear-gradient(to right, #69CF03, #FFD700, #FFA500, #FF4500, #CC0001)",
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

        {/* Warning Message with Enhanced Tooltip */}
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
              <p className="mt-1 text-[var(--orange-primary)] font-medium">
                Precautions:
              </p>
              <ul className="list-disc list-inside text-xs">
                {status.precautions.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
