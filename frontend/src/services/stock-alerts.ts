import type { InventoryItem, StockLot } from "../types/inventory";

export interface LowStockAlert {
  item: InventoryItem;
  currentStock: number;
  threshold: number;
}

export interface ExpiryAlert {
  item: InventoryItem;
  lot: StockLot;
  daysUntilExpiry: number;
}

/** Detect items with stock below threshold */
export function detectLowStock(
  items: InventoryItem[],
  lotsByItem: Map<string, StockLot[]>,
): LowStockAlert[] {
  const alerts: LowStockAlert[] = [];

  for (const item of items) {
    if (!item.id) continue;
    const lots = lotsByItem.get(item.id) ?? [];
    const totalStock = lots.reduce((sum, lot) => sum + Math.max(0, lot.quantity), 0);

    if (totalStock < item.lowStockThreshold) {
      alerts.push({ item, currentStock: totalStock, threshold: item.lowStockThreshold });
    }
  }

  return alerts;
}

/** Detect lots with expiry date approaching */
export function detectExpiringLots(
  items: InventoryItem[],
  lotsByItem: Map<string, StockLot[]>,
  today: Date = new Date(),
): ExpiryAlert[] {
  const alerts: ExpiryAlert[] = [];

  for (const item of items) {
    if (!item.id) continue;
    const lots = lotsByItem.get(item.id) ?? [];

    for (const lot of lots) {
      if (!lot.expiryDate || lot.quantity <= 0) continue;

      const expiry = new Date(lot.expiryDate);
      const diffMs = expiry.getTime() - today.getTime();
      const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= item.expiryWarningDays) {
        alerts.push({ item, lot, daysUntilExpiry });
      }
    }
  }

  return alerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}
