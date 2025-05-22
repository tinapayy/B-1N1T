// /api/receiver/upload/route.ts

import { NextResponse } from "next/server";
import { adminDb, adminRtdb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { DateTime } from "luxon";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sensorId, temperature, humidity, heatIndex, receiverId, __mockTimestamp } = body;

    // Abort entire write if invalid
    if (
      !sensorId ||
      !receiverId ||
      ![temperature, humidity, heatIndex].every((v) => Number.isFinite(v))
    ) {
      return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
    }

    // Verify sensor
    const sensorSnap = await adminDb.collection("verified_sensors").doc(sensorId).get();
    if (!sensorSnap.exists) {
      return NextResponse.json({ error: "Sensor is not verified" }, { status: 403 });
    }

    const sensor = sensorSnap.data();
    if (!sensor?.receiverId || sensor.receiverId !== receiverId) {
      return NextResponse.json({ error: "Sensor not assigned to this receiver" }, { status: 403 });
    }

    // Verify receiver
    const receiverSnap = await adminDb.collection("verified_receivers").doc(receiverId).get();
    if (!receiverSnap.exists) {
      return NextResponse.json({ error: "Receiver is not verified" }, { status: 403 });
    }

    const rawTimestamp = __mockTimestamp || Date.now();
    const timestamp = typeof rawTimestamp === "number" ? rawTimestamp : Date.now();

    // === PH-local datetime parsing ===
    const dtPH = DateTime.fromMillis(timestamp).setZone("Asia/Manila");
    const dateKey = dtPH.toFormat("yyyy-MM-dd");
    const midnightPH = dtPH.startOf("day").toJSDate();

    // === RTDB snapshot ===
    const rtdbWrite = adminRtdb.ref(`/sensor_readings/${sensorId}`).set({
      t: temperature,
      h: humidity,
      hi: heatIndex,
      ts: timestamp,
      r: receiverId,
    });

    // === Peak heat index tracker ===
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

    // === Alerts (if heat index exceeds threshold) ===
    const alertWrite =
      heatIndex >= 32
        ? adminDb.collection("alerts").add({
            sensorId,
            temperature,
            humidity,
            heatIndex,
            receiverId,
            timestamp: Timestamp.fromMillis(timestamp),
            alertCategory:
              heatIndex >= 52
                ? "Extreme Danger"
                : heatIndex >= 41
                ? "Danger"
                : "Extreme Caution",
            message: `High heat index detected: ${heatIndex}`,
          })
        : Promise.resolve();

    // === Daily Min-Max Summary ===
    const minMaxRef = adminDb
      .collection("analytics_min_max_summary")
      .doc(`${sensorId}_${dateKey}`);
    const minMaxSnap = await minMaxRef.get();
    const minMax = minMaxSnap.exists ? minMaxSnap.data() ?? {} : {};

    const minMaxWrite = minMaxRef.set(
      {
        sensorId,
        timestamp: Timestamp.fromMillis(timestamp),
        date: Timestamp.fromDate(midnightPH), // aligned with docId
        avgTemp: ((minMax.sumTemp ?? 0) + temperature) / ((minMax.count ?? 0) + 1),
        avgHumidity: ((minMax.sumHumidity ?? 0) + humidity) / ((minMax.count ?? 0) + 1),
        avgHeatIndex: ((minMax.sumHeatIndex ?? 0) + heatIndex) / ((minMax.count ?? 0) + 1),
        sumTemp: (minMax.sumTemp ?? 0) + temperature,
        sumHumidity: (minMax.sumHumidity ?? 0) + humidity,
        sumHeatIndex: (minMax.sumHeatIndex ?? 0) + heatIndex,
        count: (minMax.count ?? 0) + 1,
        minTemp: Math.min(minMax.minTemp ?? temperature, temperature),
        maxTemp: Math.max(minMax.maxTemp ?? temperature, temperature),
        minHumidity: Math.min(minMax.minHumidity ?? humidity, humidity),
        maxHumidity: Math.max(minMax.maxHumidity ?? humidity, humidity),
        minHeatIndex: Math.min(minMax.minHeatIndex ?? heatIndex, heatIndex),
        maxHeatIndex: Math.max(minMax.maxHeatIndex ?? heatIndex, heatIndex),
      },
      { merge: true }
    );

    await Promise.all([rtdbWrite, peakWrite, alertWrite, minMaxWrite]);

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("/api/receiver/upload error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
