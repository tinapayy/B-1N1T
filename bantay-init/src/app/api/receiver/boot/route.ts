import { firestore } from "@/lib/firebase-client";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { receiverId, mac } = await req.json();

    if (!receiverId) {
      return NextResponse.json({ error: "Missing receiverId" }, { status: 400 });
    }

    const ref = doc(firestore, "unverified_receivers", receiverId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        receiverId: receiverId,
        macAddress: mac || "N/A",
        createdAt: serverTimestamp(),
        status: "Unverified",
        notes: "Auto-registered via boot"
      });
      return NextResponse.json({ status: "registered" }, { status: 201 });
    }

    return NextResponse.json({ status: "already exists" }, { status: 200 });
  } catch (err: any) {
    console.error("Receiver boot error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
