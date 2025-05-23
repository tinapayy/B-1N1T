// /api/analytics/highest/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { DateTime } from "luxon";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");

  if (!sensorId) {
    return NextResponse.json({ error: "Missing sensorId parameter" }, { status: 400 });
  }

  const nowPH = DateTime.local().setZone("Asia/Manila").startOf("day");
  const docId = `${sensorId}_${nowPH.toFormat("yyyy-MM-dd")}`;

  try {
    const doc = await adminDb
      .collection("analytics_min_max_summary")
      .doc(docId)
      .get();

    if (!doc.exists) {
      return NextResponse.json({ error: "No data for today" }, { status: 404 });
    }

    const data = doc.data();
    return NextResponse.json({
      temperature: data?.maxTemp ?? null,
      humidity: data?.maxHumidity ?? null,
      heatIndex: data?.maxHeatIndex ?? null,
      timestamp: data?.timestamp?.toDate().toISOString() ?? null,
    });
  } catch (err) {
    console.error("Failed to fetch daily high:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
