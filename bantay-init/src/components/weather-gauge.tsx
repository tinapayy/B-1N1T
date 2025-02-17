import { PieChart, Pie, Cell } from "recharts"

export default function WeatherGauge() {
  const value = 31
  const data = [{ value: (value / 50) * 100 }, { value: 100 - (value / 50) * 100 }]

  const colorScale = [
    { range: [0, 25], color: "#92D050", label: "Not Hazardous" },
    { range: [26, 32], color: "#FFC000", label: "Caution" },
    { range: [33, 41], color: "#FF8C00", label: "Extreme Caution" },
    { range: [42, 51], color: "#FF0000", label: "Danger" },
    { range: [52, 100], color: "#C00000", label: "Extreme Danger" },
  ]

  const getCurrentColor = (value: number) => {
    const range = colorScale.find(({ range }) => value >= range[0] && value <= range[1])
    return range?.color || colorScale[0].color
  }

  return (
    <div className="relative">
      <div className="text-center mb-4">
        <div className="text-sm text-muted-foreground mb-1">Feb. 5, 2025, Tuesday</div>
        <div className="text-sm text-muted-foreground">Last Updated: 12:08 AM</div>
      </div>

      <div className="flex justify-center">
        <div className="relative w-[200px] h-[200px]">
          <PieChart width={200} height={200}>
            <Pie
              data={data}
              cx={100}
              cy={100}
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill={getCurrentColor(value)} />
              <Cell fill="#e5e5e5" />
            </Pie>
          </PieChart>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold">{value}°C</div>
            <div className="text-lg">Heat Index</div>
            <div className="text-yellow-500 font-medium mt-1">Caution</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-4 justify-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">28°C</span>
            <span className="text-muted-foreground">77.2%</span>
          </div>
        </div>

        {/* Color Scale */}
        <div className="flex h-2 rounded-full overflow-hidden">
          {colorScale.map((item, i) => (
            <div key={i} className="flex-1" style={{ backgroundColor: item.color }} />
          ))}
        </div>

        <div className="mt-4 p-3 bg-gray-900 text-white text-sm rounded-lg text-center">
          Fatigue is possible with prolonged exposure and activity.
          <br />
          Continuing activity could lead to heat cramps
        </div>
      </div>
    </div>
  )
}

