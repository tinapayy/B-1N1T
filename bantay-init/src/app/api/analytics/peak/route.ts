// /api/analytics/peak/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");

  if (!sensorId) {
    return NextResponse.json({ error: "Missing sensorId" }, { status: 400 });
  }

  try {
    const doc = await adminDb.collection("sensor_latest").doc(sensorId).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Sensor not found" }, { status: 404 });
    }

    const data = doc.data();
    return NextResponse.json({
      alltimeMax: {
        heatIndex: data?.peakHeatIndex ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to fetch peak index:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
