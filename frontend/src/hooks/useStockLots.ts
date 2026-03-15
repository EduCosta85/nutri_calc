import { useCallback, useEffect, useState } from "react";
import {
  collection,
  doc,
  addDoc as _addDoc,
  updateDoc as _updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { safeAddDoc as addDoc, safeUpdateDoc as updateDoc } from "../utils/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import type { StockLot, StockLotInput } from "../types/inventory";

export function useStockLots(itemId?: string) {
  const { user } = useAuth();
  const [lots, setLots] = useState<StockLot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLots([]);
      setLoading(false);
      return;
    }

    const lotsRef = collection(db, `users/${user.uid}/stockLots`);
    const q = itemId
      ? query(lotsRef, where("itemId", "==", itemId))
      : query(lotsRef);

    const unsubscribe: Unsubscribe = onSnapshot(q, (snapshot) => {
      const data: StockLot[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as StockLot);
      });
      setLots(data);
      setLoading(false);
    }, (error) => {
      console.error("useStockLots onSnapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, itemId]);

  async function addLot(lot: StockLotInput) {
    if (!user) throw new Error("Must be authenticated");
    const lotsRef = collection(db, `users/${user.uid}/stockLots`);
    const now = new Date().toISOString();
    const docRef = await addDoc(lotsRef, { ...lot, createdAt: now, updatedAt: now });
    return docRef.id;
  }

  async function updateLot(id: string, data: Partial<StockLot>) {
    if (!user) throw new Error("Must be authenticated");
    const lotRef = doc(db, `users/${user.uid}/stockLots`, id);
    await updateDoc(lotRef, { ...data, updatedAt: new Date().toISOString() });
  }

  async function removeLot(id: string) {
    if (!user) throw new Error("Must be authenticated");
    const lotRef = doc(db, `users/${user.uid}/stockLots`, id);
    await deleteDoc(lotRef);
  }

  /** Add quantity to an existing lot */
  const addQuantity = useCallback(
    async (lotId: string, quantity: number) => {
      const lot = lots.find((l) => l.id === lotId);
      if (!lot) return;
      await updateLot(lotId, { quantity: lot.quantity + quantity });
    },
    [lots],
  );

  /** Remove quantity from an existing lot */
  const removeQuantity = useCallback(
    async (lotId: string, quantity: number) => {
      const lot = lots.find((l) => l.id === lotId);
      if (!lot) return;
      await updateLot(lotId, { quantity: Math.max(0, lot.quantity - quantity) });
    },
    [lots],
  );

  return { lots, loading, add: addLot, update: updateLot, remove: removeLot, addQuantity, removeQuantity };
}
