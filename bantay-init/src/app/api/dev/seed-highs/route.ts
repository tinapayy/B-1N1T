import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sensorId, date, highestTemp, highestHumidity, highestHeatIndex } = body;

    await adminDb.collection("analytics_daily_highs").doc(`${sensorId}_${date}`).set({
      sensorId,
      date: Timestamp.fromDate(new Date(date)),
      highestTemp,
      highestHumidity,
      highestHeatIndex,
      timestamp: Timestamp.now(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to insert mock data" }, { status: 500 });
  }
}
