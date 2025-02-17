import { Bell } from 'lucide-react';
import { Card } from "./components/ui/card";
import WeatherGauge from "./components/weather-gauge";
import DailyForecast from "./components/daily-forecast";
import HourlyForecast from "./components/hourly-forecast";
import MapSection from "./components/map-section";
import Sidebar from "./components/sidebar";

export default function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Miagao, Iloilo</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search City"
                  className="w-[300px] rounded-full px-4 py-2 pl-10 bg-white border"
                />
                <span className="absolute left-3 top-2.5 text-muted-foreground">
                  🔍
                </span>
              </div>
              <button className="p-2 rounded-full bg-white">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <WeatherGauge />
            </Card>
            
            <Card className="p-6">
              {/* Map Section here */}
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <DailyForecast />
            </Card>
            
            <Card className="p-6">
              <HourlyForecast />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}