// src/app/api/sensor-latest/route.ts

import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

/**
 * POST /api/sensor-latest
 * Adds or overwrites latest sensor data in /sensor_latest/{sensorId}
 */
export async function POST(req: Request) {
  try {
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

    await db.collection("sensor_latest").doc(sensorId).set({
      temperature,
      humidity,
      heatIndex,
      status,
      anomaly,
      timestamp: new Date(timestamp),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/sensor-latest] POST error:", err);
    return NextResponse.json({ error: "Failed to write sensor_latest" }, { status: 500 });
  }
}
