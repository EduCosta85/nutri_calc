import type { StockLot } from "../types/inventory";
import { calcFIFODeduction } from "./stock";

/**
 * Calculate FIFO lot deductions for a sale cart.
 * For each SKU in the cart, compute the required deductions per component per lot.
 * Returns null if any component has insufficient stock.
 */
export function calcSaleDeductions(
  cartItems: Array<{
    skuId: string;
    quantity: number;
    components: Array<{ inventoryItemId: string; quantityPerSku: number }>;
  }>,
  lotsByItem: Map<string, StockLot[]>,
): {
  deductions: Array<{ itemId: string; lotId: string; quantity: number }>;
  errors: string[];
} | null {
  const deductions: Array<{ itemId: string; lotId: string; quantity: number }> = [];
  const errors: string[] = [];

  // Aggregate total required per inventory item
  const requiredByItem = new Map<string, number>();
  for (const cartItem of cartItems) {
    for (const comp of cartItem.components) {
      const total = comp.quantityPerSku * cartItem.quantity;
      requiredByItem.set(
        comp.inventoryItemId,
        (requiredByItem.get(comp.inventoryItemId) ?? 0) + total,
      );
    }
  }

  // Calculate FIFO deductions per item
  for (const [itemId, requiredQty] of requiredByItem) {
    const lots = lotsByItem.get(itemId) ?? [];
    const fifo = calcFIFODeduction(lots, requiredQty);
    if (!fifo) {
      errors.push(itemId);
      continue;
    }
    for (const d of fifo) {
      deductions.push({ itemId, lotId: d.lotId, quantity: d.quantity });
    }
  }

  if (errors.length > 0) return null;
  return { deductions, errors: [] };
}

/**
 * Validate that all cart items can be fulfilled with available stock.
 */
export function validateCartStock(
  cartItems: Array<{
    skuName: string;
    quantity: number;
    components: Array<{ inventoryItemId: string; itemName: string; quantityPerSku: number }>;
  }>,
  lotsByItem: Map<string, StockLot[]>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const cartItem of cartItems) {
    for (const comp of cartItem.components) {
      const requiredQty = comp.quantityPerSku * cartItem.quantity;
      const lots = lotsByItem.get(comp.inventoryItemId) ?? [];
      const totalStock = lots.reduce((sum, l) => sum + Math.max(0, l.quantity), 0);

      if (totalStock < requiredQty) {
        errors.push(
          `${cartItem.skuName}: estoque insuficiente de ${comp.itemName} (precisa ${requiredQty.toFixed(1)}, tem ${totalStock.toFixed(1)})`,
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
