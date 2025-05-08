// /src/lib/firebase-admin.ts

import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");

if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
  throw new Error("Invalid Firebase service account env vars. Check FIREBASE_SERVICE_ACCOUNT_KEY.");
}

const app = getApps().length === 0
  ? initializeApp({
      credential: cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    })
  : getApp();

const _db = getFirestore(app);

// 🔥 this is safe now — only runs once before any use
if ((<any>_db)._settingsFrozen !== true) {
  _db.settings({ ignoreUndefinedProperties: true });
}

export const adminDb = _db;
export const adminRtdb = getDatabase(app);
