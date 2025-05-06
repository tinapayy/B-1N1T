import { database } from "@/lib/firebase-client";
import { ref, get } from "firebase/database";
import { NextResponse } from "next/server";

// In-memory cache to reduce quota hits
let cachedReading: Record<string, any> = {};
let cacheTimestamp: Record<string, number> = {};
const CACHE_DURATION = 30 * 1000; // 30 seconds

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sensorId = url.searchParams.get("sensorId");

  if (!sensorId) {
    return NextResponse.json({ error: "Missing sensorId" }, { status: 400 });
  }

  const now = Date.now();
  const lastCache = cacheTimestamp[sensorId] || 0;

  // Serve from cache if valid
  if (now - lastCache < CACHE_DURATION && cachedReading[sensorId]) {
    return NextResponse.json(cachedReading[sensorId], {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=30",
      },
    });
  }

  try {
    const snapshot = await get(ref(database, `sensor_readings/${sensorId}`));
    const value = snapshot.exists() ? snapshot.val() : null;

    if (!value || typeof value !== "object") {
      return NextResponse.json(
        { error: "No data found for this sensor" },
        { status: 404 }
      );
    }

    const reading = {
      t: value.t ?? 0,
      h: value.h ?? 0,
      hi: value.hi ?? 0,
      ts: value.ts ?? Date.now(),
      r: value.r ?? null,
    };

    // Cache and respond
    cachedReading[sensorId] = reading;
    cacheTimestamp[sensorId] = now;

    return NextResponse.json(reading, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=30",
      },
    });
  } catch (error) {
    console.error("/api/dashboard/live error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
