import { useCallback, useEffect, useState } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import type { ProductionOrder, ProductionOrderInput } from "../types/production";
import type { ProductionOrderStatus } from "../types/common";
import { nextProductionOrderNumber } from "../services/auto-numbering";

export function useProductionOrders(filterStatus?: ProductionOrderStatus) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const ordersRef = collection(db, `users/${user.uid}/productionOrders`);
    const q = filterStatus
      ? query(ordersRef, where("status", "==", filterStatus))
      : query(ordersRef);

    const unsubscribe: Unsubscribe = onSnapshot(q, (snapshot) => {
      const data: ProductionOrder[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as ProductionOrder);
      });
      setOrders(data);
      setLoading(false);
    }, (error) => {
      console.error("useProductionOrders onSnapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, filterStatus]);

  async function addOrder(input: ProductionOrderInput) {
    if (!user) throw new Error("Must be authenticated");
    const ordersRef = collection(db, `users/${user.uid}/productionOrders`);
    const now = new Date().toISOString();
    const orderNumber = nextProductionOrderNumber(orders.length);

    const docRef = await addDoc(ordersRef, {
      ...input,
      orderNumber,
      status: "NEW" as ProductionOrderStatus,
      totalPausedSeconds: 0,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async function updateOrder(id: string, data: Partial<ProductionOrder>) {
    if (!user) throw new Error("Must be authenticated");
    const orderRef = doc(db, `users/${user.uid}/productionOrders`, id);
    await updateDoc(orderRef, { ...data, updatedAt: new Date().toISOString() });
  }

  async function updateStatus(id: string, status: ProductionOrderStatus) {
    const data: Partial<ProductionOrder> = { status };
    if (status === "COMPLETED") {
      data.completedAt = new Date().toISOString();
    }
    await updateOrder(id, data);
  }

  async function removeOrder(id: string) {
    if (!user) throw new Error("Must be authenticated");
    const orderRef = doc(db, `users/${user.uid}/productionOrders`, id);
    await deleteDoc(orderRef);
  }

  /** Start the timer for a production order */
  async function startTimer(id: string) {
    await updateOrder(id, { timerStartedAt: new Date().toISOString(), timerPausedAt: null });
  }

  /** Pause the timer */
  async function pauseTimer(id: string) {
    await updateOrder(id, { timerPausedAt: new Date().toISOString() });
  }

  /** Resume the timer (accumulate paused time) */
  async function resumeTimer(id: string) {
    const order = orders.find((o) => o.id === id);
    if (!order?.timerPausedAt) return;

    const pausedAt = new Date(order.timerPausedAt).getTime();
    const currentPauseDuration = Math.floor((Date.now() - pausedAt) / 1000);
    const newTotalPaused = order.totalPausedSeconds + currentPauseDuration;

    await updateOrder(id, { timerPausedAt: null, totalPausedSeconds: newTotalPaused });
  }

  const getOrderById = useCallback(
    async (id: string) => {
      if (!user) throw new Error("Must be authenticated");
      const orderRef = doc(db, `users/${user.uid}/productionOrders`, id);
      const docSnap = await getDoc(orderRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ProductionOrder;
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
    remove: removeOrder,
    startTimer,
    pauseTimer,
    resumeTimer,
    getById: getOrderById,
  };
}
