// src/app/api/analytics/weekly/route.ts
import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
const app =
  getApps().length === 0
    ? initializeApp({ credential: cert(serviceAccount) })
    : getApp();
const db = getFirestore(app);

export async function GET() {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startTimestamp = startOfWeek.getTime();

  const snapshot = await db
    .collection("readings")
    .where("timestamp", ">=", startTimestamp)
    .get();

  const grouped: Record<string, { t: number[]; h: number[]; hi: number[] }> = {};
  snapshot.docs.forEach((doc) => {
    const d = doc.data();
    const date = new Date(d.timestamp);
    const day = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    if (!grouped[day]) grouped[day] = { t: [], h: [], hi: [] };
    grouped[day].t.push(d.temperature);
    grouped[day].h.push(d.humidity);
    grouped[day].hi.push(d.heatIndex);
  });

  const buildStat = (arr: number[]) => ({
    minTemp: Math.min(...arr),
    maxTemp: Math.max(...arr),
  });

  const result = Object.entries(grouped).map(([day, { t, h, hi }]) => ({
    day,
    temperature: buildStat(t),
    humidity: buildStat(h),
    heatIndex: buildStat(hi),
  }));

  return NextResponse.json(result);
}
