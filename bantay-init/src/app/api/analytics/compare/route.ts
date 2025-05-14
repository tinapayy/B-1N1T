// api/analytics/compare/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import {
  format,
  subMonths,
  subYears,
  startOfMonth,
  startOfYear
} from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sensorId = searchParams.get("sensorId");
    const timeframe = searchParams.get("timeframe")?.toLowerCase() || "month";

    if (!sensorId || !["month", "year"].includes(timeframe)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const now = new Date();
    let collection: string;
    let currId: string;
    let prevId: string;

    if (timeframe === "month") {
      collection = "analytics_monthly_summary";
      currId = `${sensorId}_${format(now, "yyyy-MM")}`;
      prevId = `${sensorId}_${format(subMonths(now, 1), "yyyy-MM")}`;
    } else {
      collection = "analytics_yearly_summary";
      currId = `${sensorId}_${format(now, "yyyy")}`;
      prevId = `${sensorId}_${format(subYears(now, 1), "yyyy")}`;
    }

    const [currSnap, prevSnap] = await Promise.all([
      adminDb.collection(collection).doc(currId).get(),
      adminDb.collection(collection).doc(prevId).get()
    ]);

    if (!currSnap.exists || !prevSnap.exists) {
      return NextResponse.json({ error: "Missing summary data" }, { status: 404 });
    }

    const curr = currSnap.data() || {};
    const prev = prevSnap.data() || {};

    const delta = (currVal: number, prevVal: number) =>
      typeof currVal === "number" && typeof prevVal === "number"
        ? currVal - prevVal
        : null;

    return NextResponse.json({
      current: {
        avgTemp: curr.avgTemp ?? null,
        avgHumidity: curr.avgHumidity ?? null,
        avgHeatIndex: curr.avgHeatIndex ?? null
      },
      previous: {
        avgTemp: prev.avgTemp ?? null,
        avgHumidity: prev.avgHumidity ?? null,
        avgHeatIndex: prev.avgHeatIndex ?? null
      },
      deltas: {
        avgTemp: delta(curr.avgTemp, prev.avgTemp),
        avgHumidity: delta(curr.avgHumidity, prev.avgHumidity),
        avgHeatIndex: delta(curr.avgHeatIndex, prev.avgHeatIndex)
      }
    });
  } catch (err) {
    console.error("[compare]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
