import { describe, it, expect, beforeEach } from "vitest";
import {
  calcRecipeNutrition,
  nutritionPer100g,
  setMaterialsCache,
  setRecipesCache,
} from "./nutrition";
import type { RawMaterial, Recipe } from "../types";

// Helper to build a minimal RawMaterial
function mat(
  id: string,
  unit: string,
  overrides: Partial<RawMaterial> = {},
): RawMaterial {
  return {
    id,
    name: `Material ${id}`,
    unit,
    caloriesPer100g: 0,
    carbsPer100g: 0,
    totalSugarsPer100g: 0,
    addedSugarsPer100g: 0,
    proteinPer100g: 0,
    totalFatPer100g: 0,
    saturatedFatPer100g: 0,
    transFatPer100g: 0,
    fiberPer100g: 0,
    sodiumPer100g: 0,
    pricePer100g: 0,
    tags: [],
    ...overrides,
  };
}

// Helper to build a minimal Recipe
function recipe(
  id: string,
  yieldGrams: number,
  ingredients: Recipe["ingredients"],
): Recipe {
  return {
    id,
    name: `Recipe ${id}`,
    tags: [],
    yieldGrams,
    servingSize: 100,
    servingName: "100g",
    ingredients,
    steps: [],
    prepTimeMin: 0,
    photo: null,
  };
}

beforeEach(() => {
  setMaterialsCache([]);
  setRecipesCache([]);
});

describe("calcRecipeNutrition", () => {
  // Given a material in grams with known calorie density
  // When used as ingredient with 100g quantity
  // Then calories should equal the density value
  it("calculates calories correctly for a material in grams", async () => {
    const material = mat("m1", "g", { caloriesPer100g: 10 });
    setMaterialsCache([material]);

    const r = recipe("r1", 100, [
      { type: "raw_material", referenceId: "m1", quantity: 100 },
    ]);

    const result = await calcRecipeNutrition(r);
    expect(result.calories).toBeCloseTo(10);
  });

  // Given a material in millilitres (e.g. milk: 64 kcal/100ml)
  // When 200ml are used as ingredient
  // Then calories should be 128 (200/100 * 64)
  it("calculates calories correctly for a material in ml", async () => {
    const milk = mat("m2", "ml", { caloriesPer100g: 64 });
    setMaterialsCache([milk]);

    const r = recipe("r1", 200, [
      { type: "raw_material", referenceId: "m2", quantity: 200 },
    ]);

    const result = await calcRecipeNutrition(r);
    expect(result.calories).toBeCloseTo(128);
  });

  // Given a material in units (e.g. eggs: 155 kcal/100un)
  // When 2 units are used as ingredient
  // Then calories should be 3.1 (2/100 * 155)
  it("calculates calories correctly for a material in units", async () => {
    const egg = mat("m3", "un", { caloriesPer100g: 155 });
    setMaterialsCache([egg]);

    const r = recipe("r1", 100, [
      { type: "raw_material", referenceId: "m3", quantity: 2 },
    ]);

    const result = await calcRecipeNutrition(r);
    expect(result.calories).toBeCloseTo(3.1);
  });

  // Given a sub-recipe with known nutrition
  // When used as ingredient in an outer recipe
  // Then the outer recipe nutrition should scale the sub-recipe proportionally
  it("resolves sub-recipe ingredients recursively", async () => {
    // Sub-recipe: 100g yield, uses 100g of a 10-kcal/100g material → 10 kcal total
    const material = mat("m1", "g", { caloriesPer100g: 10 });
    setMaterialsCache([material]);

    const sub = recipe("r_sub", 100, [
      { type: "raw_material", referenceId: "m1", quantity: 100 },
    ]);

    // Outer recipe uses 50g of sub-recipe (half of its 100g yield → 5 kcal)
    const outer = recipe("r_outer", 50, [
      { type: "recipe", referenceId: "r_sub", quantity: 50 },
    ]);

    setRecipesCache([sub, outer]);

    const result = await calcRecipeNutrition(outer);
    expect(result.calories).toBeCloseTo(5);
  });

  // Given an ingredient whose ID is not in the cache
  // When nutrition is calculated
  // Then it should return zero for that ingredient (graceful degradation)
  it("returns zero for ingredients not found in cache", async () => {
    setMaterialsCache([]); // empty cache

    const r = recipe("r1", 100, [
      { type: "raw_material", referenceId: "non_existent", quantity: 100 },
    ]);

    const result = await calcRecipeNutrition(r);
    expect(result.calories).toBe(0);
  });

  // Given recipe A that includes recipe B and recipe B that includes recipe A
  // When nutrition is calculated
  // Then it should not enter an infinite loop (circular reference protection)
  it("does not loop infinitely on circular recipe references", async () => {
    const rA = recipe("rA", 100, [
      { type: "recipe", referenceId: "rB", quantity: 50 },
    ]);
    const rB = recipe("rB", 100, [
      { type: "recipe", referenceId: "rA", quantity: 50 },
    ]);
    setRecipesCache([rA, rB]);

    // Should resolve without hanging or stack overflow
    const result = await calcRecipeNutrition(rA);
    expect(result.calories).toBe(0); // no raw materials, so 0 kcal
  });
});

describe("nutritionPer100g", () => {
  it("scales nutrition to a 100g basis", () => {
    const total = {
      calories: 200,
      carbs: 20,
      totalSugars: 10,
      addedSugars: 5,
      protein: 10,
      totalFat: 8,
      saturatedFat: 2,
      transFat: 0,
      fiber: 3,
      sodium: 0.5,
    };

    const per100 = nutritionPer100g(total, 200);
    expect(per100.calories).toBeCloseTo(100);
    expect(per100.carbs).toBeCloseTo(10);
  });

  it("returns zeros when yieldGrams is 0 (avoids division by zero)", () => {
    const total = {
      calories: 100,
      carbs: 10,
      totalSugars: 5,
      addedSugars: 2,
      protein: 5,
      totalFat: 3,
      saturatedFat: 1,
      transFat: 0,
      fiber: 1,
      sodium: 0.2,
    };

    const per100 = nutritionPer100g(total, 0);
    expect(per100.calories).toBe(0);
  });
});
