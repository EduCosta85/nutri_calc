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
import type { StockMovement, StockMovementInput } from "../types/inventory";

/** Hook for stock movement history — records all entries and exits */
export function useStockMovements(itemId?: string) {
  const { user } = useAuth();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMovements([]);
      setLoading(false);
      return;
    }

    const ref = collection(db, `users/${user.uid}/stockMovements`);
    const q = itemId
      ? query(ref, where("itemId", "==", itemId))
      : query(ref);

    const unsubscribe: Unsubscribe = onSnapshot(q, (snapshot) => {
      const data: StockMovement[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as StockMovement);
      });
      // Sort by date desc
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMovements(data);
      setLoading(false);
    }, (error) => {
      console.error("useStockMovements onSnapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, itemId]);

  async function record(input: StockMovementInput) {
    if (!user) throw new Error("Must be authenticated");
    const ref = collection(db, `users/${user.uid}/stockMovements`);
    const docRef = await addDoc(ref, { ...input, createdAt: new Date().toISOString() });
    return docRef.id;
  }

  /** Record a batch of movements (e.g., FIFO deductions across multiple lots) */
  async function recordBatch(inputs: StockMovementInput[]) {
    for (const input of inputs) {
      await record(input);
    }
  }

  return { movements, loading, record, recordBatch };
}
