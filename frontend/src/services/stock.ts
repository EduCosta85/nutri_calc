import type { StockLot } from "../types/inventory";

/** Calculate weighted average cost across all lots for an item */
export function calcWeightedAverageCost(lots: StockLot[]): number {
  const activeLots = lots.filter((lot) => lot.quantity > 0);
  if (activeLots.length === 0) return 0;

  const totalValue = activeLots.reduce((sum, lot) => sum + lot.quantity * lot.unitCost, 0);
  const totalQuantity = activeLots.reduce((sum, lot) => sum + lot.quantity, 0);

  if (totalQuantity === 0) return 0;
  return totalValue / totalQuantity;
}

/** Calculate total available stock for an item across all lots */
export function calcTotalStock(lots: StockLot[]): number {
  return lots.reduce((sum, lot) => sum + Math.max(0, lot.quantity), 0);
}

/** Sort lots by entry date ascending (FIFO — oldest first) */
export function sortLotsFIFO(lots: StockLot[]): StockLot[] {
  return [...lots]
    .filter((lot) => lot.quantity > 0)
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
}

/**
 * FIFO stock deduction — deducts quantity from oldest lots first.
 * Returns the lot deductions to apply, or null if insufficient stock.
 */
export function calcFIFODeduction(
  lots: StockLot[],
  requiredQuantity: number,
): { lotId: string; quantity: number }[] | null {
  const sorted = sortLotsFIFO(lots);
  const deductions: { lotId: string; quantity: number }[] = [];
  let remaining = requiredQuantity;

  for (const lot of sorted) {
    if (remaining <= 0) break;
    if (!lot.id) continue;

    const toDeduct = Math.min(lot.quantity, remaining);
    deductions.push({ lotId: lot.id, quantity: toDeduct });
    remaining -= toDeduct;
  }

  if (remaining > 0.0001) return null; // Insufficient stock
  return deductions;
}

/**
 * Proportional stock return — distributes returned quantity back to original lots.
 * Used when cancelling orders or returning production surplus.
 */
export function calcProportionalReturn(
  lotUsages: { lotId: string; quantity: number }[],
  returnQuantity: number,
): { lotId: string; quantity: number }[] {
  const totalUsed = lotUsages.reduce((sum, u) => sum + u.quantity, 0);
  if (totalUsed === 0) return [];

  return lotUsages.map((usage) => ({
    lotId: usage.lotId,
    quantity: (usage.quantity / totalUsed) * returnQuantity,
  }));
}
