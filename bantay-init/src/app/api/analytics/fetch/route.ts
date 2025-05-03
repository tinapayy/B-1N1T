import { NextResponse } from 'next/server';
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);

const app = getApps().length === 0
  ? initializeApp({
      credential: cert(serviceAccount),
    })
  : getApp();

const db = getFirestore(app);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get('sensorId');
  if (!sensorId) {
    return NextResponse.json({ error: 'Missing sensorId' }, { status: 400 });
  }

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  try {
    const snapshot = await db
      .collection('readings')
      .where('sensorId', '==', sensorId)
      .where('timestamp', '>=', sevenDaysAgo)
      .orderBy('timestamp', 'desc')
      .limit(200)
      .get();

    const readings = snapshot.docs.map(doc => {
      const data = doc.data();
      const date = new Date(data.timestamp);
      return {
        timestamp: data.timestamp || 0,
        temperature: data.temperature || 0,
        humidity: data.humidity || 0,
        heatIndex: data.heatIndex || 0,
        sensorId: data.sensorId || 'Unregistered',
        formattedDate: `${date.getMonth() + 1}/${date.getDate()}`,
      };
    });

    return NextResponse.json(readings);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
