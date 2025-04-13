// src/app/api/readings/latest/route.ts

import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

/**
 * GET /api/readings/latest?sensorId=sensor-001
 * Returns latest cached reading from /sensor_latest
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
    const docRef = db.collection("sensor_latest").doc(sensorId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: "No latest reading found for this sensor" },
        { status: 404 }
      );
    }

    const data = docSnap.data();

    if (!data || !data.timestamp) {
      return NextResponse.json(
        { error: "Invalid sensor data" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      sensorId,
      ...data
    });
  } catch (err) {
    console.error("[/api/readings/latest] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch latest reading" },
      { status: 500 }
    );
  }
}
