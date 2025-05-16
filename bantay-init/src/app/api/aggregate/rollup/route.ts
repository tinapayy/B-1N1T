// /api/aggregate/rollup/route.ts

// /api/aggregate/rollup/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import {
  eachDayOfInterval,
  startOfDay,
  subDays,
  format,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  parseISO,
} from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");
  const mockDateParam = searchParams.get("mockDate"); // format: YYYY-MM-DD

  if (!sensorId) {
    return NextResponse.json({ error: "Missing sensorId" }, { status: 400 });
  }

  try {
    const targetDate = mockDateParam ? parseISO(mockDateParam) : new Date();
    const start = subDays(startOfDay(targetDate), 6);
    const end = endOfDay(targetDate);

    const days = eachDayOfInterval({ start, end });
    const docIds = days.map((d) => `${sensorId}_${format(d, "yyyy-MM-dd")}`);
    const docRefs = docIds.map((id) =>
      adminDb.collection("analytics_min_max_summary").doc(id)
    );

    const docs = await adminDb.getAll(...docRefs);

    // === Daily writes ===
    const dailyWrites = docs.map((snap, i) => {
      const data = snap.exists ? snap.data() : null;
      if (!data) {
        return adminDb.collection("analytics_daily_summary").doc(docIds[i]).set({}, { merge: true });
      }

      const count = data.count ?? 0;
      return adminDb
        .collection("analytics_daily_summary")
        .doc(docIds[i])
        .set(
          count > 0
            ? {
                sensorId,
                date: Timestamp.fromDate(days[i]),
                avgTemp: data.avgTemp,
                avgHumidity: data.avgHumidity,
                avgHeatIndex: data.avgHeatIndex,
                isPartial: count < 48,
              }
            : {},
          { merge: true }
        );
    });

    // === Weekly rollup (7-day trailing) ===
    const valid = docs.filter((d) => d.exists);
    const total = valid.length;
    const dailyPoints = valid.map((d) => d.data()!).filter(Boolean);

    const avg = (arr: any[], field: string) =>
      arr.reduce((sum, d) => sum + (d?.[field] ?? 0), 0) / total;

    const weeklyDocId = `${sensorId}_${format(start, "yyyy-MM-dd")}_to_${format(targetDate, "yyyy-MM-dd")}`;
    const weeklyWrite = adminDb
      .collection("analytics_weekly_summary")
      .doc(weeklyDocId)
      .set(
        total > 0
          ? {
              sensorId: sensorId,
              dateRange: `${format(start, "yyyy-MM-dd")}_to_${format(targetDate, "yyyy-MM-dd")}`,
              weekStart: Timestamp.fromDate(start),
              avgTemp: avg(dailyPoints, "avgTemp"),
              avgHumidity: avg(dailyPoints, "avgHumidity"),
              avgHeatIndex: avg(dailyPoints, "avgHeatIndex"),
              isPartial: total < 7,
            }
          : {},
        { merge: true }
      );

    // === Monthly rollup ===
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const monthIds = monthDays.map((d) => `${sensorId}_${format(d, "yyyy-MM-dd")}`);
    const monthRefs = monthIds.map((id) =>
      adminDb.collection("analytics_min_max_summary").doc(id)
    );
    const monthDocs = await adminDb.getAll(...monthRefs);
    const monthValid = monthDocs.filter((d) => d.exists);
    const monthPoints = monthValid.map((d) => d.data());
    const monthTotal = monthValid.length;

    const monthlyDocId = `${sensorId}_${format(targetDate, "yyyy-MM")}`;
    const monthlyWrite = adminDb
      .collection("analytics_monthly_summary")
      .doc(monthlyDocId)
      .set(
        monthTotal > 0
          ? {
              sensorId: sensorId,
              isoMonth: format(targetDate, "yyyy-MM"),
              monthStart: Timestamp.fromDate(monthStart),
              avgTemp: avg(monthPoints, "avgTemp"),
              avgHumidity: avg(monthPoints, "avgHumidity"),
              avgHeatIndex: avg(monthPoints, "avgHeatIndex"),
              isPartial: monthTotal < monthDays.length,
            }
          : {},
        { merge: true }
      );

    // === Yearly rollup ===
    const yearStart = startOfYear(targetDate);
    const yearEnd = endOfYear(targetDate);
    const yearMonths = eachMonthOfInterval({ start: yearStart, end: yearEnd });
    const yearMonthIds = yearMonths.map((d) => `${sensorId}_${format(d, "yyyy-MM")}`);
    const yearMonthRefs = yearMonthIds.map((id) =>
      adminDb.collection("analytics_monthly_summary").doc(id)
    );
    const yearDocs = await adminDb.getAll(...yearMonthRefs);
    const yearValid = yearDocs.filter((d) => d.exists);
    const yearPoints = yearValid.map((d) => d.data());
    const yearTotal = yearValid.length;

    const yearlyDocId = `${sensorId}_${format(targetDate, "yyyy")}`;
    const yearlyWrite = adminDb
      .collection("analytics_yearly_summary")
      .doc(yearlyDocId)
      .set(
        yearTotal > 0
          ? {
              sensorId: sensorId,
              isoYear: format(targetDate, "yyyy"),
              yearStart: Timestamp.fromDate(yearStart),
              avgTemp: avg(yearPoints, "avgTemp"),
              avgHumidity: avg(yearPoints, "avgHumidity"),
              avgHeatIndex: avg(yearPoints, "avgHeatIndex"),
              isPartial: yearTotal < yearMonths.length,
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
