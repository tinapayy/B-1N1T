import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");

  if (!sensorId) {
    return NextResponse.json({ error: "Missing sensorId" }, { status: 400 });
  }

  try {
    // Shift to UTC+8 to align with PH time
    const now = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const summaries = await adminDb
      .collection("analytics_weekly_summary")
      .where("sensorID", "==", sensorId)
      .orderBy("weekStart", "desc")
      .limit(12)
      .get();

    let thisMonthTotal = 0;
    let thisMonthCount = 0;
    let lastMonthTotal = 0;
    let lastMonthCount = 0;

    summaries.forEach(doc => {
      const d = doc.data();
      const date = d.weekStart?.toDate?.();
      if (!date || typeof d.avgHeatIndex !== "number") return;

      const shifted = new Date(date.getTime() + 8 * 60 * 60 * 1000); // UTC+8 shift

      if (shifted >= startOfThisMonth) {
        thisMonthTotal += d.avgHeatIndex;
        thisMonthCount++;
      } else if (shifted >= startOfLastMonth && shifted < startOfThisMonth) {
        lastMonthTotal += d.avgHeatIndex;
        lastMonthCount++;
      }
    });

    const thisAvg = thisMonthCount ? thisMonthTotal / thisMonthCount : null;
    const lastAvg = lastMonthCount ? lastMonthTotal / lastMonthCount : null;

    const delta =
      thisAvg != null && lastAvg != null
        ? parseFloat((thisAvg - lastAvg).toFixed(1))
        : null;

    return NextResponse.json({
      changeSinceLastMonth: {
        delta,
        thisAvg,
        lastAvg,
      },
    });
  } catch (err) {
    console.error("compare error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
