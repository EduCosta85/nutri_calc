import { db } from "../db";
import type { NutritionInfo, Recipe, RecipeIngredient } from "../types";

const EMPTY: NutritionInfo = {
  calories: 0,
  carbs: 0,
  totalSugars: 0,
  addedSugars: 0,
  protein: 0,
  totalFat: 0,
  saturatedFat: 0,
  transFat: 0,
  fiber: 0,
  sodium: 0,
};

const KEYS = Object.keys(EMPTY) as (keyof NutritionInfo)[];

function scale(info: NutritionInfo, factor: number): NutritionInfo {
  const out = { ...EMPTY };
  for (const k of KEYS) out[k] = info[k] * factor;
  return out;
}

function sum(a: NutritionInfo, b: NutritionInfo): NutritionInfo {
  const out = { ...EMPTY };
  for (const k of KEYS) out[k] = a[k] + b[k];
  return out;
}

async function calcIngredient(
  ingredient: RecipeIngredient,
  visited: Set<number>,
): Promise<NutritionInfo> {
  if (ingredient.type === "raw_material") {
    const mat = await db.rawMaterials.get(ingredient.referenceId);
    if (!mat) return EMPTY;
    const factor = ingredient.quantity / 100;
    return {
      calories: mat.caloriesPer100g * factor,
      carbs: mat.carbsPer100g * factor,
      totalSugars: mat.totalSugarsPer100g * factor,
      addedSugars: mat.addedSugarsPer100g * factor,
      protein: mat.proteinPer100g * factor,
      totalFat: mat.totalFatPer100g * factor,
      saturatedFat: mat.saturatedFatPer100g * factor,
      transFat: mat.transFatPer100g * factor,
      fiber: mat.fiberPer100g * factor,
      sodium: mat.sodiumPer100g * factor,
    };
  }

  if (visited.has(ingredient.referenceId)) return EMPTY;

  const recipe = await db.recipes.get(ingredient.referenceId);
  if (!recipe || recipe.yieldGrams === 0) return EMPTY;

  const recipeTotal = await calcRecipeNutrition(recipe, new Set(visited));
  return scale(recipeTotal, ingredient.quantity / recipe.yieldGrams);
}

export async function calcRecipeNutrition(
  recipe: Recipe,
  visited: Set<number> = new Set(),
): Promise<NutritionInfo> {
  if (recipe.id !== undefined) visited.add(recipe.id);

  let total = { ...EMPTY };
  for (const ingredient of recipe.ingredients) {
    total = sum(total, await calcIngredient(ingredient, visited));
  }
  return total;
}

export function nutritionPer100g(
  total: NutritionInfo,
  yieldGrams: number,
): NutritionInfo {
  if (yieldGrams === 0) return EMPTY;
  return scale(total, 100 / yieldGrams);
}
