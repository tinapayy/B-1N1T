// /api/notifications/unsubscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { token, sensorId } = await req.json();
    if (!token || !sensorId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const ref = adminDb.collection("sensor_subscriptions").doc(sensorId);
    await ref.set(
      { tokens: FieldValue.arrayRemove(token) },
      { merge: true }
    );

    console.log(`[/api/notifications/unsubscribe] Unsubscribed token from sensor ${sensorId}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/notifications/unsubscribe] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}