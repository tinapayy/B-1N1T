// src/app/api/ping/route.ts

import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

/**
 * GET /api/ping?sensorId=SENSOR_ID
 * 
 * Simulates a ping to a LoRa-connected sensor.
 * Returns latest reading timestamp and basic health status.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");

  if (!sensorId) {
    return NextResponse.json(
      { error: "Missing sensorId query parameter" },
      { status: 400 }
    );
  }

  try {
    const latestDoc = await db.collection("sensor_latest").doc(sensorId).get();

    if (!latestDoc.exists) {
      return NextResponse.json(
        { status: "offline", lastSeen: null, anomaly: false },
        { status: 404 }
      );
    }

    const data = latestDoc.data();

    if (!data || !data.timestamp) {
      return NextResponse.json(
        { status: "offline", lastSeen: null, anomaly: false },
        { status: 404 }
      );
    }

    const now = Date.now();
    const lastSeen = new Date(data.timestamp.toDate ? data.timestamp.toDate() : data.timestamp).getTime();


    // Check if reading is older than 5 minutes
    const status = now - lastSeen > 5 * 60 * 1000 ? "offline" : "online";

    return NextResponse.json({
      status,
      lastSeen: new Date(lastSeen).toISOString(),
      anomaly: data.anomaly || false,
    });
  } catch (err) {
    console.error("[/api/ping] Error:", err);
    return NextResponse.json(
      { error: "Failed to ping sensor" },
      { status: 500 }
    );
  }
}
