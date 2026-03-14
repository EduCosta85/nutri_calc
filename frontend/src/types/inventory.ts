import type { ItemType, TimestampFields } from "./common";

/** Unified inventory item — raw materials, products, and packaging */
export interface InventoryItem extends TimestampFields {
  id?: string;
  name: string;
  type: ItemType;
  unit: string;
  averageCost: number;
  photoUri?: string | null;
  lowStockThreshold: number;
  expiryWarningDays: number;
  tags: string[];
  /** Nutritional info (per 100g/ml) — only for raw materials */
  nutritionalInfo?: NutritionalInfo;
  /** Recipe ingredients (only for products) */
  recipeIngredients?: ProductRecipeIngredient[];
}

/** Extended nutritional info — ANVISA RDC 429/2020 + optional extras */
export interface NutritionalInfo {
  energyValue: number;
  carbohydrates: number;
  totalSugars: number;
  addedSugars: number;
  proteins: number;
  totalFat: number;
  saturatedFat: number;
  transFat: number;
  fiber: number;
  sodium: number;
  /** Optional extended fields */
  monounsaturatedFat?: number;
  polyunsaturatedFat?: number;
  cholesterol?: number;
  calcium?: number;
  iron?: number;
}

/** Recipe composition: product -> ingredient mapping */
export interface ProductRecipeIngredient {
  ingredientId: string;
  quantity: number;
}

/** Stock lot — individual lot with expiry and cost tracking */
export interface StockLot extends TimestampFields {
  id?: string;
  itemId: string;
  lotNumber: string;
  quantity: number;
  unitCost: number;
  expiryDate?: string | null;
  entryDate: string;
}

/** Stock movement — tracks all entries and exits */
export interface StockMovement {
  id?: string;
  itemId: string;
  lotId: string;
  quantity: number;
  /** positive = entry, negative = exit */
  direction: "entry" | "exit";
  source: StockMovementSource;
  sourceId?: string;
  createdAt: string;
}

export type StockMovementSource =
  | "manual"
  | "production_input"
  | "production_output"
  | "production_return"
  | "sale"
  | "sale_cancellation"
  | "order_separation"
  | "order_cancellation";

/** Input types (Omit auto-generated fields) */
export type InventoryItemInput = Omit<InventoryItem, "id" | "createdAt" | "updatedAt" | "averageCost">;
export type StockLotInput = Omit<StockLot, "id" | "createdAt" | "updatedAt">;
export type StockMovementInput = Omit<StockMovement, "id">;
