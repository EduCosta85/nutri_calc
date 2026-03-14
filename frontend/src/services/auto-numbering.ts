/** Sequential auto-numbering for orders, sales, and production */

/** Generate sequential number with prefix and padding */
function formatNumber(prefix: string, count: number, padding = 6): string {
  return `${prefix}${String(count).padStart(padding, "0")}`;
}

/** Generate next sale number: VD000001, VD000002, etc. */
export function nextSaleNumber(currentCount: number): string {
  return formatNumber("VD", currentCount + 1);
}

/** Generate next customer order number: PD000001, PD000002, etc. */
export function nextOrderNumber(currentCount: number): string {
  return formatNumber("PD", currentCount + 1);
}

/** Generate next production order number: OP000001, OP000002, etc. */
export function nextProductionOrderNumber(currentCount: number): string {
  return formatNumber("OP", currentCount + 1);
}

/** Generate next lot number for an item: {itemPrefix}-{sequential} */
export function nextLotNumber(existingLotCount: number): string {
  return formatNumber("LT", existingLotCount + 1);
}
