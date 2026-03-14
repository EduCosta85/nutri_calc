// ============================================================
// Legacy types — kept for backward compatibility
// New code should import from types/ directory
// ============================================================

export interface RawMaterial {
  id?: string | number;
  name: string;
  unit: string;
  tags: string[];
  pricePer100g: number;
  caloriesPer100g: number;
  carbsPer100g: number;
  totalSugarsPer100g: number;
  addedSugarsPer100g: number;
  proteinPer100g: number;
  totalFatPer100g: number;
  saturatedFatPer100g: number;
  transFatPer100g: number;
  fiberPer100g: number;
  sodiumPer100g: number;
  /** Extended nutritional fields (optional) */
  monounsaturatedFatPer100g?: number;
  polyunsaturatedFatPer100g?: number;
  cholesterolPer100g?: number;
  calciumPer100g?: number;
  ironPer100g?: number;
}

export interface RecipeIngredient {
  type: "raw_material" | "recipe";
  referenceId: string | number;
  quantity: number;
}

export interface Recipe {
  id?: string | number;
  name: string;
  tags: string[];
  yieldGrams: number;
  servingSize: number;
  servingName: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  prepTimeMin: number;
  photo?: string | null;
}

export interface NutritionInfo {
  calories: number;
  carbs: number;
  totalSugars: number;
  addedSugars: number;
  protein: number;
  totalFat: number;
  saturatedFat: number;
  transFat: number;
  fiber: number;
  sodium: number;
  /** Extended fields (optional) */
  monounsaturatedFat?: number;
  polyunsaturatedFat?: number;
  cholesterol?: number;
  calcium?: number;
  iron?: number;
}

/** Labels and units following ANVISA RDC 429/2020 order */
export const NUTRITION_ROWS: ReadonlyArray<{
  key: keyof NutritionInfo;
  label: string;
  unit: string;
}> = [
  { key: "calories", label: "Valor energetico", unit: "kcal" },
  { key: "carbs", label: "Carboidratos", unit: "g" },
  { key: "totalSugars", label: "Acucares totais", unit: "g" },
  { key: "addedSugars", label: "Acucares adicionados", unit: "g" },
  { key: "protein", label: "Proteinas", unit: "g" },
  { key: "totalFat", label: "Gorduras totais", unit: "g" },
  { key: "saturatedFat", label: "Gorduras saturadas", unit: "g" },
  { key: "transFat", label: "Gorduras trans", unit: "g" },
  { key: "fiber", label: "Fibra alimentar", unit: "g" },
  { key: "sodium", label: "Sodio", unit: "mg" },
];

// Re-export all new module types
export type { ItemType, UnitOfMeasure, ProductionOrderStatus, ProductionOrderPhase, SaleStatus, SalesIntentionStatus, CustomerOrderStatus, StockDisposition, DeliveryType } from "./types/common";
export { UNITS } from "./types/common";
export type { InventoryItem, NutritionalInfo, ProductRecipeIngredient, StockLot, StockMovement, StockMovementSource, InventoryItemInput, StockLotInput, StockMovementInput } from "./types/inventory";
export type { ProductionOrder, ProductionOrderIngredient, ProductionOrderLotUsage, ProductionOrderTimeTracking, ProductionOrderOutput, ProductionOrderInput, ProductionOrderIngredientInput, ProductionOrderLotUsageInput, ProductionOrderTimeTrackingInput, ProductionOrderOutputInput } from "./types/production";
export type { SalesSku, SalesSkuComponent, QuickSale, QuickSaleItem, SaleStockMovement, SalesSkuAvailability, CartItem, SalesSkuInput, SalesSkuComponentInput, QuickSaleInput, QuickSaleItemInput, SaleStockMovementInput } from "./types/sales";
export type { Customer, CustomerAddress, PickupPoint, CustomerInput, CustomerAddressInput, PickupPointInput } from "./types/customers";
export type { SalesIntention, CustomerOrder, CustomerOrderItem, CustomerOrderStockMovement, CustomerOrderCancellation, SalesIntentionAggregation, SalesIntentionInput, CustomerOrderInput, CustomerOrderItemInput, CustomerOrderStockMovementInput, CustomerOrderCancellationInput } from "./types/orders";
export type { AppSettings, AppSettingsInput } from "./types/settings";
export { DEFAULT_APP_SETTINGS } from "./types/settings";
