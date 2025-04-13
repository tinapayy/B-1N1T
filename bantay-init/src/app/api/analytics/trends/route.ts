// src/app/api/analytics/trends/route.ts

import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

/**
 * GET /api/analytics/trends
 * 
 * Optional query params:
 * - sensorId: if present, filters to one sensor
 * - start: ISO date string (e.g., 2024-04-01)
 * - end: ISO date string (e.g., 2024-04-10)
 * 
 * Returns daily average heat index values grouped by date,
 * ideal for time-series line charts in the analytics dashboard.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  try {
    let readingsQuery: FirebaseFirestore.Query;

    // Build path: either a single sensor's readings or all sensors (collectionGroup)
    if (sensorId) {
      readingsQuery = db
        .collection(`readings/${sensorId}/entries`);
    } else {
      readingsQuery = db.collectionGroup("entries");
    }

    // Apply date filters
    if (start) readingsQuery = readingsQuery.where("timestamp", ">=", new Date(start));
    if (end) readingsQuery = readingsQuery.where("timestamp", "<=", new Date(end));

    const snapshot = await readingsQuery.get();

    // Group data by date string
    const dateMap: Record<string, number[]> = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      const date = new Date(data.timestamp.toDate ? data.timestamp.toDate() : data.timestamp)
        .toISOString()
        .split("T")[0]; // YYYY-MM-DD

      if (!dateMap[date]) dateMap[date] = [];
      if (data.heatIndex) dateMap[date].push(data.heatIndex);
    });

    // Compute average heat index per date
    const result = Object.entries(dateMap).map(([date, values]) => {
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = values.length > 0 ? parseFloat((sum / values.length).toFixed(2)) : 0;
      return { date, averageHeatIndex: avg };
    });

    // Sort by date ascending
    result.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/analytics/trends] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch trend analytics" },
      { status: 500 }
    );
  }
}
