// /api/receiver/upload/route.ts
import { NextResponse } from "next/server";
import { adminDb, adminRtdb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { DateTime } from "luxon";

// Utility to chunk arrays
const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sensorId, temperature, humidity, heatIndex, receiverId, __mockTimestamp } = body;

    if (
      !sensorId ||
      !receiverId ||
      ![temperature, humidity, heatIndex].every((v) => Number.isFinite(v))
    ) {
      console.error("[/api/receiver/upload] Missing or invalid parameters:", body);
      return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
    }

    // === Validate sensor ===
    const sensorSnap = await adminDb.collection("verified_sensors").doc(sensorId).get();
    if (!sensorSnap.exists) {
      console.error("[/api/receiver/upload] Sensor not found:", sensorId);
      return NextResponse.json({ error: "Sensor not verified" }, { status: 403 });
    }

    const sensor = sensorSnap.data() || {};
    console.log("[/api/receiver/upload] SENSOR SNAPSHOT:", JSON.stringify(sensor, null, 2));

    const sensorName = sensor.name || sensor.sensorName || sensorId;
    const sensorLocation = sensor.location || "Unknown";

    if (sensor.receiverId !== receiverId) {
      console.error("[/api/receiver/upload] Sensor not assigned to receiver:", { sensorId, receiverId });
      return NextResponse.json({ error: "Sensor not assigned to this receiver" }, { status: 403 });
    }

    // === Validate receiver ===
    const receiverSnap = await adminDb.collection("verified_receivers").doc(receiverId).get();
    if (!receiverSnap.exists) {
      console.error("[/api/receiver/upload] Receiver not found:", receiverId);
      return NextResponse.json({ error: "Receiver not verified" }, { status: 403 });
    }

    const timestamp = typeof __mockTimestamp === "number" ? __mockTimestamp : Date.now();
    const dtPH = DateTime.fromMillis(timestamp).setZone("Asia/Manila");
    const dateKey = dtPH.toFormat("yyyy-MM-dd");
    const midnightPH = dtPH.startOf("day").toJSDate();

    // === Realtime DB snapshot ===
    const rtdbWrite = adminRtdb.ref(`/sensor_readings/${sensorId}`).set({
      t: temperature,
      h: humidity,
      hi: heatIndex,
      ts: timestamp,
      r: receiverId,
    });

    // === Peak tracker ===
    const peakRef = adminDb.collection("analytics_peak_summary").doc(sensorId);
    const peakSnap = await peakRef.get();
    const prevPeak = peakSnap.exists ? peakSnap.data()?.peakHeatIndex ?? 0 : 0;

    const peakWrite =
      heatIndex > prevPeak
        ? peakRef.set({
            sensorId,
            peakHeatIndex: heatIndex,
            timestamp: Timestamp.fromMillis(timestamp),
          })
        : Promise.resolve();

    // === Alerts + FCM ===
    const fcmWrite =
      heatIndex >= 32
        ? (async () => {
            const alertCategory =
              heatIndex >= 52
                ? "Extreme Danger"
                : heatIndex >= 41
                ? "Danger"
                : "Extreme Caution";

            await adminDb.collection("alerts").add({
              sensorId,
              sensorName: sensor.name ?? sensorId,
              location: sensor.location ?? "Unknown",
              temperature,
              humidity,
              heatIndex,
              receiverId,
              timestamp: Timestamp.fromMillis(timestamp),
              alertCategory,
              message: `Heat index reached ${heatIndex}°C at ${sensor.location ?? "Unknown"}`,
            });

            const subSnap = await adminDb
              .collection("sensor_subscriptions")
              .where("sensorId", "==", sensorId)
              .where("isActive", "==", true)
              .get();

            const tokens = subSnap.docs
              .map((doc) => doc.data().tokens || [])
              .flat()
              .filter(Boolean);
            if (!tokens.length) return;

            const messaging = (await import("firebase-admin/messaging")).getMessaging();
            const payload = {
              notification: {
                title: `${alertCategory} • ${sensorLocation}`,
                body: `Sensor ${sensorName} reported ${heatIndex}°C`,
              },
            };

            const batches = chunk(tokens, 400);
            for (const batch of batches) {
              try {
                await messaging.sendEachForMulticast({ tokens: batch, ...payload });
                console.log(`[/api/receiver/upload] Sent FCM to ${batch.length} tokens for sensor ${sensorId}`);
              } catch (err) {
                console.error(`[/api/receiver/upload] FCM send failed for sensor ${sensorId}:`, err);
              }
            }
          })()
        : Promise.resolve();

    // === Daily min/max rollup ===
    const minMaxRef = adminDb.collection("analytics_min_max_summary").doc(`${sensorId}_${dateKey}`);
    const minMaxSnap = await minMaxRef.get();
    const prev = minMaxSnap.exists ? minMaxSnap.data() ?? {} : {};

    const minMaxWrite = minMaxRef.set(
      {
        sensorId,
        timestamp: Timestamp.fromMillis(timestamp),
        date: Timestamp.fromDate(midnightPH),
        avgTemp: ((prev.sumTemp ?? 0) + temperature) / ((prev.count ?? 0) + 1),
        avgHumidity: ((prev.sumHumidity ?? 0) + humidity) / ((prev.count ?? 0) + 1),
        avgHeatIndex: ((prev.sumHeatIndex ?? 0) + heatIndex) / ((prev.count ?? 0) + 1),
        sumTemp: (prev.sumTemp ?? 0) + temperature,
        sumHumidity: (prev.sumHumidity ?? 0) + humidity,
        sumHeatIndex: (prev.sumHeatIndex ?? 0) + heatIndex,
        count: (prev.count ?? 0) + 1,
        minTemp: Math.min(prev.minTemp ?? temperature, temperature),
        maxTemp: Math.max(prev.maxTemp ?? temperature, temperature),
        minHumidity: Math.min(prev.minHumidity ?? humidity, humidity),
        maxHumidity: Math.max(prev.maxHumidity ?? humidity, humidity),
        minHeatIndex: Math.min(prev.minHeatIndex ?? heatIndex, heatIndex),
        maxHeatIndex: Math.max(prev.maxHeatIndex ?? heatIndex, heatIndex),
      },
      { merge: true }
    );

    await Promise.all([rtdbWrite, peakWrite, minMaxWrite, fcmWrite]);
    console.log(`[/api/receiver/upload] Processed upload for sensor ${sensorId}`);
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[/api/receiver/upload] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}