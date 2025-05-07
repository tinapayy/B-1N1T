import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const snapshot = await adminDb.collection("users")
    .where("username", "==", username)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const userDoc = snapshot.docs[0];
  const user = userDoc.data();

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = jwt.sign({ id: userDoc.id, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return NextResponse.json({
    token,
    user: { id: userDoc.id, role: user.role },
  });
}
