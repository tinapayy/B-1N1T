import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { DateTime } from "luxon";

const SENSOR_ID = "SENSOR_002";
const ZONE = "Asia/Manila";

function generateMockSummary(date: DateTime) {
  const baseTemp = 28 + Math.random() * 3;
  const baseHumidity = 40 + Math.random() * 10;
  const heatIndex = baseTemp + (Math.random() * 4);
  return {
    avgTemp: Number((baseTemp).toFixed(2)),
    avgHumidity: Number((baseHumidity).toFixed(2)),
    avgHeatIndex: Number((heatIndex).toFixed(2)),
    minTemp: Number((baseTemp - 1.5).toFixed(2)),
    maxTemp: Number((baseTemp + 1.5).toFixed(2)),
    minHumidity: Number((baseHumidity - 5).toFixed(2)),
    maxHumidity: Number((baseHumidity + 5).toFixed(2)),
    minHeatIndex: Number((heatIndex - 2).toFixed(2)),
    maxHeatIndex: Number((heatIndex + 2).toFixed(2)),
    sumTemp: baseTemp * 48,
    sumHumidity: baseHumidity * 48,
    sumHeatIndex: heatIndex * 48,
    count: 48,
    sensorId: SENSOR_ID,
    date: Timestamp.fromDate(date.startOf("day").toJSDate()),
    timestamp: Timestamp.fromDate(date.set({ hour: 12 }).toJSDate()),
  };
}

async function backfillDaily() {
  const mayDays = [19, 21]; // missing
  for (const day of mayDays) {
    const d = DateTime.fromObject({ year: 2025, month: 5, day }, { zone: ZONE });
    const id = `${SENSOR_ID}_${d.toFormat("yyyy-MM-dd")}`;
    const data = generateMockSummary(d);
    await adminDb.collection("analytics_min_max_summary").doc(id).set(data);
    await adminDb.collection("analytics_daily_summary").doc(id).set(data);
  }
}

async function backfillMonthly() {
  const now = DateTime.local().setZone(ZONE);
  for (let i = 0; i < 12; i++) {
    const month = now.minus({ months: i }).startOf("month");
    const id = `${SENSOR_ID}_${month.toFormat("yyyy-MM")}`;
    const data = {
      sensorId: SENSOR_ID,
      isoMonth: month.toFormat("yyyy-MM"),
      monthStart: Timestamp.fromDate(month.toJSDate()),
      avgTemp: 28 + Math.random() * 2,
      avgHumidity: 45 + Math.random() * 5,
      avgHeatIndex: 32 + Math.random() * 2,
      isPartial: false,
    };
    await adminDb.collection("analytics_monthly_summary").doc(id).set(data);
  }
}

async function backfillYearly() {
  for (let year = 2022; year <= 2025; year++) {
    const yearStart = DateTime.fromObject({ year, month: 1, day: 1 }, { zone: ZONE });
    const id = `${SENSOR_ID}_${year}`;
    const data = {
      sensorId: SENSOR_ID,
      isoYear: year.toString(),
      yearStart: Timestamp.fromDate(yearStart.toJSDate()),
      avgTemp: 28 + Math.random() * 1.5,
      avgHumidity: 44 + Math.random() * 4,
      avgHeatIndex: 33 + Math.random() * 2,
      isPartial: false,
    };
    await adminDb.collection("analytics_yearly_summary").doc(id).set(data);
  }
}

export async function POST() {
  try {
    await backfillDaily();
    await backfillMonthly();
    await backfillYearly();
    return NextResponse.json({ status: "success", message: "Backfill complete." });
  } catch (err) {
    console.error("Backfill failed:", err);
    return NextResponse.json({ error: "Backfill error" }, { status: 500 });
  }
}
