// File: /app/api/analytics/highest/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");

  if (!sensorId) {
    return NextResponse.json({ error: "Missing sensorId parameter" }, { status: 400 });
  }

  // Force date to PH time to construct correct Firestore docId
  const now = new Date(Date.now() + 8 * 60 * 60 * 1000); // UTC+8
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const docId = `${sensorId}_${yyyy}-${mm}-${dd}`;

  try {
    const doc = await adminDb.collection("analytics_daily_highs").doc(docId).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "No data for today." }, { status: 404 });
    }

    const data = doc.data();
    return NextResponse.json({
      temperature: data?.highestTemp ?? null,
      humidity: data?.highestHumidity ?? null,
      heatIndex: data?.highestHeatIndex ?? null,
      timestamp: data?.timestamp?.toDate?.().toISOString() ?? null,
    });
  } catch (err) {
    console.error("🔥 Failed to fetch daily high:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
