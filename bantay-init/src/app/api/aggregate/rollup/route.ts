// /api/aggregate/rollup/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfYear,
} from "date-fns";
import { DateTime } from "luxon";

function toPHMidnight(date: Date): Date {
  return DateTime.fromJSDate(date).setZone("Asia/Manila").startOf("day").toJSDate();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");
  const mockDateParam = searchParams.get("mockDate");

  if (!sensorId) {
    return NextResponse.json({ error: "Missing sensorId" }, { status: 400 });
  }

  try {
    const targetDateRaw = mockDateParam ? new Date(mockDateParam) : new Date();
    const targetDate = toPHMidnight(targetDateRaw);
    const start = toPHMidnight(new Date(targetDate.getTime() - 6 * 86400000));
    const end = targetDate;
    const days = eachDayOfInterval({ start, end }).map(toPHMidnight);

    const docIds = days.map((d) => `${sensorId}_${DateTime.fromJSDate(d).toFormat("yyyy-MM-dd")}`);
    const docRefs = docIds.map((id) =>
      adminDb.collection("analytics_min_max_summary").doc(id)
    );

    const docs = await adminDb.getAll(...docRefs);

    const dailyWrites = days.map((day, i) => {
      const docId = `${sensorId}_${DateTime.fromJSDate(day).toFormat("yyyy-MM-dd")}`;
      const snap = docs[i];

      if (!snap?.exists) return Promise.resolve();
      const data = snap.data();
      if (!data || !data.count || data.count === 0) return Promise.resolve();

      return adminDb
        .collection("analytics_daily_summary")
        .doc(docId)
        .set(
          {
            sensorId,
            date: Timestamp.fromDate(day),
            avgTemp: data.avgTemp,
            avgHumidity: data.avgHumidity,
            avgHeatIndex: data.avgHeatIndex,
            isPartial: data.count < 48,
          },
          { merge: true }
        );
    });

    const valid = docs.filter((d) => d.exists && d.data()?.count > 0);
    const dailyPoints = valid.map((d) => d.data()!).filter((d) => d && d.count > 0);
    const avg = (arr: any[], field: string) => {
      const validPoints = arr.filter((d) => d?.[field] != null && d[field] > 0);
      return validPoints.length > 0
        ? validPoints.reduce((sum, d) => sum + (d?.[field] ?? 0), 0) / validPoints.length
        : 0;
    };

    // === WEEKLY
    const weeklyDocId = `${sensorId}_${DateTime.fromJSDate(start).toFormat("yyyy-MM-dd")}_to_${DateTime.fromJSDate(end).toFormat("yyyy-MM-dd")}`;
    const weeklyWrite = adminDb
      .collection("analytics_weekly_summary")
      .doc(weeklyDocId)
      .set(
        dailyPoints.length > 0
          ? {
              sensorId,
              dateRange: `${DateTime.fromJSDate(start).toFormat("yyyy-MM-dd")}_to_${DateTime.fromJSDate(end).toFormat("yyyy-MM-dd")}`,
              weekStart: Timestamp.fromDate(start),
              avgTemp: avg(dailyPoints, "avgTemp"),
              avgHumidity: avg(dailyPoints, "avgHumidity"),
              avgHeatIndex: avg(dailyPoints, "avgHeatIndex"),
              isPartial: dailyPoints.length < 7,
            }
          : {},
        { merge: true }
      );

    // === MONTHLY
    const monthStart = DateTime.fromJSDate(end).setZone("Asia/Manila").startOf("month").toJSDate();
    const monthEnd = toPHMidnight(endOfMonth(end));
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const monthIds = monthDays.map((d) => `${sensorId}_${DateTime.fromJSDate(d).toFormat("yyyy-MM-dd")}`);
    const monthRefs = monthIds.map((id) =>
      adminDb.collection("analytics_min_max_summary").doc(id)
    );
    const monthDocs = await adminDb.getAll(...monthRefs);
    const monthPoints = monthDocs.filter((d) => d.exists && d.data()?.count > 0).map((d) => d.data()!);

    const monthlyDocId = `${sensorId}_${DateTime.fromJSDate(end).toFormat("yyyy-MM")}`;
    const monthlyWrite = adminDb
      .collection("analytics_monthly_summary")
      .doc(monthlyDocId)
      .set(
        monthPoints.length > 0
          ? {
              sensorId,
              isoMonth: DateTime.fromJSDate(end).toFormat("yyyy-MM"),
              monthStart: Timestamp.fromDate(monthStart),
              avgTemp: avg(monthPoints, "avgTemp"),
              avgHumidity: avg(monthPoints, "avgHumidity"),
              avgHeatIndex: avg(monthPoints, "avgHeatIndex"),
              isPartial: monthPoints.length < monthDays.length,
            }
          : {},
        { merge: true }
      );

    // === YEARLY
    const yearStart = DateTime.fromJSDate(end).setZone("Asia/Manila").startOf("year").toJSDate();
    const yearEnd = toPHMidnight(endOfYear(end));
    const yearMonths = Array.from({ length: 12 }, (_, i) =>
      DateTime.fromJSDate(yearStart).plus({ months: i }).toJSDate()
    );
    const yearMonthIds = yearMonths.map((d) =>
      `${sensorId}_${DateTime.fromJSDate(d).toFormat("yyyy-MM")}`
    );
    const yearMonthRefs = yearMonthIds.map((id) =>
      adminDb.collection("analytics_monthly_summary").doc(id)
    );
    const yearDocs = await adminDb.getAll(...yearMonthRefs);
    const yearPoints = yearDocs.filter((d) => d.exists && d.data()?.avgTemp != null).map((d) => d.data()!);

    const yearlyDocId = `${sensorId}_${DateTime.fromJSDate(end).toFormat("yyyy")}`;
    const yearlyWrite = adminDb
      .collection("analytics_yearly_summary")
      .doc(yearlyDocId)
      .set(
        yearPoints.length > 0
          ? {
              sensorId,
              isoYear: DateTime.fromJSDate(end).toFormat("yyyy"),
              yearStart: Timestamp.fromDate(yearStart),
              avgTemp: avg(yearPoints, "avgTemp"),
              avgHumidity: avg(yearPoints, "avgHumidity"),
              avgHeatIndex: avg(yearPoints, "avgHeatIndex"),
              isPartial: yearPoints.length < 12,
            }
          : {},
        { merge: true }
      );

    await Promise.all([
      ...dailyWrites,
      weeklyWrite,
      monthlyWrite,
      yearlyWrite,
    ]);

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("rollup-error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
