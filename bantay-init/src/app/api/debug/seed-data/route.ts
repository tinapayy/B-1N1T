// src/app/api/debug/seed-data/route.ts

import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

/**
 * POST /api/debug/seed-data
 * Seeds Firestore with sample sensor, readings, and alert
 * FOR DEV ONLY
 */
export async function POST() {
  const sensorId = "sensor-001";

  try {
    // 1. Add Sensor
    await db.collection("sensors").doc(sensorId).set({
      name: "Seed Sensor",
      receiverId: "receiver-001",
      latitude: 10.643,
      longitude: 122.234,
      regionCode: "06",
      provinceCode: "0630",
      municipalityCode: "063031",
      regionName: "Western Visayas",
      provinceName: "Iloilo",
      municipalityName: "Miagao",
      status: "online",
      registerDate: new Date().toISOString()
    });

    // 2. Add Readings (this month, last month)
    const readingsRef = db.collection(`readings/${sensorId}/entries`);
    const now = new Date();

    const timestamps = [
      now,
      new Date(now.getFullYear(), now.getMonth() - 1, 15),
      new Date(now.getFullYear(), now.getMonth() - 2, 10)
    ];

    for (const ts of timestamps) {
      await readingsRef.add({
        temperature: 33 + Math.random(),
        humidity: 70 + Math.random() * 10,
        heatIndex: 42 + Math.random() * 2,
        timestamp: ts,
        status: "danger",
        anomaly: true
      });
    }

    // 3. Add Alert
    await db.collection("alerts").add({
      sensorId,
      heatIndex: 44.5,
      status: "danger",
      timestamp: now,
      location: "Seed Location"
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/debug/seed-data] Error:", err);
    return NextResponse.json(
      { error: "Failed to seed test data" },
      { status: 500 }
    );
  }
}
