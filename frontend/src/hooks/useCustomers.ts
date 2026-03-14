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
import type { Customer, CustomerInput } from "../types/customers";

export function useCustomers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    const customersRef = collection(db, `users/${user.uid}/customers`);

    const unsubscribe: Unsubscribe = onSnapshot(customersRef, (snapshot) => {
      const data: Customer[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Customer);
      });
      setCustomers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  async function addCustomer(customer: CustomerInput) {
    if (!user) throw new Error("Must be authenticated");
    const customersRef = collection(db, `users/${user.uid}/customers`);
    const now = new Date().toISOString();
    const docRef = await addDoc(customersRef, { ...customer, createdAt: now, updatedAt: now });
    return docRef.id;
  }

  async function updateCustomer(id: string, data: Partial<Customer>) {
    if (!user) throw new Error("Must be authenticated");
    const customerRef = doc(db, `users/${user.uid}/customers`, id);
    await updateDoc(customerRef, { ...data, updatedAt: new Date().toISOString() });
  }

  async function removeCustomer(id: string) {
    if (!user) throw new Error("Must be authenticated");
    const customerRef = doc(db, `users/${user.uid}/customers`, id);
    await deleteDoc(customerRef);
  }

  const getCustomerById = useCallback(
    async (id: string) => {
      if (!user) throw new Error("Must be authenticated");
      const customerRef = doc(db, `users/${user.uid}/customers`, id);
      const docSnap = await getDoc(customerRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Customer;
      }
      return null;
    },
    [user],
  );

  return { customers, loading, add: addCustomer, update: updateCustomer, remove: removeCustomer, getById: getCustomerById };
}
