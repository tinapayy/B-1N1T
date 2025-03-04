"use client";

// Import necessary libraries and components
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"; // For rendering the pie chart
import { MapPin, Thermometer, Droplets } from "lucide-react"; // Icons for location, temperature, and humidity
import useFirebaseData from "../lib/useFirebaseData"; // Custom hook to fetch data from Firebase
import { format } from "date-fns"; // For formatting dates and times

// Define the props interface for the WeatherGauge component
interface WeatherGaugeProps {
  location: string; // Dynamic: Location name passed as a prop
}

// Main WeatherGauge component
export default function WeatherGauge({ location }: WeatherGaugeProps) {
  // Fetch data from Firebase using the custom hook
  const { data, loading, error } = useFirebaseData("/readings");

  // Display a loading message while data is being fetched
  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  // Display an error message if there's an issue fetching data
  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error.message}</div>;
  }

  // Display a message if no data is available
  if (!data) {
    return <div className="p-4 text-center">No data available</div>;
  }

  // Get the latest reading from the fetched data
  const latestReadingKey = Object.keys(data).pop(); // Get the key of the latest reading
  const latestReading = latestReadingKey ? data[latestReadingKey] : null; // Get the latest reading object

  // Display a message if no latest reading is available
  if (!latestReading) {
    return <div className="p-4 text-center">No latest reading available</div>;
  }

  // Destructure the latest reading to get temperature, humidity, heatIndex, and timestamp
  const { temperature, humidity, heatIndex, timestamp } = latestReading;

  // Ensure heatIndex is a number (fallback to 0 if undefined or invalid)
  const heatIndexNumber = heatIndex ? parseFloat(heatIndex) : 0;

  // Function to determine the heat index status (e.g., "Caution", "Danger")
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

  // Get the current heat index status based on the heatIndex value
  const status = getHeatIndexStatus(heatIndexNumber);

  // Data for the pie chart (heat index vs remaining value)
  const gaugeData = [
    { name: "value", value: heatIndexNumber }, // Heat index value
    { name: "remainder", value: 60 - heatIndexNumber }, // Remaining value to complete the gauge
  ];

  // Format the date and time for display
  const formattedDate = format(new Date(Number.parseInt(timestamp)), "MMM. d, yyyy, EEEE"); // e.g., "Oct. 10, 2023, Tuesday"
  const formattedTime = format(new Date(Number.parseInt(timestamp)), "h:mm:ss a"); // e.g., "10:30:45 AM"

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-lg">
      {/* Location Header */}
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 bg-[#2f2f2f] text-white px-4 py-2 rounded-full">
          <MapPin className="w-4 h-4" />
          <span className="text-sm sm:text-base">{location}</span> {/* Display the location name */}
        </div>
        <div className="text-gray-500 text-xs sm:text-sm text-center sm:text-right">
          <div>{formattedDate}</div> {/* Display the formatted date */}
          <div>Last Updated: {formattedTime}</div> {/* Display the formatted time */}
        </div>
      </div>

      {/* Gauge (Pie Chart) */}
      <div className="relative w-full h-40 sm:h-48 lg:h-56 mb-6 sm:mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={gaugeData} // Data for the pie chart
              cx="50%" // Center X position
              cy="100%" // Center Y position
              startAngle={180} // Start angle for the semi-circle
              endAngle={0} // End angle for the semi-circle
              innerRadius="60%" // Inner radius of the pie chart
              outerRadius="80%" // Outer radius of the pie chart
              paddingAngle={0} // Space between segments
              dataKey="value" // Key to access the value in the data
            >
              <Cell fill={status.color} /> {/* Color for the heat index segment */}
              <Cell fill="#D1D5DB" /> {/* Color for the remaining segment */}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-1">
            {heatIndexNumber.toFixed(1)}°C {/* Display the heat index value */}
          </div>
          <div className="text-lg sm:text-xl lg:text-2xl text-gray-600">Heat Index</div> {/* Label for heat index */}
        </div>
      </div>

      {/* Readings (Temperature, Status, Humidity) */}
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 sm:w-5 sm:h-5" /> {/* Temperature icon */}
          <span className="text-base sm:text-lg lg:text-xl">{parseFloat(temperature).toFixed(1)}°C</span> {/* Display temperature */}
        </div>
        <div className="flex flex-col items-center">
          <div className="text-lg sm:text-xl lg:text-2xl font-medium" style={{ color: status.color }}>
            {status.level} {/* Display the heat index status (e.g., "Caution") */}
          </div>
          <div className="text-gray-500 text-xs sm:text-sm">Classification</div> {/* Label for classification */}
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 sm:w-5 sm:h-5" /> {/* Humidity icon */}
          <span className="text-base sm:text-lg lg:text-xl">{parseFloat(humidity).toFixed(1)}%</span> {/* Display humidity */}
        </div>
      </div>

      {/* Heat Index Scale (Color Gradient) */}
      <div className="w-full mb-6">
        <div
          className="h-2 sm:h-3 w-full rounded-full mb-2 relative"
          style={{
            background: "linear-gradient(to right, #90EE90, #FFD700, #FFA500, #FF4500, #8B0000)", // Gradient for heat index levels
          }}
        >
          <div
            className="absolute w-1 h-3 sm:h-4 bg-black top-1/2 transform -translate-y-1/2"
            style={{
              left: `${(heatIndexNumber / 60) * 100}%`, // Position the indicator based on heat index
              transition: "left 0.3s ease-in-out", // Smooth transition for the indicator
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] sm:text-xs">
          {/* Labels for heat index levels */}
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
        {status.message} {/* Display the warning message based on heat index status */}
      </div>
    </div>
  );
}