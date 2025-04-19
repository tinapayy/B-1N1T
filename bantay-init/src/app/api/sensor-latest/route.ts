// File: src/app/api/sensor-latest/route.ts

import { NextRequest } from "next/server";
import { adminFirestore, adminRTDB } from "@/lib/firebase/firebase-admin";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sensorID, temperature, humidity, heatIndex, timestamp } = body;

  if (!sensorID || !timestamp) {
    return new Response(JSON.stringify({ error: "Missing sensorID or timestamp" }), { status: 400 });
  }

  const alertLevel = getAlertLevel(heatIndex);
  const date = new Date(timestamp).toISOString().split("T")[0]; // e.g., "2025-04-18"

  try {
    // ✅ 1. Update RTDB
    await adminRTDB.ref(`sensor_latest/${sensorID}`).set({
      lastTemperature: temperature,
      lastHumidity: humidity,
      lastHeatIndex: heatIndex,
      lastReadingTimestamp: timestamp,
      lastAlertLevel: alertLevel,
    });

    // ✅ 2. Add to Firestore `sensor_readings`
    await adminFirestore.collection("sensor_readings").add({
      sensorID,
      temperature,
      humidity,
      heatIndex,
      timestamp,
      alertLevel,
      anomaly: false,
    });

    // ✅ 3. Trigger alert logic if dangerous
    if (["danger", "extreme danger"].includes(alertLevel)) {
      await adminFirestore.collection("alerts").add({
        sensorID,
        timestamp,
        alertCategory: alertLevel,
        heatIndexValue: heatIndex,
        message: `Heat Index ${heatIndex}°C detected at ${sensorID} (${alertLevel.toUpperCase()})`,
      });
    }

    // ✅ 4. Check if new daily max → update `analytics_daily_highs`
    const dailyRef = adminFirestore
      .collection("analytics_daily_highs")
      .where("sensorID", "==", sensorID)
      .where("date", "==", date);

    const dailySnap = await dailyRef.get();

    if (dailySnap.empty) {
      // First entry today
      await adminFirestore.collection("analytics_daily_highs").add({
        sensorID,
        date,
        highestTemp: temperature,
        highestHumidity: humidity,
        highestHeatIndex: heatIndex,
        timestamp,
      });
    } else {
      const doc = dailySnap.docs[0];
      const data = doc.data();
      if (heatIndex > data.highestHeatIndex) {
        await doc.ref.update({
          highestTemp: Math.max(temperature, data.highestTemp),
          highestHumidity: Math.max(humidity, data.highestHumidity),
          highestHeatIndex: heatIndex,
          timestamp,
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

function getAlertLevel(hi: number): string {
  if (hi < 27.0) return "safe";
  if (hi <= 32.0) return "caution";
  if (hi <= 41.0) return "extreme caution";
  if (hi <= 54.0) return "danger";
  return "extreme danger";
}
