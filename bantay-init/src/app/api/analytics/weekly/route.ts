// src/app/api/analytics/weekly/route.ts

import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sensorId = searchParams.get("sensorId");

    if (!sensorId || typeof sensorId !== "string") {
      return NextResponse.json({ error: "Missing or invalid sensorId" }, { status: 400 });
    }

    // Query only the last 7 days, ordered descending
    const querySnapshot = await adminDb
      .collection("summaries")
      .where("sensorId", "==", sensorId)
      .orderBy("date", "desc") // `date` must be Firestore Timestamp at 00:00
      .limit(7)
      .get();

    const docs = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        date: data.date?.toDate().toISOString().slice(0, 10), // safe fallback
      };
    });

    return NextResponse.json(docs);
  } catch (err) {
    console.error("/api/analytics/weekly error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
