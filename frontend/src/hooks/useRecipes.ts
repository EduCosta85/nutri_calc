import { useEffect, useState } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import type { Recipe } from "../types";
import { setRecipesCache } from "../utils/nutrition";
import { setRecipesCache as setCostRecipesCache } from "../utils/cost";

export function useRecipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRecipes([]);
      setLoading(false);
      return;
    }

    const recipesRef = collection(db, `users/${user.uid}/recipes`);
    const q = query(recipesRef);

    const unsubscribe: Unsubscribe = onSnapshot(q, (snapshot) => {
      const recipesData: Recipe[] = [];
      snapshot.forEach((doc) => {
        recipesData.push({ id: doc.id, ...doc.data() } as Recipe);
      });
      setRecipes(recipesData);
      setLoading(false);
      
      // Update caches for nutrition/cost calculations
      setRecipesCache(recipesData);
      setCostRecipesCache(recipesData);
    });

    return () => unsubscribe();
  }, [user]);

  async function addRecipe(recipe: Omit<Recipe, "id">) {
    if (!user) throw new Error("Must be authenticated");
    const recipesRef = collection(db, `users/${user.uid}/recipes`);
    const docRef = await addDoc(recipesRef, recipe);
    return docRef.id;
  }

  async function updateRecipe(id: string, recipe: Omit<Recipe, "id">) {
    if (!user) throw new Error("Must be authenticated");
    const recipeRef = doc(db, `users/${user.uid}/recipes`, id);
    await updateDoc(recipeRef, recipe);
  }

  async function removeRecipe(id: string) {
    if (!user) throw new Error("Must be authenticated");
    const recipeRef = doc(db, `users/${user.uid}/recipes`, id);
    await deleteDoc(recipeRef);
  }

  async function getRecipeById(id: string) {
    if (!user) throw new Error("Must be authenticated");
    const recipeRef = doc(db, `users/${user.uid}/recipes`, id);
    const docSnap = await getDoc(recipeRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Recipe;
    }
    return null;
  }

  return { recipes, loading, add: addRecipe, update: updateRecipe, remove: removeRecipe, getById: getRecipeById };
}
