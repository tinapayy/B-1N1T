// /api/notifications/subscribed-sensors/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Missing FCM token" }, { status: 400 });
    }

    const type = req.nextUrl.searchParams.get("type") || "alerts";
    console.log(`[/api/notifications/subscribed-sensors] Request type: ${type}`);

    // Find subscriptions for this token
    const querySnap = await adminDb
      .collection("sensor_subscriptions")
      .where("tokens", "array-contains", token)
      .where("isActive", "==", true)
      .get();

    const sensorIds = querySnap.docs.map((doc) => doc.data().sensorId);

    if (type === "sensorIds") {
      console.log(`[/api/notifications/subscribed-sensors] Fetched ${sensorIds.length} sensor IDs for token`);
      return NextResponse.json({ sensorIds });
    }

    // Default: return alerts
    if (sensorIds.length === 0) {
      console.log(`[/api/notifications/subscribed-sensors] No subscriptions found for token`);
      return NextResponse.json({ alerts: [] });
    }

    // Fetch alerts for subscribed sensors
    const alertsQuery = await adminDb
      .collection("alerts")
      .where("sensorId", "in", sensorIds.slice(0, 10)) // Firestore max 10 in `in` queries
      .orderBy("timestamp", "desc")
      .limit(30)
      .get();

    const alerts = alertsQuery.docs.map((doc) => ({
      ...doc.data(),
      sensorName: doc.data().sensorName || doc.data().sensorId,
      location: doc.data().location || "Unknown location",
    }));

    console.log(`[/api/notifications/subscribed-sensors] Fetched ${alerts.length} alerts for token`);
    return NextResponse.json({ alerts });
  } catch (err) {
    console.error("[/api/notifications/subscribed-sensors] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}