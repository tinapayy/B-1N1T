// PATCHED: /app/api/dev/seed/route.ts (compressed historical upload)

import { NextRequest, NextResponse } from "next/server";

function simulateDailyReading(sensorId: string, receiverId: string, timestamp: number) {
  const temperature = 29 + Math.random() * 6; // 29–35°C
  const humidity = 60 + Math.random() * 15;   // 60–75%
  const heatIndex = temperature + Math.random() * 3; // Slightly higher

  return {
    sensorId,
    receiverId,
    temperature: parseFloat(temperature.toFixed(2)),
    humidity: parseFloat(humidity.toFixed(2)),
    heatIndex: parseFloat(heatIndex.toFixed(2)),
    __mockTimestamp: timestamp,
  };
}

export async function GET(req: NextRequest) {
  const sensorId = "SENSOR_001";
  const receiverId = "RECEIVER_001";

  const start = new Date("2025-04-01T12:00:00+08:00");
  const end = new Date("2025-05-06T12:00:00+08:00");

  const dayMs = 24 * 60 * 60 * 1000;
  const results = [];

  for (let ts = start.getTime(); ts <= end.getTime(); ts += dayMs) {
    const reading = simulateDailyReading(sensorId, receiverId, ts);

    const res = await fetch("http://localhost:3000/api/receiver/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reading),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error(`❌ Failed at ${new Date(ts).toISOString()}`, err);
    } else {
      results.push(new Date(ts).toISOString());
    }
  }

  return NextResponse.json({
    success: true,
    uploadedDays: results.length,
    note: "Per-day compressed summary upload for April 1 – May 6, 2025",
  });
}
