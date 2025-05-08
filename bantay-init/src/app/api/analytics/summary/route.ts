// api/analytics/summary/route.ts

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import {
  subDays,
  subMonths,
  subYears,
  startOfDay,
  startOfMonth,
  startOfYear,
} from "date-fns";

const COLLECTION_MAP: Record<"week" | "month" | "year", string> = {
  week: "analytics_weekly_summary",
  month: "analytics_monthly_summary",
  year: "analytics_yearly_summary",
};

const DATE_FIELD_MAP: Record<"week" | "month" | "year", string> = {
  week: "weekStart",
  month: "monthStart",
  year: "yearStart",
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sensorId = searchParams.get("sensorId");
    const timeframeRaw = searchParams.get("timeframe")?.toLowerCase();
    const timeframe: "week" | "month" | "year" =
      timeframeRaw === "month"
        ? "month"
        : timeframeRaw === "year"
        ? "year"
        : "week";

    if (!sensorId || typeof sensorId !== "string") {
      return NextResponse.json({ error: "Missing sensorId" }, { status: 400 });
    }

    const collection = COLLECTION_MAP[timeframe];
    const dateField = DATE_FIELD_MAP[timeframe];

    const now = new Date();
    let startDate: Date;
    let limit: number;

    switch (timeframe) {
      case "week":
        startDate = subDays(startOfDay(now), 6);
        limit = 7;
        break;
      case "month":
        startDate = subMonths(startOfMonth(now), 11);
        limit = 12;
        break;
      case "year":
        startDate = startOfYear(subYears(now, 3));
        limit = 4;
        break;
    }

    const snapshot = await adminDb
      .collection(collection)
      .where("sensorID", "==", sensorId)
      .where(dateField, ">=", startDate)
      .orderBy(dateField, "asc")
      .limit(limit)
      .get();

    const results = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        const rawTimestamp = data[dateField];
        const dateObj = rawTimestamp?.toDate?.() ?? null;

        if (!dateObj) {
          console.warn(`[SKIP] Invalid timestamp in ${doc.id}`);
          return null;
        }

        const localDate = new Date(dateObj.getTime() + 8 * 60 * 60 * 1000); // UTC+8

        return {
          timestamp: localDate.toISOString().slice(0, 10),
          avgTemp: data.avgTemp ?? null,
          avgHeatIndex: data.avgHeatIndex ?? null,
          maxTemp: data.maxTemp ?? null,
          maxHeatIndex: data.maxHeatIndex ?? null,
          alertCount: data.alertCount ?? 0,
          isPartial: typeof data.isPartial === "boolean" ? data.isPartial : false,
        };
      })
      .filter((entry) => entry !== null);

    return NextResponse.json(results);
  } catch (err: any) {
    console.error("Error in /api/analytics/summary:", err.message, err.stack);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
