import { useCallback, useEffect, useState } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import type { SalesSku, SalesSkuInput } from "../types/sales";

export function useSalesSkus() {
  const { user } = useAuth();
  const [skus, setSkus] = useState<SalesSku[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSkus([]);
      setLoading(false);
      return;
    }

    const skusRef = collection(db, `users/${user.uid}/salesSkus`);

    const unsubscribe: Unsubscribe = onSnapshot(skusRef, (snapshot) => {
      const data: SalesSku[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as SalesSku);
      });
      setSkus(data);
      setLoading(false);
    }, (error) => {
      console.error("useSalesSkus onSnapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  async function addSku(sku: SalesSkuInput) {
    if (!user) throw new Error("Must be authenticated");
    const skusRef = collection(db, `users/${user.uid}/salesSkus`);
    const now = new Date().toISOString();
    const docRef = await addDoc(skusRef, { ...sku, createdAt: now, updatedAt: now });
    return docRef.id;
  }

  async function updateSku(id: string, data: Partial<SalesSku>) {
    if (!user) throw new Error("Must be authenticated");
    const skuRef = doc(db, `users/${user.uid}/salesSkus`, id);
    await updateDoc(skuRef, { ...data, updatedAt: new Date().toISOString() });
  }

  async function removeSku(id: string) {
    if (!user) throw new Error("Must be authenticated");
    const skuRef = doc(db, `users/${user.uid}/salesSkus`, id);
    await deleteDoc(skuRef);
  }

  const getSkuById = useCallback(
    async (id: string) => {
      if (!user) throw new Error("Must be authenticated");
      const skuRef = doc(db, `users/${user.uid}/salesSkus`, id);
      const docSnap = await getDoc(skuRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as SalesSku;
      }
      return null;
    },
    [user],
  );

  return { skus, loading, add: addSku, update: updateSku, remove: removeSku, getById: getSkuById };
}
