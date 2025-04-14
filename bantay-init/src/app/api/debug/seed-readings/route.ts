import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST() {
  const sensorId = "sensor-001";
  const entries = [
    { date: "2025-04-10T08:00:00Z", temperature: 33.5, humidity: 74, heatIndex: 42.1 },
    { date: "2025-04-11T08:00:00Z", temperature: 34.0, humidity: 70, heatIndex: 44.0 },
    { date: "2025-04-12T08:00:00Z", temperature: 35.5, humidity: 68, heatIndex: 45.2 },
    { date: "2025-04-13T08:00:00Z", temperature: 32.0, humidity: 75, heatIndex: 41.8 },
    { date: "2025-04-14T08:00:00Z", temperature: 33.8, humidity: 72, heatIndex: 43.9 }
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
