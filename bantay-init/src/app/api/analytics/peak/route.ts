// /api/analytics/peak/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sensorId = searchParams.get("sensorId");

    if (!sensorId) {
      return NextResponse.json({ error: "Missing sensorId" }, { status: 400 });
    }

    const doc = await adminDb
      .collection("analytics_peak_summary")
      .doc(sensorId)
      .get();

    if (!doc.exists) {
      return NextResponse.json({ error: "No peak data found" }, { status: 404 });
    }

    const data = doc.data();

    return NextResponse.json({
      alltimeMax: {
        heatIndex: data?.peakHeatIndex ?? null,
        timestamp: data?.timestamp?.toDate().toISOString() ?? null
      }
    });
  } catch (err) {
    console.error("Failed to fetch peak index:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
