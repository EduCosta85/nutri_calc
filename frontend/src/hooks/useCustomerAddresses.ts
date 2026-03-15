import { useEffect, useState } from "react";
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
import type { CustomerAddress, CustomerAddressInput } from "../types/customers";

export function useCustomerAddresses(customerId?: string) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !customerId) {
      setAddresses([]);
      setLoading(false);
      return;
    }
    const ref = collection(db, `users/${user.uid}/customerAddresses`);
    const q = query(ref, where("customerId", "==", customerId));
    const unsub: Unsubscribe = onSnapshot(q, (snap) => {
      const data: CustomerAddress[] = [];
      snap.forEach((d) => data.push({ id: d.id, ...d.data() } as CustomerAddress));
      setAddresses(data);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [user, customerId]);

  async function addAddress(input: CustomerAddressInput) {
    if (!user) throw new Error("Must be authenticated");
    const ref = collection(db, `users/${user.uid}/customerAddresses`);
    const now = new Date().toISOString();
    const docRef = await addDoc(ref, { ...input, createdAt: now, updatedAt: now });
    return docRef.id;
  }

  async function updateAddress(id: string, data: Partial<CustomerAddress>) {
    if (!user) throw new Error("Must be authenticated");
    const docRef = doc(db, `users/${user.uid}/customerAddresses`, id);
    await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  }

  async function removeAddress(id: string) {
    if (!user) throw new Error("Must be authenticated");
    await deleteDoc(doc(db, `users/${user.uid}/customerAddresses`, id));
  }

  return { addresses, loading, add: addAddress, update: updateAddress, remove: removeAddress };
}
