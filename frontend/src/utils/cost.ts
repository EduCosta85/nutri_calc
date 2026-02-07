import { db } from "../db";
import type { Recipe, RecipeIngredient } from "../types";

async function calcIngredientCost(
  ingredient: RecipeIngredient,
  visited: Set<number>,
): Promise<number> {
  if (ingredient.type === "raw_material") {
    const mat = await db.rawMaterials.get(ingredient.referenceId);
    if (!mat) return 0;
    return (mat.pricePer100g ?? 0) * (ingredient.quantity / 100);
  }

  if (visited.has(ingredient.referenceId)) return 0;

  const recipe = await db.recipes.get(ingredient.referenceId);
  if (!recipe || recipe.yieldGrams === 0) return 0;

  const recipeTotalCost = await calcRecipeCost(recipe, new Set(visited));
  return recipeTotalCost * (ingredient.quantity / recipe.yieldGrams);
}

/** Calculate total cost of a recipe (recursive, handles sub-recipes) */
export async function calcRecipeCost(
  recipe: Recipe,
  visited: Set<number> = new Set(),
): Promise<number> {
  if (recipe.id !== undefined) visited.add(recipe.id);

  let total = 0;
  for (const ingredient of recipe.ingredients) {
    total += await calcIngredientCost(ingredient, visited);
  }
  return total;
}
