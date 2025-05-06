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
    const baseDate =
      d.weekStart?.toDate?.() ||
      d.date?.toDate?.() ||
      new Date(d.timestamp || Date.now());

    const localDate = new Date(baseDate.getTime() + 8 * 60 * 60 * 1000); // UTC+8

    return {
      timestamp: localDate.toISOString().slice(0, 10),
      avgHeatIndex: d.avgHeatIndex ?? null,
      avgTemp: d.avgTemp ?? null,
    };
  });

  return NextResponse.json(results.reverse()); // Reverse to chronological order
}
