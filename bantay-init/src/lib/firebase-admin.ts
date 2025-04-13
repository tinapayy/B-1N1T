// src/lib/firebase-admin.ts
import { cert, getApps, getApp, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
        }),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      })
    : getApp();

const db = getFirestore(app);
const rtdb = getDatabase(app); // ✅ Realtime DB instance

export { db, rtdb };
