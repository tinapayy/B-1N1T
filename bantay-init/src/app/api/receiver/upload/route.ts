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

function getTodayDateStr(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
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

    const rawTimestamp = body.__mockTimestamp || Date.now();
    const timestamp = typeof rawTimestamp === "number" ? rawTimestamp : Date.now();
    const now = new Date(timestamp);

    const summaryId = getTodayKey(sensorId);
    const summaryRef = adminDb.collection("summaries").doc(summaryId);
    const response = NextResponse.json({ success: true });

    // === IDENTIFIERS ===
    const isoWeek = getISOWeekId(now);
    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDay() === 0 ? now.getUTCDate() - 6 : now.getUTCDate() - now.getUTCDay() + 1);
    weekStart.setUTCHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const isoMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const isCurrentMonth = now.getMonth() === new Date().getMonth() && now.getFullYear() === new Date().getFullYear();

    const yearStart = new Date(now.getFullYear(), 0, 1);
    yearStart.setUTCHours(0, 0, 0, 0);
    const isoYear = `${now.getFullYear()}`;
    const isCurrentYear = now.getFullYear() === new Date().getFullYear();

    const weeklyRef = adminDb.collection("analytics_weekly_summary").doc(`${sensorId}_${isoWeek}`);
    const monthlyRef = adminDb.collection("analytics_monthly_summary").doc(`${sensorId}_${isoMonth}`);
    const yearlyRef = adminDb.collection("analytics_yearly_summary").doc(`${sensorId}_${isoYear}`);

    const [weeklySnap, monthlySnap, yearlySnap] = await Promise.all([
      weeklyRef.get(),
      monthlyRef.get(),
      yearlyRef.get(),
    ]);

    const weekly = weeklySnap.exists ? weeklySnap.data() ?? {} : {};
    const monthly = monthlySnap.exists ? monthlySnap.data() ?? {} : {};
    const yearly = yearlySnap.exists ? yearlySnap.data() ?? {} : {};

    // === Firestore Batch Writes ===

    // Summaries (for backup/monitoring)
    const summarySnap = await summaryRef.get();
    const existing = summarySnap.exists ? summarySnap.data() ?? {} : {};
    const newCount = (existing.count || 0) + 1;

    const summaryWrite = summaryRef.set(
      {
        sensorId,
        date: getTodayTimestamp(),
        count: newCount,
        avgTemp: ((existing.avgTemp || 0) * (newCount - 1) + temperature) / newCount,
        avgHumidity: ((existing.avgHumidity || 0) * (newCount - 1) + humidity) / newCount,
        avgHeatIndex: ((existing.avgHeatIndex || 0) * (newCount - 1) + heatIndex) / newCount,
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

    // Weekly Summary
    const weeklyCount = (weekly.dataPointCount || 0) + 1;
    const weeklyWrite = weeklyRef.set(
      {
        sensorID: sensorId,
        isoWeek,
        weekStart: Timestamp.fromDate(weekStart),
        dataPointCount: weeklyCount,
        avgTemp: ((weekly.avgTemp || 0) * (weeklyCount - 1) + temperature) / weeklyCount,
        avgHeatIndex: ((weekly.avgHeatIndex || 0) * (weeklyCount - 1) + heatIndex) / weeklyCount,
        alertCount: heatIndex >= 32 ? (weekly.alertCount || 0) + 1 : weekly.alertCount || 0,
        isPartial: false,
      },
      { merge: true }
    );

    // Monthly Summary
    const monthlyCount = (monthly.dataPointCount || 0) + 1;
    const monthlyWrite = monthlyRef.set(
      {
        sensorID: sensorId,
        isoMonth,
        monthStart: Timestamp.fromDate(monthStart),
        dataPointCount: monthlyCount,
        avgTemp: ((monthly.avgTemp || 0) * (monthlyCount - 1) + temperature) / monthlyCount,
        avgHeatIndex: ((monthly.avgHeatIndex || 0) * (monthlyCount - 1) + heatIndex) / monthlyCount,
        alertCount: heatIndex >= 32 ? (monthly.alertCount || 0) + 1 : monthly.alertCount || 0,
        isPartial: isCurrentMonth,
      },
      { merge: true }
    );

    // Yearly Summary
    const yearlyCount = (yearly.dataPointCount || 0) + 1;
    const yearlyWrite = yearlyRef.set(
      {
        sensorID: sensorId,
        isoYear,
        yearStart: Timestamp.fromDate(yearStart),
        dataPointCount: yearlyCount,
        avgTemp: ((yearly.avgTemp || 0) * (yearlyCount - 1) + temperature) / yearlyCount,
        avgHeatIndex: ((yearly.avgHeatIndex || 0) * (yearlyCount - 1) + heatIndex) / yearlyCount,
        alertCount: heatIndex >= 32 ? (yearly.alertCount || 0) + 1 : yearly.alertCount || 0,
        isPartial: isCurrentYear,
      },
      { merge: true }
    );

    // Alerts
    const alertWrite =
      heatIndex >= 32
        ? adminDb.collection("alerts").add({
            sensorId,
            temperature,
            humidity,
            heatIndex,
            alertType:
              heatIndex >= 52 ? "Extreme Danger" : heatIndex >= 41 ? "Danger" : "Extreme Caution",
            timestamp: Timestamp.fromMillis(timestamp),
            message: `High heat index detected: ${heatIndex}`,
            receiverId: receiverId || null,
          })
        : Promise.resolve();

    // Realtime DB live update
    const rtdbWrite = adminRtdb.ref(`/sensor_readings/${sensorId}`).set({
      t: temperature,
      h: humidity,
      hi: heatIndex,
      ts: timestamp,
      r: receiverId || null,
    });

    // Min-Max Summary
    const minMaxId = `${sensorId}_${getTodayDateStr(now)}`;
    const minMaxRef = adminDb.collection("analytics_min_max_summary").doc(minMaxId);
    const minMaxSnap = await minMaxRef.get();
    const minMax = minMaxSnap.exists ? minMaxSnap.data() ?? {} : {};
    const minMaxWrite = minMaxRef.set(
      {
        sensorID: sensorId,
        timestamp: Timestamp.fromMillis(timestamp),
        minTemp: Math.min(minMax.minTemp ?? temperature, temperature),
        maxTemp: Math.max(minMax.maxTemp ?? temperature, temperature),
        minHumidity: Math.min(minMax.minHumidity ?? humidity, humidity),
        maxHumidity: Math.max(minMax.maxHumidity ?? humidity, humidity),
        minHeatIndex: Math.min(minMax.minHeatIndex ?? heatIndex, heatIndex),
        maxHeatIndex: Math.max(minMax.maxHeatIndex ?? heatIndex, heatIndex),
      },
      { merge: true }
    );

    // Daily Highs
    const highsRef = adminDb.collection("analytics_daily_highs").doc(getTodayKey(sensorId));
    const highsSnap = await highsRef.get();
    const highs = highsSnap.exists ? highsSnap.data() ?? {} : {};
    const dailyHighsWrite = highsRef.set(
      {
        sensorId,
        timestamp: Timestamp.fromMillis(timestamp),
        highestTemp: Math.max(highs.highestTemp ?? temperature, temperature),
        highestHumidity: Math.max(highs.highestHumidity ?? humidity, humidity),
        highestHeatIndex: Math.max(highs.highestHeatIndex ?? heatIndex, heatIndex),
      },
      { merge: true }
    );

    // Latest reading
    const latestSnap = await adminDb.collection("sensor_latest").doc(sensorId).get();
    const latest = latestSnap.exists ? latestSnap.data() ?? {} : {};
    const latestWrite = adminDb.collection("sensor_latest").doc(sensorId).set(
      {
        lastTemperature: temperature,
        lastHumidity: humidity,
        lastHeatIndex: heatIndex,
        lastReadingTimestamp: Timestamp.fromMillis(timestamp),
        lastAlertLevel:
          heatIndex >= 52 ? "Extreme Danger" : heatIndex >= 41 ? "Danger" : heatIndex >= 32 ? "Extreme Caution" : "Safe",
        peakHeatIndex: Math.max(latest.peakHeatIndex ?? 0, heatIndex),
      },
      { merge: true }
    );

    await Promise.all([
      rtdbWrite,
      alertWrite,
      summaryWrite,
      minMaxWrite,
      dailyHighsWrite,
      latestWrite,
      weeklyWrite,
      monthlyWrite,
      yearlyWrite,
    ]);

    return response;
  } catch (error) {
    console.error("/api/receiver/upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
