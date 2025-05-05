// /src/app/api/analytics/bar-summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const metricFieldMap: Record<string, { min: string; max: string }> = {
  "temperature": { min: "minTemp", max: "maxTemp" },
  "humidity": { min: "minHumidity", max: "maxHumidity" },
  "heatIndex": { min: "minHeatIndex", max: "maxHeatIndex" },
};

const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");
  const metric = searchParams.get("metric")?.toLowerCase();

  if (!sensorId || !metric || !(metric in metricFieldMap)) {
    return NextResponse.json(
      { error: "Missing or invalid parameters" },
      { status: 400 }
    );
  }

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);

  const snapshot = await adminDb
    .collection("analytics_daily_highs")
    .where("sensorID", "==", sensorId)
    .where("timestamp", ">=", Timestamp.fromDate(weekStart))
    .get();

  const rawDocs = snapshot.docs.map((doc) => doc.data());

  const dataByDay: Record<string, { day: string; minTemp: number; maxTemp: number }> = {};
  for (let doc of rawDocs) {
    const ts = doc.timestamp?.toDate?.();
    if (!ts) continue;
    const dayLabel = dayLabels[ts.getDay()];
    const minVal = doc[metricFieldMap[metric].min];
    const maxVal = doc[metricFieldMap[metric].max];
    if (minVal != null && maxVal != null) {
      dataByDay[dayLabel] = {
        day: dayLabel,
        minTemp: minVal,
        maxTemp: maxVal,
      };
    }
  }

  // Ensure all 7 days are accounted for
  const chartData = dayLabels.map((label) => {
    const existing = dataByDay[label];
    return {
      day: label,
      minTemp: existing?.minTemp ?? 0,
      maxTemp: existing?.maxTemp ?? 0,
    };
  });

  return NextResponse.json(chartData);
}