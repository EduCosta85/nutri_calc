import type { Recipe, RecipeIngredient } from "../types";

// Cache for materials and recipes
let materialsCache: Map<string | number, { pricePer100g: number }> = new Map();
let recipesCache: Map<string | number, Recipe> = new Map();

export function setMaterialsCache(mats: { id?: string | number; pricePer100g: number }[]) {
  materialsCache = new Map(mats.map(m => [m.id!, m]));
}

export function setRecipesCache(recs: Recipe[]) {
  recipesCache = new Map(recs.map(r => [r.id!, r]));
}

async function calcIngredientCost(
  ingredient: RecipeIngredient,
  visited: Set<string | number>,
): Promise<number> {
  if (ingredient.type === "raw_material") {
    const mat = materialsCache.get(ingredient.referenceId);
    if (!mat) return 0;
    return (mat.pricePer100g ?? 0) * (ingredient.quantity / 100);
  }

  if (visited.has(ingredient.referenceId)) return 0;

  const recipe = recipesCache.get(ingredient.referenceId);
  if (!recipe || recipe.yieldGrams === 0) return 0;

  const recipeTotalCost = await calcRecipeCost(recipe, new Set(visited));
  return recipeTotalCost * (ingredient.quantity / recipe.yieldGrams);
}

/** Calculate total cost of a recipe (recursive, handles sub-recipes) */
export async function calcRecipeCost(
  recipe: Recipe,
  visited: Set<string | number> = new Set(),
): Promise<number> {
  if (recipe.id !== undefined) visited.add(recipe.id);

  let total = 0;
  for (const ingredient of recipe.ingredients) {
    total += await calcIngredientCost(ingredient, visited);
  }
  return total;
}
