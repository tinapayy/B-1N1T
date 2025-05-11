import { HourlyForecastData, DailyForecastData } from "@/lib/open-meteo";

// Helper to determine if the time is during the day (6 AM to 6 PM)
const isDayTime = (time: string | undefined): boolean => {
  if (!time) return true; // Default to day for daily forecasts or if time is undefined
  const hourMatch = time.match(/(\d+)(?=\s*(AM|PM))/i);
  const periodMatch = time.match(/(AM|PM)/i);
  if (!hourMatch || !periodMatch) return true;

  let hour = parseInt(hourMatch[0], 10);
  const period = periodMatch[0].toUpperCase();

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return hour >= 6 && hour < 18; // 6 AM to 6 PM is daytime
};

export const getWeatherIconInfo = (
  condition: HourlyForecastData["condition"] | DailyForecastData["condition"],
  time?: string // Optional time parameter for hourly forecasts
) => {
  const isDay = isDayTime(time);
  const isNight = !isDay;

  // Determine if we should show only the night icon (for sunny and partly-cloudy at night)
  const showOnlyNightIcon =
    isNight && (condition === "sunny" || condition === "partly-cloudy");

  const weatherIconPath = (() => {
    if (isNight) {
      switch (condition) {
        case "sunny":
          return "/assets/weather-icons/clear-night.png"; // Night-specific icon for clear skies
        case "partly-cloudy":
          return "/assets/weather-icons/partly-cloudy-night.png"; // Night-specific icon
        case "cloudy":
          return "/assets/weather-icons/cloudy.png";
        case "rain":
          return "/assets/weather-icons/rain.png";
        case "storm":
          return "/assets/weather-icons/storm.png";
        default:
          return "/assets/weather-icons/clear-night.png";
      }
    }
    switch (condition) {
      case "sunny":
        return "/assets/weather-icons/sunny.png";
      case "partly-cloudy":
        return "/assets/weather-icons/partly-cloudy.png";
      case "cloudy":
        return "/assets/weather-icons/cloudy.png";
      case "rain":
        return "/assets/weather-icons/rain.png";
      case "storm":
        return "/assets/weather-icons/storm.png";
      default:
        return "/assets/weather-icons/sunny.png";
    }
  })();

  return {
    weatherIconPath,
    isNight,
    nightIconPath: "/assets/weather-icons/night.png",
    showOnlyNightIcon,
  };
};
