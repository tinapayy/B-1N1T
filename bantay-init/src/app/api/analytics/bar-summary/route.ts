// /src/app/api/analytics/bar-summary/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const metricFieldMap: Record<string, { min: string; max: string }> = {
  temperature: { min: "minTemp", max: "maxTemp" },
  humidity: { min: "minHumidity", max: "maxHumidity" },
  heatIndex: { min: "minHeatIndex", max: "maxHeatIndex" },
};

const dayLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");
  const metric = searchParams.get("metric")?.toLowerCase();

  if (!sensorId || !metric || !(metric in metricFieldMap)) {
    return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
  }

  const now = new Date(Date.now() + 8 * 60 * 60 * 1000); // UTC+8
  const dayOffset = (now.getUTCDay() + 6) % 7; // Monday-start
  const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayOffset));
  weekStart.setUTCHours(0, 0, 0, 0);

  const snapshot = await adminDb
    .collection("analytics_daily_highs")
    .where("sensorID", "==", sensorId)
    .where("timestamp", ">=", Timestamp.fromDate(weekStart))
    .get();

  const rawDocs = snapshot.docs.map((doc) => doc.data());

  const dataByIndex: Record<number, { min: number; max: number }> = {};

  for (const doc of rawDocs) {
    const ts = doc.timestamp?.toDate?.();
    if (!ts) continue;

    const local = new Date(ts.getTime() + 8 * 60 * 60 * 1000); // convert to UTC+8
    const dayIndex = (local.getUTCDay() + 6) % 7; // 0 = MON, ..., 6 = SUN

    const min = doc[metricFieldMap[metric].min];
    const max = doc[metricFieldMap[metric].max];

    if (typeof min === "number" && typeof max === "number") {
      dataByIndex[dayIndex] = { min, max };
    }
  }

  const chartData = dayLabels.map((label, index) => {
    const entry = dataByIndex[index];
    const min = entry?.min ?? 0;
    const max = entry?.max ?? 0;
    return {
      day: label,
      min,
      delta: max - min,
    };
  });

  return NextResponse.json(chartData);
}
