import { useCallback, useEffect, useState } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import type { QuickSale, QuickSaleInput } from "../types/sales";
import type { SaleStatus } from "../types/common";
import { nextSaleNumber } from "../services/auto-numbering";

export function useQuickSales() {
  const { user } = useAuth();
  const [sales, setSales] = useState<QuickSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSales([]);
      setLoading(false);
      return;
    }

    const salesRef = collection(db, `users/${user.uid}/quickSales`);

    const unsubscribe: Unsubscribe = onSnapshot(salesRef, (snapshot) => {
      const data: QuickSale[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as QuickSale);
      });
      setSales(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  async function addSale(input: QuickSaleInput) {
    if (!user) throw new Error("Must be authenticated");
    const salesRef = collection(db, `users/${user.uid}/quickSales`);
    const now = new Date().toISOString();
    const saleNumber = nextSaleNumber(sales.length);

    const docRef = await addDoc(salesRef, {
      ...input,
      saleNumber,
      status: "PENDING" as SaleStatus,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async function updateSale(id: string, data: Partial<QuickSale>) {
    if (!user) throw new Error("Must be authenticated");
    const saleRef = doc(db, `users/${user.uid}/quickSales`, id);
    await updateDoc(saleRef, { ...data, updatedAt: new Date().toISOString() });
  }

  async function updateStatus(id: string, status: SaleStatus) {
    const data: Partial<QuickSale> = { status };
    if (status === "COMPLETED") {
      data.completedAt = new Date().toISOString();
    }
    await updateSale(id, data);
  }

  async function markAsPaid(id: string) {
    await updateSale(id, { paid: true, paidAt: new Date().toISOString() });
  }

  async function markAsDelivered(id: string) {
    await updateSale(id, { delivered: true, deliveredAt: new Date().toISOString() });
  }

  const getSaleById = useCallback(
    async (id: string) => {
      if (!user) throw new Error("Must be authenticated");
      const saleRef = doc(db, `users/${user.uid}/quickSales`, id);
      const docSnap = await getDoc(saleRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as QuickSale;
      }
      return null;
    },
    [user],
  );

  return {
    sales,
    loading,
    add: addSale,
    update: updateSale,
    updateStatus,
    markAsPaid,
    markAsDelivered,
    getById: getSaleById,
  };
}
