// /app/api/analytics/data/route.ts
// Responds with all: readings[], highestReadingToday, weeklyMinMax, alerts[]

// src/app/api/analytics/data/route.ts
import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert(serviceAccount),
      })
    : getApp();
const db = getFirestore(app);

export async function GET() {
  const snapshot = await db
    .collection("readings")
    .orderBy("timestamp", "desc")
    .limit(30)
    .get();

  const data = snapshot.docs.map((doc) => {
    const r = doc.data();
    return {
      heatIndex: r.heatIndex,
      temperature: r.temperature,
      timestamp: r.timestamp,
      label: new Date(r.timestamp).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    };
  });

  return NextResponse.json(data);
}


// src/app/api/analytics/highest/route.ts
export async function GET() {
  const snapshot = await db
    .collection("readings")
    .where("timestamp", ">=",
      new Date(new Date().setHours(0, 0, 0, 0)).getTime())
    .orderBy("heatIndex", "desc")
    .limit(1)
    .get();

  const top = snapshot.docs[0]?.data() || null;
  return NextResponse.json(top);
}


// src/app/api/analytics/alerts/route.ts
export async function GET() {
  const snapshot = await db
    .collection("readings")
    .where("heatIndex", ">=", 32) // threshold
    .orderBy("timestamp", "desc")
    .limit(100)
    .get();

  const data = snapshot.docs.map((doc, i) => {
    const d = doc.data();
    return {
      id: i + 1,
      type:
        d.heatIndex >= 52
          ? "Extreme Danger"
          : d.heatIndex >= 41
          ? "Danger"
          : "Extreme Caution",
      heatIndex: `${d.heatIndex.toFixed(1)}°C`,
      dateTime: new Date(d.timestamp).toLocaleString("en-US"),
    };
  });

  return NextResponse.json(data);
}


// src/app/api/analytics/weekly/route.ts
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
