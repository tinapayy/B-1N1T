import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET() {
    try {
      const snapshot = await adminDb
        .collectionGroup("data")
        .where("sensorId", ">=", "") // filter to force Firestore to use index
        .orderBy("timestamp", "desc")
        .limit(500)
        .get();
  
      const readings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      return NextResponse.json(readings);
    } catch (error) {
      console.error("Firestore error:", error);
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  }
  
