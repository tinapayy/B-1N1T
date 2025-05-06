// /api/receiver/upload/route.ts

import { NextResponse } from "next/server";
import { adminDb, adminRtdb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

function getTodayKey(sensorId: string): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${sensorId}_${yyyy}-${mm}-${dd}`;
}

function getTodayTimestamp(): Timestamp {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return Timestamp.fromDate(date);
}

function getISOWeekId(date: Date): string {
  const d = new Date(date.getTime());
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sensorId, temperature, humidity, heatIndex, receiverId } = body;

    if (!sensorId || typeof sensorId !== "string") {
      return NextResponse.json({ error: "Missing or invalid sensorId" }, { status: 400 });
    }

    const sensorDoc = await adminDb.collection("verified_sensors").doc(sensorId).get();
    if (!sensorDoc.exists) {
      return NextResponse.json({ error: "Invalid sensor ID" }, { status: 403 });
    }

    const timestamp = Date.now();
    const now = new Date();

    const summaryId = getTodayKey(sensorId);
    const summaryRef = adminDb.collection("summaries").doc(summaryId);

    const response = NextResponse.json({ success: true });

    const isoWeek = getISOWeekId(now);
    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDate() - now.getUTCDay() + 1);
    weekStart.setUTCHours(0, 0, 0, 0);

    const isoMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const isoYear = `${now.getFullYear()}`;

    const weeklyRef = adminDb.collection("analytics_weekly_summary").doc(`${sensorId}_${isoWeek}`);
    const monthlyRef = adminDb.collection("analytics_monthly_summary").doc(`${sensorId}_${isoMonth}`);
    const yearlyRef = adminDb.collection("analytics_yearly_summary").doc(`${sensorId}_${isoYear}`);

    const [weeklySnap, monthlySnap, yearlySnap] = await Promise.all([
      weeklyRef.get(),
      monthlyRef.get(),
      yearlyRef.get()
    ]);

    const weeklyData = weeklySnap.exists ? weeklySnap.data() ?? {} : {};
    const monthlyData = monthlySnap.exists ? monthlySnap.data() ?? {} : {};
    const yearlyData = yearlySnap.exists ? yearlySnap.data() ?? {} : {};

    const writeSummary = (ref: any, existing: any, count: number, scope: any) =>
      ref.set(
        {
          sensorID: sensorId,
          ...scope,
          sampleCount: count,
          minTemp: Math.min(existing.minTemp ?? temperature, temperature),
          maxTemp: Math.max(existing.maxTemp ?? temperature, temperature),
          minHumidity: Math.min(existing.minHumidity ?? humidity, humidity),
          maxHumidity: Math.max(existing.maxHumidity ?? humidity, humidity),
          minHeatIndex: Math.min(existing.minHeatIndex ?? heatIndex, heatIndex),
          maxHeatIndex: Math.max(existing.maxHeatIndex ?? heatIndex, heatIndex),
          totalHumidity: (existing.totalHumidity || 0) + humidity,
          averageHumidity: parseFloat(
            (((existing.totalHumidity || 0) + humidity) / count).toFixed(2)
          ),
          totalTemp: (existing.totalTemp || 0) + temperature,
          averageTemp: parseFloat(
            (((existing.totalTemp || 0) + temperature) / count).toFixed(2)
          ),
          totalHeatIndex: (existing.totalHeatIndex || 0) + heatIndex,
          averageHeatIndex: parseFloat(
            (((existing.totalHeatIndex || 0) + heatIndex) / count).toFixed(2)
          ),
        },
        { merge: true }
      );

    const alertWrite =
      heatIndex >= 32
        ? adminDb.collection("alerts").add({
            sensorId,
            temperature,
            humidity,
            heatIndex,
            alertType:
              heatIndex >= 52
                ? "Extreme Danger"
                : heatIndex >= 41
                ? "Danger"
                : "Extreme Caution",
            timestamp: Timestamp.fromMillis(timestamp),
            message: `High heat index detected: ${heatIndex}`,
            receiverId: receiverId || null,
          })
        : Promise.resolve();

    const rtdbWrite = adminRtdb.ref(`/sensor_readings/${sensorId}`).set({
      t: temperature,
      h: humidity,
      hi: heatIndex,
      ts: timestamp,
      r: receiverId || null,
    });

    const summarySnap = await summaryRef.get();
    const existing = summarySnap.exists ? summarySnap.data() ?? {} : {};
    const newCount = (existing.count || 0) + 1;

    const summaryWrite = summaryRef.set(
      {
        sensorId,
        date: getTodayTimestamp(),
        count: newCount,
        avgTemp:
          ((existing.avgTemp || 0) * (newCount - 1) + temperature) / newCount,
        avgHumidity:
          ((existing.avgHumidity || 0) * (newCount - 1) + humidity) / newCount,
        avgHeatIndex:
          ((existing.avgHeatIndex || 0) * (newCount - 1) + heatIndex) / newCount,
        maxTemp: Math.max(existing.maxTemp ?? temperature, temperature),
        minTemp: Math.min(existing.minTemp ?? temperature, temperature),
        maxHumidity: Math.max(existing.maxHumidity ?? humidity, humidity),
        minHumidity: Math.min(existing.minHumidity ?? humidity, humidity),
        maxHeatIndex: Math.max(existing.maxHeatIndex ?? heatIndex, heatIndex),
        minHeatIndex: Math.min(existing.minHeatIndex ?? heatIndex, heatIndex),
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    const dailyHighsRef = adminDb.collection("analytics_daily_highs").doc(getTodayKey(sensorId));
    const dailyHighsSnap = await dailyHighsRef.get();
    const dailyExisting = dailyHighsSnap.exists ? dailyHighsSnap.data() ?? {} : {};

    const dailyHighsWrite = dailyHighsRef.set(
      {
        sensorId,
        timestamp: Timestamp.fromMillis(timestamp),
        highestTemp: Math.max(dailyExisting.highestTemp ?? temperature, temperature),
        highestHumidity: Math.max(dailyExisting.highestHumidity ?? humidity, humidity),
        highestHeatIndex: Math.max(dailyExisting.highestHeatIndex ?? heatIndex, heatIndex),
      },
      { merge: true }
    );

    const latestSnap = await adminDb.collection("sensor_latest").doc(sensorId).get();
    const latestExisting = latestSnap.exists ? latestSnap.data() ?? {} : {};

    const latestWrite = adminDb
      .collection("sensor_latest")
      .doc(sensorId)
      .set(
        {
          lastTemperature: temperature,
          lastHumidity: humidity,
          lastHeatIndex: heatIndex,
          lastReadingTimestamp: Timestamp.fromMillis(timestamp),
          lastAlertLevel:
            heatIndex >= 52
              ? "Extreme Danger"
              : heatIndex >= 41
              ? "Danger"
              : heatIndex >= 32
              ? "Extreme Caution"
              : "Safe",
          peakHeatIndex: Math.max(latestExisting.peakHeatIndex ?? 0, heatIndex),
        },
        { merge: true }
      );

    await Promise.all([
      rtdbWrite,
      alertWrite,
      summaryWrite,
      dailyHighsWrite,
      latestWrite,
      writeSummary(weeklyRef, weeklyData, (weeklyData.sampleCount || 0) + 1, { isoWeek, weekStart }),
      writeSummary(monthlyRef, monthlyData, (monthlyData.sampleCount || 0) + 1, { isoMonth }),
      writeSummary(yearlyRef, yearlyData, (yearlyData.sampleCount || 0) + 1, { isoYear }),
    ]);

    return response;
  } catch (error) {
    console.error("/api/receiver/upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
