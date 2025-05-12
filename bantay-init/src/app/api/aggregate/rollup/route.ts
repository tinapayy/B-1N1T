// /api/aggregate/rollup/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import {
  subDays,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
  format,
} from "date-fns";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");
  const timeframe = searchParams.get("timeframe") || "all";

  if (!sensorId) {
    return NextResponse.json({ error: "Missing sensorId" }, { status: 400 });
  }

  try {
    const today = new Date();
    const results: string[] = [];

    if (["week", "all"].includes(timeframe)) {
      const start = subDays(today, 6);
      const days = eachDayOfInterval({ start, end: today });

      const docIds = days.map((d) => `${sensorId}_${format(d, "yyyy-MM-dd")}`);
      const docs = await adminDb.getAll(
        ...docIds.map((id) =>
          adminDb.collection("analytics_min_max_summary").doc(id)
        )
      );

      const valid = docs.filter((d) => d.exists);
      const isPartial = valid.length < days.length;

      const points = valid.map((d) => d.data());
      const totalCount = valid.length;
      const avgTemp =
        points.reduce((sum, p) => sum + (p?.avgTemp ?? 0), 0) / totalCount;
      const avgHumidity =
        points.reduce((sum, p) => sum + (p?.avgHumidity ?? 0), 0) / totalCount;
      const avgHeatIndex =
        points.reduce((sum, p) => sum + (p?.avgHeatIndex ?? 0), 0) / totalCount;

      await adminDb
        .collection("analytics_weekly_summary")
        .doc(`${sensorId}_${format(today, "yyyy-'W'II")}`)
        .set({
          sensorID: sensorId,
          isoWeek: format(today, "yyyy-'W'II"),
          weekStart: Timestamp.fromDate(start),
          avgTemp,
          avgHumidity,
          avgHeatIndex,
          isPartial,
        });

      results.push("weekly");
    }

    if (["month", "all"].includes(timeframe)) {
      const start = startOfMonth(today);
      const end = endOfMonth(today);
      const days = eachDayOfInterval({ start, end });

      const docIds = days.map((d) => `${sensorId}_${format(d, "yyyy-MM-dd")}`);
      const docs = await adminDb.getAll(
        ...docIds.map((id) =>
          adminDb.collection("analytics_min_max_summary").doc(id)
        )
      );

      const valid = docs.filter((d) => d.exists);
      const isPartial = valid.length < days.length;

      const points = valid.map((d) => d.data());
      const totalCount = valid.length;
      const avgTemp =
        points.reduce((sum, p) => sum + (p?.avgTemp ?? 0), 0) / totalCount;
      const avgHumidity =
        points.reduce((sum, p) => sum + (p?.avgHumidity ?? 0), 0) / totalCount;
      const avgHeatIndex =
        points.reduce((sum, p) => sum + (p?.avgHeatIndex ?? 0), 0) / totalCount;

      await adminDb
        .collection("analytics_monthly_summary")
        .doc(`${sensorId}_${format(today, "yyyy-MM")}`)
        .set({
          sensorID: sensorId,
          isoMonth: format(today, "yyyy-MM"),
          monthStart: Timestamp.fromDate(start),
          avgTemp,
          avgHumidity,
          avgHeatIndex,
          isPartial,
        });

      results.push("monthly");
    }

    if (["year", "all"].includes(timeframe)) {
      const start = startOfYear(today);
      const end = endOfYear(today);
      const months = eachMonthOfInterval({ start, end });

      const docIds = months.map(
        (d) => `${sensorId}_${format(d, "yyyy-MM")}`
      );
      const docs = await adminDb.getAll(
        ...docIds.map((id) =>
          adminDb.collection("analytics_monthly_summary").doc(id)
        )
      );

      const valid = docs.filter((d) => d.exists);
      const isPartial = valid.length < months.length;

      const points = valid.map((d) => d.data());
      const totalCount = valid.length;
      const avgTemp =
        points.reduce((sum, p) => sum + (p?.avgTemp ?? 0), 0) / totalCount;
      const avgHumidity =
        points.reduce((sum, p) => sum + (p?.avgHumidity ?? 0), 0) / totalCount;
      const avgHeatIndex =
        points.reduce((sum, p) => sum + (p?.avgHeatIndex ?? 0), 0) / totalCount;

      await adminDb
        .collection("analytics_yearly_summary")
        .doc(`${sensorId}_${format(today, "yyyy")}`)
        .set({
          sensorID: sensorId,
          isoYear: format(today, "yyyy"),
          yearStart: Timestamp.fromDate(start),
          avgTemp,
          avgHumidity,
          avgHeatIndex,
          isPartial,
        });

      results.push("yearly");
    }

    return NextResponse.json({
      status: "rollup complete",
      summaries: results,
    });
  } catch (err) {
    console.error("Rollup Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
