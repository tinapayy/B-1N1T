import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HighestDailyRecords({ latest }: { latest: any }) {
  return (
    <Card className="col-span-1 bg-white rounded-3xl shadow-sm flex flex-col">
      <CardHeader className="px-4 sm:px-6 py-4">
        <CardTitle className="text-xl font-semibold">
          Highest Daily Record
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center pb-4 flex-grow justify-center">
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-bold">
              {latest.heatIndex.toFixed(1)}°C
            </span>
          </div>
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#f0f0f0"
              strokeWidth="16"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="var(--orange-primary, #f97316)"
              strokeWidth="16"
              strokeDasharray="251"
              strokeDashoffset={251 - (latest.heatIndex / 60) * 251}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute -bottom-6 sm:-bottom-8 w-full text-center text-sm font-medium">
            Heat Index
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:gap-8 w-full mt-4">
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-2">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base sm:text-lg font-bold">
                  {latest.temperature.toFixed(1)}°C
                </span>
              </div>
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f0f0f0"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="var(--dark-gray-1)"
                  strokeWidth="12"
                  strokeDasharray="251"
                  strokeDashoffset={251 - (latest.temperature / 50) * 251}
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">Temperature</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-2">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base sm:text-lg font-bold">
                  {latest.humidity.toFixed(1)}%
                </span>
              </div>
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f0f0f0"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="var(--dark-gray-1)"
                  strokeWidth="12"
                  strokeDasharray="251"
                  strokeDashoffset={251 - (latest.humidity / 100) * 251}
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">Humidity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}