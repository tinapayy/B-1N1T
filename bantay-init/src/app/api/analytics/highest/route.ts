// File: /app/api/analytics/highest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");

  if (!sensorId) {
    return NextResponse.json({ error: "Missing sensorId parameter" }, { status: 400 });
  }

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
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
      timestamp: data?.timestamp?.toDate().toISOString() ?? null,
    });
  } catch (err) {
    console.error("🔥 Failed to fetch daily high:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
