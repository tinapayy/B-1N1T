import WeatherGauge from "@/components/sections/weather-gauge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bell } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8">
          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardContent className="p-0">
                <WeatherGauge
                  temperature={28}
                  humidity={77.2}
                  heatIndex={31}
                  location="Miagao, Iloilo"
                  lastUpdated="12:08 AM"
                />
              </CardContent>
            </Card>

            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <Input type="search" placeholder="Search City" className="w-full sm:w-[300px]" />
                  <button className="p-2 border border-gray-300 rounded-md">
                    <Bell className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Card className="col-span-1 h-[200px] flex items-center justify-center text-gray-500">Placeholder for Widget 1 (Map)</Card>
            </div>
            <div>
              <Card className="col-span-1 h-[200px] flex items-center justify-center text-gray-500">Placeholder for Widget 2 (Daily Forecast)</Card>
            </div>
            <div>
              <Card className="col-span-1 h-[200px] flex items-center justify-center text-gray-500">Placeholder for Widget 3 (Hourly Forecast)</Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
