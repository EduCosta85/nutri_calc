import type { ProductionOrderStatus } from "../types/common";

/** Production order phase flow — valid state transitions */
const PHASE_FLOW: Partial<Record<ProductionOrderStatus, ProductionOrderStatus>> = {
  NEW: "SEPARATING",
  SEPARATING: "PRODUCING",
  PRODUCING: "FINISHING",
};

/** Get the next valid status for a production order, or null if cannot advance */
export function getNextPhase(currentStatus: ProductionOrderStatus): ProductionOrderStatus | null {
  return PHASE_FLOW[currentStatus] ?? null;
}

/** Check if a production order can be cancelled from its current status */
export function canCancel(status: ProductionOrderStatus): boolean {
  return status !== "COMPLETED" && status !== "CANCELLED";
}

/** Check if a production order can advance to the next phase */
export function canAdvance(status: ProductionOrderStatus): boolean {
  return status in PHASE_FLOW;
}

/** Check if separation is required (materials were separated) */
export function wasSeparated(status: ProductionOrderStatus): boolean {
  return status !== "NEW";
}

/**
 * Calculate production cost from actual ingredient usage.
 * cost = SUM(actualUsed * ingredientAverageCost) / actualOutputQuantity
 */
export function calcProductionCost(
  ingredients: Array<{
    actualQuantity: number;
    returnedQuantity: number;
    lossQuantity: number;
    averageCost: number;
  }>,
  actualOutputQuantity: number,
): number {
  if (actualOutputQuantity <= 0) return 0;

  let totalCost = 0;
  for (const ingredient of ingredients) {
    const actualUsed = ingredient.actualQuantity - ingredient.returnedQuantity - ingredient.lossQuantity;
    totalCost += Math.max(0, actualUsed) * ingredient.averageCost;
  }

  return totalCost / actualOutputQuantity;
}

/**
 * Calculate planned ingredient quantities from recipe and target quantity.
 * Each recipe ingredient quantity is multiplied by the target quantity.
 */
export function calcPlannedIngredients(
  recipeIngredients: Array<{ ingredientId: string; quantity: number }>,
  targetQuantity: number,
): Array<{ ingredientId: string; plannedQuantity: number }> {
  return recipeIngredients.map((ri) => ({
    ingredientId: ri.ingredientId,
    plannedQuantity: ri.quantity * targetQuantity,
  }));
}
