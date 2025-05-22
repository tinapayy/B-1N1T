// /api/notifications/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { token, sensorId } = await req.json();
    if (!token || !sensorId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Verify sensor exists
    const sensorSnap = await adminDb.collection("verified_sensors").doc(sensorId).get();
    if (!sensorSnap.exists) {
      console.error("[/api/notifications/subscribe] Sensor not found:", sensorId);
      return NextResponse.json({ error: "Sensor not found" }, { status: 404 });
    }

    const ref = adminDb.collection("sensor_subscriptions").doc(sensorId);
    await ref.set(
      {
        sensorId,
        tokens: FieldValue.arrayUnion(token),
        subscriberType: "web",
        isActive: true,
        subscribedAt: Timestamp.now(),
      },
      { merge: true }
    );

    console.log(`[/api/notifications/subscribe] Subscribed token to sensor ${sensorId}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/notifications/subscribe] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}