import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

export const createReservation = async (passageiroId, rideId, tariffData) => {
  const docRef = await addDoc(collection(db, "reservations"), {
    passageiro_id: passageiroId,
    ride_id: rideId,
    valor_pago_inicial: tariffData.initialPayment,
    valor_pendente: tariffData.remainingPayment,
    valor_final: tariffData.totalValue,
    status: "confirmada",
    pin: "",
    pin_bloqueado: true,
    data_pagamento_inicial: Timestamp.now(),
    data_pagamento_final: null,
    data_confirmacao_presenca: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getReservationById = async (reservationId) => {
  const docSnap = await getDoc(doc(db, "reservations", reservationId));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getPassageiroReservations = async (passageiroId) => {
  const q = query(
    collection(db, "reservations"),
    where("passageiro_id", "==", passageiroId),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getRideReservations = async (rideId) => {
  const q = query(
    collection(db, "reservations"),
    where("ride_id", "==", rideId),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const generatePIN = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const unblockPIN = async (reservationId, pin) => {
  await updateDoc(doc(db, "reservations", reservationId), {
    pin: pin,
    pin_bloqueado: false,
    data_pagamento_final: Timestamp.now(),
    status: "finalizada",
    updatedAt: Timestamp.now(),
  });
};

export const confirmPresenca = async (reservationId, pin) => {
  await updateDoc(doc(db, "reservations", reservationId), {
    data_confirmacao_presenca: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

export const updateReservationCode = async (reservationId, code) => {
  await updateDoc(doc(db, "reservations", reservationId), {
    codigo: code,
    updatedAt: Timestamp.now(),
  });
};