import { useCallback, useEffect, useState } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import type { CustomerOrder, CustomerOrderInput } from "../types/orders";
import type { CustomerOrderStatus } from "../types/common";
import { nextOrderNumber } from "../services/auto-numbering";

export function useCustomerOrders(salesIntentionId?: string) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const ordersRef = collection(db, `users/${user.uid}/customerOrders`);
    const q = salesIntentionId
      ? query(ordersRef, where("salesIntentionId", "==", salesIntentionId))
      : query(ordersRef);

    const unsubscribe: Unsubscribe = onSnapshot(q, (snapshot) => {
      const data: CustomerOrder[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as CustomerOrder);
      });
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, salesIntentionId]);

  async function addOrder(input: CustomerOrderInput) {
    if (!user) throw new Error("Must be authenticated");
    const ordersRef = collection(db, `users/${user.uid}/customerOrders`);
    const now = new Date().toISOString();
    const orderNumber = nextOrderNumber(orders.length);

    const docRef = await addDoc(ordersRef, {
      ...input,
      orderNumber,
      status: "INTENTION" as CustomerOrderStatus,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async function updateOrder(id: string, data: Partial<CustomerOrder>) {
    if (!user) throw new Error("Must be authenticated");
    const orderRef = doc(db, `users/${user.uid}/customerOrders`, id);
    await updateDoc(orderRef, { ...data, updatedAt: new Date().toISOString() });
  }

  async function updateStatus(id: string, status: CustomerOrderStatus) {
    await updateOrder(id, { status });
  }

  async function markAsPaid(id: string) {
    await updateOrder(id, { paymentDate: new Date().toISOString() });
  }

  const getOrderById = useCallback(
    async (id: string) => {
      if (!user) throw new Error("Must be authenticated");
      const orderRef = doc(db, `users/${user.uid}/customerOrders`, id);
      const docSnap = await getDoc(orderRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as CustomerOrder;
      }
      return null;
    },
    [user],
  );

  return {
    orders,
    loading,
    add: addOrder,
    update: updateOrder,
    updateStatus,
    markAsPaid,
    getById: getOrderById,
  };
}
