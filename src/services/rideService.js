import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
  orderBy,
  Timestamp,
} from "firebase/firestore";

export const createRide = async (motoristId, rideData) => {
  const docRef = await addDoc(collection(db, "rides"), {
    ...rideData,
    motorista_id: motoristId,
    status: "aberta",
    lugares_ocupados: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getRideById = async (rideId) => {
  const docSnap = await getDoc(doc(db, "rides", rideId));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getMotoristaRides = async (motoristId) => {
  const q = query(
    collection(db, "rides"),
    where("motorista_id", "==", motoristId),
    orderBy("data_hora", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getOpenRides = async () => {
  const q = query(
    collection(db, "rides"),
    where("status", "==", "aberta"),
    orderBy("data_hora", "asc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateRideStatus = async (rideId, status) => {
  await updateDoc(doc(db, "rides", rideId), {
    status,
    updatedAt: Timestamp.now(),
  });
};