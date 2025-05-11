// /app/api/dashboard/map-realtime/route.ts
import { NextResponse } from "next/server";
import { adminDb, adminRtdb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await adminRtdb.ref("sensor_readings").once("value");
    const rtdbData = snapshot.val();

    if (!rtdbData) return NextResponse.json({ sensors: [], receivers: [] });

    const sensors: any[] = [];

    for (const sensorId of Object.keys(rtdbData)) {
      const rtdbEntry = rtdbData[sensorId];

      // Firestore metadata from verified_sensors
      const sensorDoc = await adminDb.collection("verified_sensors").doc(sensorId).get();
      if (!sensorDoc.exists) continue;
      const sensorMeta = sensorDoc.data();
      if (!sensorMeta?.latitude || !sensorMeta?.longitude) continue;

      sensors.push({
        type: "sensor",
        sensorId,
        location: sensorMeta.location, // already combined full location
        lat: sensorMeta.latitude,
        lng: sensorMeta.longitude,
        temp: rtdbEntry.t ?? null,
        heatIndex: rtdbEntry.hi ?? null,
      });
    }

    const receiverSnap = await adminDb.collection("verified_receivers").get();
    const receivers = receiverSnap.docs
      .map((doc) => doc.data())
      .filter((r) => r.latitude && r.longitude)
      .map((receiver) => ({
        type: "receiver",
        receiverId: receiver.receiverId,
        location: receiver.location,
        lat: receiver.latitude,
        lng: receiver.longitude,
        name: receiver.name,
      }));

    return NextResponse.json({ sensors, receivers });
  } catch (err) {
    console.error("RTDB map merge error:", err);
    return NextResponse.json({ error: "Failed to fetch map data" }, { status: 500 });
  }
}
