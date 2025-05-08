// api/analytics/compare/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");

  if (!sensorId) {
    return NextResponse.json({ error: "Missing sensorId" }, { status: 400 });
  }

  try {
    const now = new Date(Date.now() + 8 * 60 * 60 * 1000); // UTC+8
    const thisMonthId = `${sensorId}_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthId = `${sensorId}_${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;

    const [thisSnap, lastSnap] = await Promise.all([
      adminDb.collection("analytics_monthly_summary").doc(thisMonthId).get(),
      adminDb.collection("analytics_monthly_summary").doc(lastMonthId).get(),
    ]);

    const thisData = thisSnap.exists ? thisSnap.data() : null;
    const lastData = lastSnap.exists ? lastSnap.data() : null;

    const thisAvg = thisData?.avgHeatIndex ?? null;
    const lastAvg = lastData?.avgHeatIndex ?? null;

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
