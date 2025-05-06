// src/app/api/analytics/fetch/route.ts

import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sensorId = searchParams.get("sensorId");
    const date = searchParams.get("date");

    if (!sensorId || !date) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const docId = `${sensorId}_${date}`;
    const docRef = adminDb.collection("summaries").doc(docId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
  } catch (err) {
    console.error("/api/analytics/fetch error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
