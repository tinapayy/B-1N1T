import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

/**
 * GET: List all sensors
 * POST: Register a new sensor
 */
export async function GET() {
  try {
    const snapshot = await db.collection("sensors").get();
    const sensors = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(sensors);
  } catch (err) {
    console.error("[/api/sensors] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch sensors" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sensorId, ...rest } = body;

    if (!sensorId) {
      return NextResponse.json({ error: "Missing sensorId" }, { status: 400 });
    }

    await db.collection("sensors").doc(sensorId).set({
      ...rest,
      registerDate: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/sensors] POST error:", err);
    return NextResponse.json({ error: "Failed to register sensor" }, { status: 500 });
  }
}
