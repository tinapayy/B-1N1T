// @/lib/adminDevices.ts
import { firestore } from "@/lib/firebase-client";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

/** ────── VERIFIED ────── **/

export const getVerifiedSensors = async () => {
  const snapshot = await getDocs(collection(firestore, "verified_sensors"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getVerifiedReceivers = async () => {
  const snapshot = await getDocs(collection(firestore, "verified_receivers"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addVerifiedSensor = async (
  sensorId: string,
  payload: Record<string, any>
) => {
  await setDoc(doc(firestore, "verified_sensors", sensorId), payload);
  await deleteDoc(doc(firestore, "unverified_sensors", sensorId));
};

export const addVerifiedReceiver = async (
  receiverId: string,
  payload: Record<string, any>
) => {
  await setDoc(doc(firestore, "verified_receivers", receiverId), payload);
  await deleteDoc(doc(firestore, "unverified_receivers", receiverId));
};

export const deleteVerifiedSensor = async (sensorId: string) => {
  await deleteDoc(doc(firestore, "verified_sensors", sensorId));
};

export const deleteVerifiedReceiver = async (receiverId: string) => {
  await deleteDoc(doc(firestore, "verified_receivers", receiverId));
};

export const updateReceiverSensorMapping = async (
  receiverId: string,
  newSensorId: string
) => {
  const ref = doc(firestore, "verified_receivers", receiverId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const connected = Array.isArray(data.connectedSensorIds)
    ? data.connectedSensorIds
    : [];

  if (!connected.includes(newSensorId)) {
    await updateDoc(ref, {
      connectedSensorIds: [...connected, newSensorId],
    });
  }
};

// New function to update the full list of connected sensor IDs
export const updateReceiverSensorConnections = async (
  receiverId: string,
  sensorIds: string[]
) => {
  const ref = doc(firestore, "verified_receivers", receiverId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  await updateDoc(ref, {
    connectedSensorIds: sensorIds,
  });
};

/** ────── UNVERIFIED ────── **/

export const getUnverifiedSensorIds = async (): Promise<string[]> => {
  const snapshot = await getDocs(collection(firestore, "unverified_sensors"));
  return snapshot.docs.map((doc) => doc.id);
};

export const getUnverifiedReceiverIds = async (): Promise<string[]> => {
  const snapshot = await getDocs(collection(firestore, "unverified_receivers"));
  return snapshot.docs.map((doc) => doc.id);
};