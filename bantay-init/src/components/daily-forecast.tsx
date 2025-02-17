import { Cloud, CloudRain, Sun } from "lucide-react"

const forecast = [
  { day: "Today", high: 24, low: 13, icon: Sun },
  { day: "Mon", high: 22, low: 17, icon: Cloud },
  { day: "Tue", high: 21, low: 15, icon: Sun },
  { day: "Wed", high: 20, low: 16, icon: Cloud },
  { day: "Tur", high: 22, low: 15, icon: CloudRain },
]

export default function DailyForecast() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Daily Forecast</h2>
      <div className="space-y-4">
        {forecast.map((day) => {
          const Icon = day.icon
          return (
            <div key={day.day} className="flex items-center justify-between">
              <span className="w-16">{day.day}</span>
              <Icon className="w-6 h-6" />
              <div className="flex gap-2">
                <span className="font-medium">{day.high}°</span>
                <span className="text-muted-foreground">{day.low}°</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

