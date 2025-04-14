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
 * Returns daily average heat index, temperature, and humidity values grouped by date,
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
    const dateMap: Record<string, { hi: number[]; temp: number[]; hum: number[] }> = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      const date = new Date(data.timestamp.toDate ? data.timestamp.toDate() : data.timestamp)
        .toISOString()
        .split("T")[0];

      if (!dateMap[date]) {
        dateMap[date] = { hi: [], temp: [], hum: [] };
      }

      if (data.heatIndex) dateMap[date].hi.push(data.heatIndex);
      if (data.temperature) dateMap[date].temp.push(data.temperature);
      if (data.humidity) dateMap[date].hum.push(data.humidity);
    });

    // Compute averages per date
    const result = Object.entries(dateMap).map(([date, values]) => {
      const avg = (arr: number[]) =>
        arr.length > 0
          ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2))
          : 0;

      return {
        date,
        averageHeatIndex: avg(values.hi),
        averageTemperature: avg(values.temp),
        averageHumidity: avg(values.hum),
      };
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
