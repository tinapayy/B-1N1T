import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await adminDb.collection("verified_sensors").get();
    const sensors = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        sensorId: doc.id,
        sensorName: data.name || doc.id, // fallback to ID if name missing
      };
    });

    return NextResponse.json({ sensors });
  } catch (err) {
    console.error("Failed to fetch sensor names:", err);
    return NextResponse.json({ sensors: [] }, { status: 500 });
  }
}
