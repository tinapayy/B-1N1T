// src/app/api/sensor-latest/route.ts
import { db, rtdb } from "@/lib/firebase-admin"; // Firestore and RTDB admin
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key");

    if (apiKey !== process.env.NEXT_PUBLIC_RECEIVER_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      sensorId,
      temperature,
      humidity,
      heatIndex,
      status,
      anomaly,
      timestamp
    } = body;

    if (!sensorId || !timestamp) {
      return NextResponse.json({ error: "Missing sensorId or timestamp" }, { status: 400 });
    }

    // ✅ Write to Realtime Database
    await rtdb.ref(`sensor_latest/${sensorId}`).set({
      temperature,
      humidity,
      heatIndex,
      status,
      anomaly,
      timestamp: new Date(timestamp),
    });

    // 🔄 Optional: Also log to Firestore readings collection
    await db
      .collection(`readings/${sensorId}/entries`)
      .add({
        temperature,
        humidity,
        heatIndex,
        status,
        anomaly,
        timestamp: new Date(timestamp),
      });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/sensor-latest] Error:", err);
    return NextResponse.json({ error: "Failed to process sensor data" }, { status: 500 });
  }
}
