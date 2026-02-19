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
import type { RawMaterial } from "../types";
import { setMaterialsCache } from "../utils/nutrition";
import { setMaterialsCache as setCostMaterialsCache } from "../utils/cost";

export function useRawMaterials() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMaterials([]);
      setLoading(false);
      return;
    }

    const materialsRef = collection(db, `users/${user.uid}/rawMaterials`);

    const unsubscribe: Unsubscribe = onSnapshot(materialsRef, (snapshot) => {
      const materialsData: RawMaterial[] = [];
      snapshot.forEach((doc) => {
        materialsData.push({ id: doc.id, ...doc.data() } as RawMaterial);
      });
      setMaterials(materialsData);
      setLoading(false);
      
      // Update caches for nutrition/cost calculations
      setMaterialsCache(materialsData);
      setCostMaterialsCache(materialsData);
    });

    return () => unsubscribe();
  }, [user]);

  async function addMaterial(material: Omit<RawMaterial, "id">) {
    if (!user) throw new Error("Must be authenticated");
    const materialsRef = collection(db, `users/${user.uid}/rawMaterials`);
    const docRef = await addDoc(materialsRef, material);
    return docRef.id;
  }

  async function updateMaterial(id: string, material: Omit<RawMaterial, "id">) {
    if (!user) throw new Error("Must be authenticated");
    const materialRef = doc(db, `users/${user.uid}/rawMaterials`, id);
    await updateDoc(materialRef, material);
  }

  async function removeMaterial(id: string) {
    if (!user) throw new Error("Must be authenticated");
    const materialRef = doc(db, `users/${user.uid}/rawMaterials`, id);
    await deleteDoc(materialRef);
  }

  const getMaterialById = useCallback(async (id: string) => {
    if (!user) throw new Error("Must be authenticated");
    const materialRef = doc(db, `users/${user.uid}/rawMaterials`, id);
    const docSnap = await getDoc(materialRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as RawMaterial;
    }
    return null;
  }, [user]);

  return { materials, loading, add: addMaterial, update: updateMaterial, remove: removeMaterial, getById: getMaterialById };
}
