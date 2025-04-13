// src/app/api/alerts/route.ts

import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

/**
 * GET /api/alerts
 * 
 * Optional query params:
 * - status: "warning" | "danger" | "extreme"
 * - start: ISO string (e.g., 2024-04-01T00:00:00Z)
 * - end: ISO string (e.g., 2024-04-10T23:59:59Z)
 * - sensorId: filter alerts by sensor
 *
 * Returns: List of alerts from Firestore tailored for table display and mapping
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const statusFilter = searchParams.get("status");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const sensorId = searchParams.get("sensorId");

  try {
    let query: FirebaseFirestore.Query = db.collection("alerts");

    // Apply filters if provided
    if (statusFilter) query = query.where("status", "==", statusFilter);
    if (start) query = query.where("timestamp", ">=", new Date(start));
    if (end) query = query.where("timestamp", "<=", new Date(end));
    if (sensorId) query = query.where("sensorId", "==", sensorId);

    const snapshot = await query.get();

    const alerts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(alerts);
  } catch (err) {
    console.error("[/api/alerts] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
