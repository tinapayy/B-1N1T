// lib/auth.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { adminDb } from "./firebase-admin";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"; // Use env var in prod
const TOKEN_NAME = "bantayinit_token";

export async function authenticateUser(username: string, password: string) {
  const snapshot = await adminDb
    .collection("users")
    .where("username", "==", username)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const userData = doc.data();
  const isMatch = await bcrypt.compare(password, userData.passwordHash);

  if (!isMatch) return null;

  const token = jwt.sign({ uid: doc.id, role: userData.role }, JWT_SECRET, {
    expiresIn: "7d",
  });

  // Set HTTP-only cookie
  cookies().set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 604800, // 7 days
  });

  return { uid: doc.id, role: userData.role };
}

export function getCurrentUser(): { uid: string; role: string } | null {
  const token = cookies().get(TOKEN_NAME)?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as { uid: string; role: string };
  } catch {
    return null;
  }
}

export function logoutUser() {
  cookies().set(TOKEN_NAME, "", { maxAge: 0 });
}
