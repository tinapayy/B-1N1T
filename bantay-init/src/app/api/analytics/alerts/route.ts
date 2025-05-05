import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");
  const range = searchParams.get("range") || "month"; // fallback to month

  if (!sensorId) {
    return NextResponse.json({ error: "Missing sensorId parameter" }, { status: 400 });
  }

  // === TIME RANGE HANDLING ===
  const now = new Date();
  let start: Date;

  switch (range) {
    case "today":
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      break;
    case "week":
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      break;
    case "month":
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  const startTimestamp = Timestamp.fromDate(start);

  try {
    const snapshot = await adminDb
      .collection("alerts")
      .where("sensorId", "==", sensorId)
      .where("timestamp", ">=", startTimestamp)
      .orderBy("timestamp", "desc")
      .get();

    const alerts = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        sensorId: d.sensorId,
        alertType: d.alertType,
        heatIndex: d.heatIndex,
        timestamp: d.timestamp.toDate().toISOString(),
      };
    });

    return NextResponse.json({
      alertCount: alerts.length,
      alerts,
    });
  } catch (err) {
    console.error("Failed to fetch alerts:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
