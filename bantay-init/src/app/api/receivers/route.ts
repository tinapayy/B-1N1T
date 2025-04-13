import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

/**
 * GET: List all receivers
 * POST: Register a new receiver
 */
export async function GET() {
  try {
    const snapshot = await db.collection("receivers").get();
    const receivers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(receivers);
  } catch (err) {
    console.error("[/api/receivers] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch receivers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { receiverId, ...rest } = body;

    if (!receiverId) {
      return NextResponse.json({ error: "Missing receiverId" }, { status: 400 });
    }

    await db.collection("receivers").doc(receiverId).set({
      ...rest,
      installDate: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/receivers] POST error:", err);
    return NextResponse.json({ error: "Failed to register receiver" }, { status: 500 });
  }
}
