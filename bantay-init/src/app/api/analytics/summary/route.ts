// src/app/api/analytics/summary/route.ts
import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
const app =
  getApps().length === 0
    ? initializeApp({ credential: cert(serviceAccount) })
    : getApp();
const db = getFirestore(app);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sensorId = url.searchParams.get("sensorId");

  if (!sensorId) {
    return NextResponse.json({ error: "Missing sensorId" }, { status: 400 });
  }

  const now = new Date();
  const startOfToday = new Date(now.setHours(0, 0, 0, 0)).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfWeekTs = startOfWeek.getTime();

  // Fetch data
  const snapshot = await db
    .collection("readings")
    .where("sensorId", "==", sensorId)
    .orderBy("timestamp", "desc")
    .limit(200)
    .get();

  const readings = snapshot.docs.map((doc) => doc.data());

  // Prepare results
  const todayMax = readings
    .filter((r) => r.timestamp >= startOfToday)
    .reduce((max, curr) => (curr.heatIndex > (max?.heatIndex || -Infinity) ? curr : max), null);

  const monthly = readings
    .filter((r) => r.timestamp >= startOfMonth)
    .map((r) => ({
      heatIndex: r.heatIndex,
      temperature: r.temperature,
      timestamp: r.timestamp,
      label: new Date(r.timestamp).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    }));

  const alerts = readings
    .filter((r) => r.heatIndex >= 32)
    .map((r, i) => ({
      id: i + 1,
      type:
        r.heatIndex >= 52
          ? "Extreme Danger"
          : r.heatIndex >= 41
          ? "Danger"
          : "Extreme Caution",
      heatIndex: `${r.heatIndex.toFixed(1)}°C`,
      dateTime: new Date(r.timestamp).toLocaleString("en-US"),
    }));

  const weeklyGrouped: Record<string, number[]> = {};
  readings
    .filter((r) => r.timestamp >= startOfWeekTs)
    .forEach((r) => {
      const d = new Date(r.timestamp);
      const day = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
      if (!weeklyGrouped[day]) weeklyGrouped[day] = [];
      weeklyGrouped[day].push(r.heatIndex);
    });

  const weekly = Object.entries(weeklyGrouped).map(([day, vals]) => ({
    day,
    minTemp: Math.min(...vals),
    maxTemp: Math.max(...vals),
  }));

  return NextResponse.json({
    todayMax,
    monthly,
    alertCount: alerts.length,
    alerts,
    weekly,
  });
}
