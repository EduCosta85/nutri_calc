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
import type { InventoryItem, InventoryItemInput } from "../types/inventory";
import type { ItemType } from "../types/common";

export function useInventoryItems(filterType?: ItemType) {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    const itemsRef = collection(db, `users/${user.uid}/inventoryItems`);
    const q = filterType
      ? query(itemsRef, where("type", "==", filterType))
      : query(itemsRef);

    const unsubscribe: Unsubscribe = onSnapshot(q, (snapshot) => {
      const data: InventoryItem[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as InventoryItem);
      });
      setItems(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, filterType]);

  async function addItem(item: InventoryItemInput) {
    if (!user) throw new Error("Must be authenticated");
    const itemsRef = collection(db, `users/${user.uid}/inventoryItems`);
    const now = new Date().toISOString();
    const docRef = await addDoc(itemsRef, {
      ...item,
      averageCost: 0,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async function updateItem(id: string, data: Partial<InventoryItem>) {
    if (!user) throw new Error("Must be authenticated");
    const itemRef = doc(db, `users/${user.uid}/inventoryItems`, id);
    await updateDoc(itemRef, { ...data, updatedAt: new Date().toISOString() });
  }

  async function removeItem(id: string) {
    if (!user) throw new Error("Must be authenticated");
    const itemRef = doc(db, `users/${user.uid}/inventoryItems`, id);
    await deleteDoc(itemRef);
  }

  const getItemById = useCallback(
    async (id: string) => {
      if (!user) throw new Error("Must be authenticated");
      const itemRef = doc(db, `users/${user.uid}/inventoryItems`, id);
      const docSnap = await getDoc(itemRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as InventoryItem;
      }
      return null;
    },
    [user],
  );

  return { items, loading, add: addItem, update: updateItem, remove: removeItem, getById: getItemById };
}
