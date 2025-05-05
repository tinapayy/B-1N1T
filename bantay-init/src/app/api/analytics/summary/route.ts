import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const COLLECTION_MAP = {
  week: "analytics_weekly_summary",
  month: "analytics_monthly_summary",
  year: "analytics_yearly_summary",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");
  const timeframe = searchParams.get("timeframe") || "week";

  if (!sensorId || typeof sensorId !== "string") {
    return NextResponse.json({ error: "Missing sensorId" }, { status: 400 });
  }

  if (!["week", "month", "year"].includes(timeframe)) {
    return NextResponse.json({ error: "Invalid timeframe" }, { status: 400 });
  }

  const collection = COLLECTION_MAP[timeframe as "week" | "month" | "year"];
  const snapshot = await adminDb
    .collection(collection)
    .where("sensorID", "==", sensorId)
    .orderBy(timeframe === "week" ? "weekStart" : "date", "desc")
    .limit(8)
    .get();

  const results = snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      timestamp: d.weekStart?.toDate?.().toISOString().slice(0, 10) ||
                 d.date?.toDate?.().toISOString().slice(0, 10) ||
                 d.timestamp ||
                 null,
      avgHeatIndex: d.avgHeatIndex ?? null,
      avgTemp: d.avgTemp ?? null,
    };
  });

  return NextResponse.json(results.reverse()); // Reverse to chronological order
}
