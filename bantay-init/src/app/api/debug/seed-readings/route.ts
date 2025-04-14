import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST() {
  const sensorId = "sensor-001";
  const entries = [
    { date: "2025-04-10T08:00:00Z", temperature: 31.2, humidity: 65, heatIndex: 38.5 },
    { date: "2025-04-10T12:00:00Z", temperature: 33.5, humidity: 62, heatIndex: 41.2 },
    { date: "2025-04-10T16:00:00Z", temperature: 35.8, humidity: 58, heatIndex: 44.6 },
    { date: "2025-04-10T20:00:00Z", temperature: 30.5, humidity: 68, heatIndex: 37.2 },
    { date: "2025-04-11T08:00:00Z", temperature: 32.8, humidity: 68, heatIndex: 40.2 },
    { date: "2025-04-12T08:00:00Z", temperature: 34.5, humidity: 70, heatIndex: 43.8 },
    { date: "2025-04-13T08:00:00Z", temperature: 33.1, humidity: 72, heatIndex: 41.5 },
    { date: "2025-04-14T08:00:00Z", temperature: 35.2, humidity: 67, heatIndex: 44.6 },
    // { date: "2025-04-15T08:00:00Z", temperature: 36.0, humidity: 64, heatIndex: 46.2 },
    // { date: "2025-04-16T08:00:00Z", temperature: 34.8, humidity: 69, heatIndex: 43.1 },
    // { date: "2025-04-17T08:00:00Z", temperature: 33.5, humidity: 71, heatIndex: 41.8 },
    // { date: "2025-04-18T08:00:00Z", temperature: 32.2, humidity: 73, heatIndex: 39.5 },
    // { date: "2025-04-19T08:00:00Z", temperature: 31.8, humidity: 75, heatIndex: 38.2 }
  ];

  try {
    const batch = db.batch();
    entries.forEach((entry) => {
      const ref = db.collection(`readings/${sensorId}/entries`).doc();
      batch.set(ref, {
        temperature: entry.temperature,
        humidity: entry.humidity,
        heatIndex: entry.heatIndex,
        timestamp: new Date(entry.date),
      });
    });

    await batch.commit();
    return NextResponse.json({ success: true, inserted: entries.length });
  } catch (err) {
    console.error("[/api/debug/seed-readings] Error:", err);
    return NextResponse.json({ error: "Failed to seed readings" }, { status: 500 });
  }
}
