import { useEffect, useState } from "react";
import {
  collection,
  addDoc as _addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
  type Unsubscribe,
} from "firebase/firestore";
import { safeAddDoc as addDoc } from "../utils/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import type { SalesSkuComponent, SalesSkuComponentInput } from "../types/sales";

/** Hook for SKU components — stores composition of each SKU */
export function useSkuComponents(skuId?: string) {
  const { user } = useAuth();
  const [components, setComponents] = useState<SalesSkuComponent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !skuId) {
      setComponents([]);
      setLoading(false);
      return;
    }

    const ref = collection(db, `users/${user.uid}/skuComponents`);
    const q = query(ref, where("salesSkuId", "==", skuId));

    const unsubscribe: Unsubscribe = onSnapshot(q, (snapshot) => {
      const data: SalesSkuComponent[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as SalesSkuComponent);
      });
      setComponents(data);
      setLoading(false);
    }, (error) => {
      console.error("useSkuComponents onSnapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, skuId]);

  async function addComponent(input: SalesSkuComponentInput) {
    if (!user) throw new Error("Must be authenticated");
    const ref = collection(db, `users/${user.uid}/skuComponents`);
    const now = new Date().toISOString();
    const docRef = await addDoc(ref, { ...input, createdAt: now });
    return docRef.id;
  }

  async function removeComponent(id: string) {
    if (!user) throw new Error("Must be authenticated");
    const docRef = doc(db, `users/${user.uid}/skuComponents`, id);
    await deleteDoc(docRef);
  }

  /** Replace all components for a SKU (delete old, add new) */
  async function replaceComponents(skuId: string, newComponents: Array<{ inventoryItemId: string; quantity: number }>) {
    if (!user) throw new Error("Must be authenticated");
    const ref = collection(db, `users/${user.uid}/skuComponents`);

    // Delete existing
    const q = query(ref, where("salesSkuId", "==", skuId));
    const existing = await getDocs(q);
    for (const docSnap of existing.docs) {
      await deleteDoc(doc(db, `users/${user.uid}/skuComponents`, docSnap.id));
    }

    // Add new
    const now = new Date().toISOString();
    for (const comp of newComponents) {
      if (comp.inventoryItemId && comp.quantity > 0) {
        await addDoc(ref, {
          salesSkuId: skuId,
          inventoryItemId: comp.inventoryItemId,
          quantity: comp.quantity,
          createdAt: now,
        });
      }
    }
  }

  return { components, loading, add: addComponent, remove: removeComponent, replaceAll: replaceComponents };
}
