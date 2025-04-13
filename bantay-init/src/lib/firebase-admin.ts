// src/lib/firebase-admin.ts
import { cert, getApps, getApp, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
};

const app =
  getApps().length === 0
    ? initializeApp({ credential: cert(firebaseAdminConfig) })
    : getApp();

const db = getFirestore(app);

export { db };
