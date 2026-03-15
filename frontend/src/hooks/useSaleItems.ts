import { useEffect, useState } from "react";
import {
  collection,
  addDoc as _addDoc,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { safeAddDoc as addDoc } from "../utils/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import type { QuickSaleItem, QuickSaleItemInput } from "../types/sales";

/** Hook for sale line items — stores individual items per sale */
export function useSaleItems(saleId?: string) {
  const { user } = useAuth();
  const [items, setItems] = useState<QuickSaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !saleId) {
      setItems([]);
      setLoading(false);
      return;
    }

    const ref = collection(db, `users/${user.uid}/saleItems`);
    const q = query(ref, where("saleId", "==", saleId));

    const unsubscribe: Unsubscribe = onSnapshot(q, (snapshot) => {
      const data: QuickSaleItem[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as QuickSaleItem);
      });
      setItems(data);
      setLoading(false);
    }, (error) => {
      console.error("useSaleItems onSnapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, saleId]);

  async function addItem(item: QuickSaleItemInput) {
    if (!user) throw new Error("Must be authenticated");
    const ref = collection(db, `users/${user.uid}/saleItems`);
    const now = new Date().toISOString();
    const docRef = await addDoc(ref, { ...item, createdAt: now });
    return docRef.id;
  }

  /** Add multiple items in batch */
  async function addItems(items: QuickSaleItemInput[]) {
    for (const item of items) {
      await addItem(item);
    }
  }

  return { items, loading, add: addItem, addBatch: addItems };
}
