import type { NutritionInfo } from "../types";

/**
 * ANVISA IN 75/2020 rounding rules for nutritional labeling.
 *
 * Rules per nutrient:
 * - Calories: <5 kcal → "0", 5-50 → round to nearest 1, >50 → round to nearest 5
 * - Carbs/Sugars/Protein/Fat/Fiber: <0.5g → "0", >=0.5 → round to nearest 0.1
 * - Saturated/Trans fat: <0.1g → "0", >=0.1 → round to nearest 0.1
 * - Sodium: <5mg → "0", 5-140 → round to nearest 1, >140 → round to nearest 5
 */

function roundToNearest(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function roundCalories(value: number): number {
  if (value < 5) return 0;
  if (value <= 50) return Math.round(value);
  return roundToNearest(value, 5);
}

function roundGrams(value: number): number {
  if (value < 0.5) return 0;
  return Math.round(value * 10) / 10;
}

function roundFatSub(value: number): number {
  if (value < 0.1) return 0;
  return Math.round(value * 10) / 10;
}

function roundSodium(value: number): number {
  if (value < 5) return 0;
  if (value <= 140) return Math.round(value);
  return roundToNearest(value, 5);
}

/** Apply ANVISA IN 75/2020 rounding rules to a NutritionInfo (per serving or per 100g) */
export function roundAnvisa(info: NutritionInfo): NutritionInfo {
  return {
    calories: roundCalories(info.calories),
    carbs: roundGrams(info.carbs),
    totalSugars: roundGrams(info.totalSugars),
    addedSugars: roundGrams(info.addedSugars),
    protein: roundGrams(info.protein),
    totalFat: roundGrams(info.totalFat),
    saturatedFat: roundFatSub(info.saturatedFat),
    transFat: roundFatSub(info.transFat),
    fiber: roundGrams(info.fiber),
    sodium: roundSodium(info.sodium),
  };
}

/**
 * ANVISA front-of-pack (FoP) warning thresholds - IN 75/2020 Art. 18.
 * Values are per 100g of the final product.
 * If any threshold is exceeded, the corresponding "lupa" (magnifying glass) icon is required.
 */
export const FOP_THRESHOLDS = {
  addedSugars: 15, // g per 100g
  saturatedFat: 6, // g per 100g
  sodium: 600,     // mg per 100g
} as const;

export type FopWarning = "addedSugars" | "saturatedFat" | "sodium";

const FOP_LABELS: Record<FopWarning, string> = {
  addedSugars: "ALTO EM ACUCAR ADICIONADO",
  saturatedFat: "ALTO EM GORDURA SATURADA",
  sodium: "ALTO EM SODIO",
};

export interface FopResult {
  warning: FopWarning;
  label: string;
  valuePer100g: number;
  threshold: number;
}

/** Calculate which front-of-pack warnings apply given nutrition per 100g */
export function calcFopWarnings(per100g: NutritionInfo): FopResult[] {
  const warnings: FopResult[] = [];

  if (per100g.addedSugars >= FOP_THRESHOLDS.addedSugars) {
    warnings.push({
      warning: "addedSugars",
      label: FOP_LABELS.addedSugars,
      valuePer100g: per100g.addedSugars,
      threshold: FOP_THRESHOLDS.addedSugars,
    });
  }

  if (per100g.saturatedFat >= FOP_THRESHOLDS.saturatedFat) {
    warnings.push({
      warning: "saturatedFat",
      label: FOP_LABELS.saturatedFat,
      valuePer100g: per100g.saturatedFat,
      threshold: FOP_THRESHOLDS.saturatedFat,
    });
  }

  if (per100g.sodium >= FOP_THRESHOLDS.sodium) {
    warnings.push({
      warning: "sodium",
      label: FOP_LABELS.sodium,
      valuePer100g: per100g.sodium,
      threshold: FOP_THRESHOLDS.sodium,
    });
  }

  return warnings;
}
