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
import type { SalesIntention, SalesIntentionInput } from "../types/orders";
import type { SalesIntentionStatus } from "../types/common";

export function useSalesIntentions() {
  const { user } = useAuth();
  const [intentions, setIntentions] = useState<SalesIntention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIntentions([]);
      setLoading(false);
      return;
    }

    const intentionsRef = collection(db, `users/${user.uid}/salesIntentions`);

    const unsubscribe: Unsubscribe = onSnapshot(intentionsRef, (snapshot) => {
      const data: SalesIntention[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as SalesIntention);
      });
      setIntentions(data);
      setLoading(false);
    }, (error) => {
      console.error("useSalesIntentions onSnapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  async function addIntention(input: SalesIntentionInput) {
    if (!user) throw new Error("Must be authenticated");
    const intentionsRef = collection(db, `users/${user.uid}/salesIntentions`);
    const now = new Date().toISOString();

    const docRef = await addDoc(intentionsRef, {
      ...input,
      status: "OPEN" as SalesIntentionStatus,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async function updateIntention(id: string, data: Partial<SalesIntention>) {
    if (!user) throw new Error("Must be authenticated");
    const intentionRef = doc(db, `users/${user.uid}/salesIntentions`, id);
    await updateDoc(intentionRef, { ...data, updatedAt: new Date().toISOString() });
  }

  async function updateStatus(id: string, status: SalesIntentionStatus) {
    const data: Partial<SalesIntention> = { status };
    if (status === "CLOSED") {
      data.closedAt = new Date().toISOString();
    }
    await updateIntention(id, data);
  }

  async function removeIntention(id: string) {
    if (!user) throw new Error("Must be authenticated");
    const intentionRef = doc(db, `users/${user.uid}/salesIntentions`, id);
    await deleteDoc(intentionRef);
  }

  const getIntentionById = useCallback(
    async (id: string) => {
      if (!user) throw new Error("Must be authenticated");
      const intentionRef = doc(db, `users/${user.uid}/salesIntentions`, id);
      const docSnap = await getDoc(intentionRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as SalesIntention;
      }
      return null;
    },
    [user],
  );

  return {
    intentions,
    loading,
    add: addIntention,
    update: updateIntention,
    updateStatus,
    remove: removeIntention,
    getById: getIntentionById,
  };
}
