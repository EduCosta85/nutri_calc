import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import type { Recipe } from "../types";

export function useRecipes() {
  const recipes = useLiveQuery(() => db.recipes.toArray()) ?? [];

  async function add(recipe: Omit<Recipe, "id">) {
    return db.recipes.add(recipe as Recipe);
  }

  async function update(id: number, recipe: Omit<Recipe, "id">) {
    return db.recipes.update(id, recipe);
  }

  async function remove(id: number) {
    return db.recipes.delete(id);
  }

  async function getById(id: number) {
    return db.recipes.get(id);
  }

  return { recipes, add, update, remove, getById };
}
