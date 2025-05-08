// /sensor/boot/route.ts

import { firestore } from "@/lib/firebase-client";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sensorId, receiverId } = await req.json();

    if (!sensorId) {
      return NextResponse.json({ error: "Missing sensorId" }, { status: 400 });
    }

    const ref = doc(firestore, "unverified_sensors", sensorId);
    const existing = await getDoc(ref);

    if (!existing.exists()) {
      await setDoc(ref, {
        sensorId: sensorId,
        receiverId: receiverId || null,
        status: "Unverified",
        firstSeen: serverTimestamp(),
        notes: "First boot auto-entry. Awaiting verification."
      });
      return NextResponse.json({ status: "registered" }, { status: 201 });
    }

    return NextResponse.json({ status: "already exists" }, { status: 200 });
  } catch (err) {
    console.error("Sensor boot error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
