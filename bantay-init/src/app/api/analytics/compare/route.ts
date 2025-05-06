import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");

  if (!sensorId) {
    return NextResponse.json({ error: "Missing sensorId" }, { status: 400 });
  }

  try {
    const now = new Date();
    const currentMonthId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    const previousMonthId = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;

    const [thisDoc, lastDoc] = await Promise.all([
      adminDb.collection("analytics_monthly_summary").doc(`${sensorId}_${currentMonthId}`).get(),
      adminDb.collection("analytics_monthly_summary").doc(`${sensorId}_${previousMonthId}`).get()
    ]);

    const thisAvg = thisDoc.exists ? thisDoc.data()?.averageHeatIndex ?? null : null;
    const lastAvg = lastDoc.exists ? lastDoc.data()?.averageHeatIndex ?? null : null;

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
