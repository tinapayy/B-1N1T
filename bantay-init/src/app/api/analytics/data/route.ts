// src/app/api/analytics/data/route.ts

import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sensorId = searchParams.get("sensorId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!sensorId || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const snapshot = await adminDb
      .collection("summaries")
      .where("sensorId", "==", sensorId)
      .where("date", ">=", startDate)
      .where("date", "<=", endDate)
      .orderBy("date", "asc")
      .get();

    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(data);
  } catch (err) {
    console.error("/api/analytics/data error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
