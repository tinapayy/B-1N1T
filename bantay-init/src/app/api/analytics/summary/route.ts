// api/analytics/summary/route.ts

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { format } from "date-fns";
import { DateTime } from "luxon";

const COLLECTION_MAP: Record<"week" | "month" | "year", string> = {
  week: "analytics_daily_summary",
  month: "analytics_monthly_summary",
  year: "analytics_yearly_summary",
};

const DATE_FIELD_MAP: Record<"week" | "month" | "year", string> = {
  week: "date",
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

    if (!sensorId) {
      return NextResponse.json({ error: "Missing sensorId" }, { status: 400 });
    }

    const collection = COLLECTION_MAP[timeframe];
    const dateField = DATE_FIELD_MAP[timeframe];

    // === PH-local date range calculation ===
    const nowPH = DateTime.local().setZone("Asia/Manila").startOf("day");
    let startDate: DateTime;
    let endDate: DateTime;
    let limit: number;

    switch (timeframe) {
      case "week":
        startDate = nowPH.minus({ days: 6 });
        endDate = nowPH;
        limit = 7;
        break;
      case "month":
        startDate = nowPH.minus({ months: 11 }).startOf("month");
        endDate = nowPH.endOf("month");
        limit = 12;
        break;
      case "year":
        startDate = nowPH.startOf("year");
        endDate = nowPH.endOf("year");
        limit = 1;
        break;
    }

    console.log(
      `Querying ${collection} for ${sensorId} from ${startDate.toISO()} to ${endDate.toISO()}`
    );

    const snapshot = await adminDb
      .collection(collection)
      .where("sensorId", "==", sensorId)
      .where(dateField, ">=", startDate.toJSDate())
      .where(dateField, "<=", endDate.toJSDate())
      .orderBy(dateField, "desc")
      .limit(limit)
      .get();

    const results = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        const rawTimestamp = data[dateField];
        if (!rawTimestamp?.toDate) return null;

        const phDate = DateTime.fromJSDate(rawTimestamp.toDate()).setZone("Asia/Manila").startOf("day");
        return {
          timestamp: phDate.toFormat("yyyy-MM-dd"),
          avgTemp: data.avgTemp ?? null,
          avgHumidity: data.avgHumidity ?? null,
          avgHeatIndex: data.avgHeatIndex ?? null,
          isPartial: typeof data.isPartial === "boolean" ? data.isPartial : false,
        };
      })
      .filter((r) => r !== null);

    return NextResponse.json(results);
  } catch (err: any) {
    console.error("Error in /api/analytics/summary:", err.message, err.stack);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
