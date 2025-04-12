// src/app/api/analytics/summary/route.ts

import { db } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

/**
 * GET /api/analytics/summary
 *
 * Returns summarized analytics for the BANTAY-INIT dashboard:
 * - Peak heat index (current month)
 * - Total number of alerts (all time)
 * - Monthly change in average heat index (current vs. last month)
 *
 * Data format is tailored for frontend dashboard cards and analytics display.
 */
export async function GET() {
  try {
    // Current date for time filtering
    const now = new Date();

    // Beginning of current month (e.g., April 1)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Last month's date range
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0); // last day of previous month

    /**
     * Firestore structure:
     * /readings/{sensorId}/... (subcollections)
     *
     * Use collectionGroup() to query all readings across all sensors.
     */

    // 1. Get all current month readings for heat index analysis
    const currentSnapshot = await db
      .collectionGroup("readings")
      .where("timestamp", ">=", monthStart)
      .get();

    // 2. Get all last month readings for comparison
    const lastMonthSnapshot = await db
      .collectionGroup("readings")
      .where("timestamp", ">=", lastMonthStart)
      .where("timestamp", "<", lastMonthEnd)
      .get();

    // 3. Get all alerts (flagged anomalies)
    const alertSnapshot = await db.collection("alerts").get();

    // === UTILITY FUNCTIONS ===

    /**
     * Calculate average heat index from a Firestore snapshot
     */
    const averageHI = (snap: FirebaseFirestore.QuerySnapshot) => {
      const values = snap.docs.map((doc) => doc.data().heatIndex || 0);
      const sum = values.reduce((a, b) => a + b, 0);
      return values.length > 0 ? parseFloat((sum / values.length).toFixed(2)) : 0;
    };

    /**
     * Get peak (max) heat index from snapshot
     */
    const peakHI = (snap: FirebaseFirestore.QuerySnapshot) => {
      return snap.docs.reduce((max, doc) => {
        const val = doc.data().heatIndex || 0;
        return val > max ? val : max;
      }, 0);
    };

    // === RESPONSE FORMAT FOR FRONTEND UI INTEGRATION ===
    // Can be used directly in dashboard cards or graphs

    return NextResponse.json({
      peakHeatIndex: peakHI(currentSnapshot),
      alertCount: alertSnapshot.size,
      monthlyChange: {
        currentAvg: averageHI(currentSnapshot),
        lastMonthAvg: averageHI(lastMonthSnapshot),
      },
    });

  } catch (err) {
    console.error("[/api/analytics/summary] Error:", err);
    return NextResponse.json(
      { error: "Failed to compute analytics summary" },
      { status: 500 }
    );
  }
}
