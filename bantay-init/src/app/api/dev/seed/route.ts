// PATCHED: /app/api/dev/seed/route.ts

import { NextRequest, NextResponse } from "next/server";

function simulateReading(sensorId: string, receiverId: string, timestamp: number) {
  const temperature = 28 + Math.random() * 10;
  const humidity = 60 + Math.random() * 20;
  const heatIndex = temperature + Math.random() * 5;

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

  const start = new Date("2025-05-07T00:00:00+08:00");
  const end = new Date("2025-05-08T23:59:00+08:00");
  const intervalMs = 60 * 60 * 1000;

  const results = [];

  for (let ts = start.getTime(); ts <= end.getTime(); ts += intervalMs) {
    const reading = simulateReading(sensorId, receiverId, ts);

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

  return NextResponse.json({ success: true, uploaded: results.length });
}
