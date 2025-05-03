// src/app/api/analytics/highest/route.ts
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
    .where("timestamp", ">=", new Date().setHours(0, 0, 0, 0))
    .orderBy("heatIndex", "desc")
    .limit(1)
    .get();

  const top = snapshot.docs[0]?.data() || null;
  return NextResponse.json(top);
}
