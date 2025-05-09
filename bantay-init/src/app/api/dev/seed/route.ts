// /app/api/dev/seed/route.ts

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
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId") || "SENSOR_001";
  const receiverId = searchParams.get("receiverId") || "RECEIVER_001";

  const results: string[] = [];

  const post = async (ts: number) => {
    const reading = simulateReading(sensorId, receiverId, ts);
    const res = await fetch("http://localhost:3000/api/receiver/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reading),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`❌ Failed at ${new Date(ts).toISOString()}`, text);
    } else {
      results.push(new Date(ts).toISOString());
    }
  };

  // 1. WEEKLY (May 3–9, 2025)
  const today = new Date("2025-05-09T00:00:00+08:00").getTime();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today - i * 86400000);
    d.setHours(4, 0, 0, 0);
    await post(d.getTime());
  }

  // 2. MONTHLY (Jun 2024 to May 2025)
  for (let i = 11; i >= 0; i--) {
    const d = new Date("2025-05-01T04:00:00+08:00");
    d.setMonth(d.getMonth() - i);
    await post(d.getTime());
  }

  // 3. YEARLY (2021 to 2025)
  for (let i = 4; i >= 0; i--) {
    const d = new Date("2025-01-01T04:00:00+08:00");
    d.setFullYear(d.getFullYear() - i);
    await post(d.getTime());
  }

  return NextResponse.json({ success: true, uploaded: results.length });
}
