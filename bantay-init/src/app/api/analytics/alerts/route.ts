// src/app/api/analytics/alerts/route.ts
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
  const snapshot = await db
    .collection("readings")
    .where("heatIndex", ">=", 32)
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
