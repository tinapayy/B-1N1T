// /src/app/api/analytics/bar-summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const metricFieldMap: Record<string, { min: string; max: string }> = {
  temperature: { min: "minTemp", max: "maxTemp" },
  humidity: { min: "minHumidity", max: "maxHumidity" },
  heatIndex: { min: "minHeatIndex", max: "maxHeatIndex" },
};

// Monday-start day labels
const dayLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");
  const metric = searchParams.get("metric")?.toLowerCase();

  if (!sensorId || !metric || !(metric in metricFieldMap)) {
    return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
  }

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Start of week (Monday)
  weekStart.setHours(0, 0, 0, 0);

  const snapshot = await adminDb
    .collection("analytics_daily_highs")
    .where("sensorID", "==", sensorId)
    .where("timestamp", ">=", Timestamp.fromDate(weekStart))
    .get();

  const rawDocs = snapshot.docs.map((doc) => doc.data());

  const dataByDay: Record<string, Record<string, any>> = {};
  for (let doc of rawDocs) {
    const ts = doc.timestamp?.toDate?.();
    if (!ts) continue;

    const localDay = new Date(ts).toLocaleDateString("en-PH", { weekday: "short", timeZone: "Asia/Manila" }).toUpperCase();
    const dayLabel = localDay.slice(0, 3); // Ensures "MON", "TUE", etc.

    const minVal = doc[metricFieldMap[metric].min];
    const maxVal = doc[metricFieldMap[metric].max];

    if (minVal != null && maxVal != null) {
      dataByDay[dayLabel] = {
        ...dataByDay[dayLabel],
        [metricFieldMap[metric].min]: minVal,
        [metricFieldMap[metric].max]: maxVal,
      };
    }
  }

  const { min: minKey, max: maxKey } = metricFieldMap[metric];
  const chartData = dayLabels.map((label) => {
    const entry = dataByDay[label];
    const min = entry?.[minKey] ?? 0;
    const max = entry?.[maxKey] ?? 0;
    return {
      day: label,
      min,
      delta: max - min,
    };
  });

  return NextResponse.json(chartData);
}
