import { database } from "@/lib/firebase-client";
import { ref, get } from "firebase/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const snapshot = await get(ref(database, "sensor_readings"));
    if (snapshot.exists()) {
      return NextResponse.json(snapshot.val(), {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=30", // Cache for 30 seconds
        },
      });
    } else {
      return NextResponse.json({}, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
