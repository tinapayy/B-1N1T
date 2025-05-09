// /app/api/analytics/bar-summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const metricFieldMap: Record<string, { min: string; max: string }> = {
  temperature: { min: "minTemp", max: "maxTemp" },
  humidity: { min: "minHumidity", max: "maxHumidity" },
  heatindex: { min: "minHeatIndex", max: "maxHeatIndex" },
};

const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function getTrailing7Days(endDate: Date): { dateStr: string; label: string }[] {
  const result: { dateStr: string; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const label = dayLabels[d.getDay()];
    result.push({ dateStr, label });
  }
  return result;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sensorId = searchParams.get("sensorId");
    const metric = searchParams.get("metric")?.toLowerCase();

    if (!sensorId || !metric || !(metric in metricFieldMap)) {
      return NextResponse.json(
        { error: "Missing or invalid params" },
        { status: 400 }
      );
    }

    const { min: minField, max: maxField } = metricFieldMap[metric];
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const targetDays = getTrailing7Days(today);

    const docIds = targetDays.map(({ dateStr }) => `${sensorId}_${dateStr}`);
    const docRefs = docIds.map((id) =>
      adminDb.collection("analytics_min_max_summary").doc(id)
    );

    const docs = await adminDb.getAll(...docRefs);

    const data = docs.map((snap, index) => {
      const { label, dateStr } = targetDays[index];
      const d = snap.exists ? snap.data() || {} : {};
      const min = d[minField] ?? null;
      const max = d[maxField] ?? null;

      return {
        day: label,
        min,
        delta: min !== null && max !== null ? max - min : 0,
        isToday: dateStr === todayStr,
      };
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("[bar-summary]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
