// /api/analytics/bar-summary/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { DateTime } from "luxon";

const metricFieldMap: Record<string, { min: string; max: string }> = {
  temperature: { min: "minTemp", max: "maxTemp" },
  humidity: { min: "minHumidity", max: "maxHumidity" },
  heatindex: { min: "minHeatIndex", max: "maxHeatIndex" },
};

const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function getTrailing7PHDays(): { dateStr: string; label: string; isToday: boolean }[] {
  const now = DateTime.local().setZone("Asia/Manila").startOf("day");
  const result: { dateStr: string; label: string; isToday: boolean }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = now.minus({ days: i });
    result.push({
      dateStr: d.toFormat("yyyy-MM-dd"),
      label: dayLabels[d.weekday % 7],
      isToday: i === 0,
    });
  }

  return result;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sensorId = searchParams.get("sensorId");
    const metric = searchParams.get("metric")?.toLowerCase();

    if (!sensorId || !metric || !(metric in metricFieldMap)) {
      return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
    }

    const { min: minField, max: maxField } = metricFieldMap[metric];
    const targetDays = getTrailing7PHDays();
    const docIds = targetDays.map(({ dateStr }) => `${sensorId}_${dateStr}`);
    const docRefs = docIds.map((id) =>
      adminDb.collection("analytics_min_max_summary").doc(id)
    );

    const docs = await adminDb.getAll(...docRefs);

    const data = docs.map((snap, index) => {
      const { label, dateStr, isToday } = targetDays[index];
      const d = snap.exists ? snap.data() || {} : {};
      const min = d[minField] ?? null;
      const max = d[maxField] ?? null;

      return {
        day: label,
        min,
        delta:
          typeof min === "number" && typeof max === "number"
            ? max - min
            : 0,
        isToday,
      };
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("[bar-summary]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
