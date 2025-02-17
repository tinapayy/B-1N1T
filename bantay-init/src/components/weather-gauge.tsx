import { PieChart, Pie, Cell } from "recharts"
import { MapPin } from 'lucide-react'

export default function WeatherGauge() {
  const value = 31
  const data = [
    { value: value / 50 * 100 },
    { value: 100 - (value / 50 * 100) }
  ]
  
  const colorScale = [
    { range: [0, 27], color: '#92D050', label: 'Not\nHazardous' },
    { range: [27, 32], color: '#FFC000', label: 'Caution' },
    { range: [33, 41], color: '#FF8C00', label: 'Extreme\nCaution' },
    { range: [42, 51], color: '#FF0000', label: 'Danger' },
    { range: [52, 100], color: '#C00000', label: 'Extreme\nDanger' },
  ]

  const getCurrentColor = (value: number) => {
    const range = colorScale.find(({ range }) => 
      value >= range[0] && value <= range[1]
    )
    return range?.color || colorScale[0].color
  }

  return (
    <div className="p-6 bg-white rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full text-white">
          <MapPin className="w-5 h-5" />
          <span>Miagao, Iloilo</span>
        </div>
        <div className="text-gray-500 text-right">
          <div>Feb. 5, 2025, Tuesday</div>
          <div className="text-sm">Last Updated: 12:08 AM</div>
        </div>
      </div>

      {/* Gauge */}
      <div className="flex justify-center mb-8">
        <div className="relative w-[200px] h-[100px]">
          <PieChart width={200} height={100}>
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
              <Cell fill="#E5E5E5" />
            </Pie>
          </PieChart>
          
          <div className="absolute inset-0 flex flex-col items-center">
            <div className="text-4xl font-bold mt-2">{value}°C</div>
            <div className="text-xl text-gray-600">Heat Index</div>
          </div>
        </div>
      </div>

      {/* Temperature and Humidity */}
      <div className="flex justify-center gap-8 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">28°C</span>
        </div>
        <div className="text-yellow-500 text-2xl font-medium">
          Caution
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">77.2%</span>
        </div>
      </div>

      {/* Classification Bar */}
      <div className="mb-4">
        <div className="text-sm text-center text-gray-600 mb-2">
          Classification
        </div>
        <div className="relative">
          {/* Color Bar */}
          <div className="flex h-2 rounded-full overflow-hidden">
            {colorScale.map((item, i) => (
              <div 
                key={i}
                className="flex-1"
                style={{ backgroundColor: item.color }}
              />
            ))}
          </div>
          
          {/* Labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
            <div className="text-center">{`(< 27°C)`}</div>
            <div className="text-center">{`(27 - 32°C)`}</div>
            <div className="text-center">{`(33 - 41°C)`}</div>
            <div className="text-center">{`(42 - 51°C)`}</div>
            <div className="text-center">{`(≥ 52°C)`}</div>
          </div>
          
          {/* Current Value Indicator */}
          <div 
            className="absolute top-0 w-1 h-3 bg-black"
            style={{ 
              left: `${(value / 52) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          />
        </div>
      </div>

      {/* Warning Message */}
      <div className="bg-gray-900 text-white p-4 rounded-lg text-center text-sm">
        Fatigue is possible with prolonged exposure and activity.
        <br />
        Continuing activity could lead to heat cramps
      </div>
    </div>
  )
}