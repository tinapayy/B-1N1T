// File: /app/api/analytics/highest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");

  if (!sensorId) {
    return NextResponse.json({ error: "Missing sensorId parameter" }, { status: 400 });
  }

  try {
    const snapshot = await adminDb
      .collection("analytics_daily_highs")
      .where("sensorId", "==", sensorId)
      .orderBy("date", "desc")
      .limit(7)
      .get();

    const records = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        date: data.date.toDate().toISOString().split("T")[0],
        highestTemp: data.highestTemp ?? null,
        highestHumidity: data.highestHumidity ?? null,
        highestHeatIndex: data.highestHeatIndex ?? null,
      };
    });

    return NextResponse.json(records);
  } catch (err) {
    console.error("Failed to fetch highest daily records:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
