// src/app/api/receiver/upload/route.ts
import { NextResponse } from 'next/server';
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);

const app = getApps().length === 0
  ? initializeApp({
      credential: cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    })
  : getApp();

const db = getFirestore(app);
const rtdb = getDatabase(app);
console.log("RTDB URL:", process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sensorId, temperature, humidity, heatIndex, receiverId } = body;

    if (!sensorId || temperature == null || humidity == null || heatIndex == null || !receiverId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const timestamp = Date.now();

    // Firestore: /readings/{autoId}
    await db.collection("readings").add({
      sensorId,
      temperature,
      humidity,
      heatIndex,
      receiverId,
      timestamp,
    });

    // RTDB: /sensor_readings/{sensorId}
    await rtdb.ref(`/sensor_readings/${sensorId}`).set({
      temperature,
      humidity,
      heatIndex,
      receiverId,
      timestamp,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Receiver Upload Error:", err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
