export interface Location {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country_code?: string;
}

export interface HourlyForecastData {
  time: string;
  temperature: number;
  condition: "sunny" | "partly-cloudy" | "cloudy" | "rain" | "storm";
}

export interface DailyForecastData {
  day: string;
  condition: "sunny" | "partly-cloudy" | "cloudy" | "rain" | "storm";
  highTemp: number;
  lowTemp: number;
}

const getWeatherCondition = (code: number): HourlyForecastData["condition"] => {
  if (code <= 3) return code === 0 ? "sunny" : "partly-cloudy";
  if (code <= 48) return "cloudy";
  if (code <= 67) return "rain";
  return "storm";
};

export async function fetchLocations(query: string): Promise<Location[]> {
  if (query.length < 3) return [];
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query
      )}&country_codes=PH&count=5`
    );
    if (!response.ok) throw new Error("Failed to fetch locations");
    const data = await response.json();
    console.log("Open-Meteo Geocoding API Response:", data); // Debug log
    return (
      data.results
        ?.filter((loc: any) => loc.country_code === "PH") // Ensure only PH locations
        .map((loc: any) => ({
          name: loc.name,
          latitude: loc.latitude,
          longitude: loc.longitude,
          admin1: loc.admin1,
          country_code: loc.country_code,
        })) || []
    );
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
}

export async function fetchHourlyForecast(
  latitude: number,
  longitude: number
): Promise<HourlyForecastData[]> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&timezone=Asia/Manila`
    );
    if (!response.ok) throw new Error("Failed to fetch hourly forecast");
    const data = await response.json();
    return data.hourly.time.slice(0, 12).map((time: string, index: number) => ({
      time: new Date(time).toLocaleTimeString([], {
        hour: "numeric",
        hour12: true,
      }),
      temperature: Math.round(data.hourly.temperature_2m[index]),
      condition: getWeatherCondition(data.hourly.weathercode[index]),
    }));
  } catch (error) {
    console.error("Error fetching hourly forecast:", error);
    throw error;
  }
}

export async function fetchDailyForecast(
  latitude: number,
  longitude: number
): Promise<DailyForecastData[]> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia/Manila`
    );
    if (!response.ok) throw new Error("Failed to fetch daily forecast");
    const data = await response.json();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return data.daily.time.slice(0, 5).map((time: string, index: number) => ({
      day: index === 0 ? "Today" : days[new Date(time).getDay()],
      condition: getWeatherCondition(data.daily.weathercode[index]),
      highTemp: Math.round(data.daily.temperature_2m_max[index]),
      lowTemp: Math.round(data.daily.temperature_2m_min[index]),
    }));
  } catch (error) {
    console.error("Error fetching daily forecast:", error);
    throw error;
  }
}
