// receiver/boot/route.ts

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

    // Check if already verified
    const verifiedRef = doc(firestore, "verified_receivers", receiverId);
    const verifiedSnap = await getDoc(verifiedRef);

    if (verifiedSnap.exists()) {
      return NextResponse.json({ status: "already verified" }, { status: 200 });
    }

    // Check if already unverified
    const unverifiedRef = doc(firestore, "unverified_receivers", receiverId);
    const unverifiedSnap = await getDoc(unverifiedRef);

    if (!unverifiedSnap.exists()) {
      await setDoc(unverifiedRef, {
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
