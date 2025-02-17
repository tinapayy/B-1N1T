import { Cloud, CloudLightning, CloudRain, Sun } from "lucide-react"

const forecast = [
  { time: "11 AM", temp: 28, icon: Cloud },
  { time: "12 NN", temp: 31, icon: Sun },
  { time: "1 PM", temp: 27, icon: CloudRain },
  { time: "2 PM", temp: 29, icon: CloudLightning },
  { time: "3 PM", temp: 32, icon: Cloud },
]

export default function HourlyForecast() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Hourly Forecast</h2>
        <span className="text-sm text-muted-foreground">by AccuWeather</span>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {forecast.map((hour) => {
          const Icon = hour.icon
          return (
            <div key={hour.time} className="flex flex-col items-center p-4 rounded-xl bg-gray-900 text-white">
              <span className="text-sm mb-2">{hour.time}</span>
              <Icon className="w-8 h-8 mb-2" />
              <span className="font-medium">{hour.temp}°C</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

