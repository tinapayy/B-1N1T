import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sensorId, fcmToken } = await req.json();
    if (!sensorId || !fcmToken) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    await adminDb.collection("sensor_subscriptions").doc(`${sensorId}_${fcmToken}`).set({
      sensorId,
      fcmToken,
      subscriberType: "web",
      isActive: true,
      subscribedAt: Timestamp.now(),
    }, { merge: true });

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("/api/subscriptions/fcm error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
