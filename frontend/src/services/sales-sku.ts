import type { SalesSkuAvailability } from "../types/sales";

/**
 * Calculate SKU availability based on component stock levels.
 * The limiting component (fewest possible SKUs) determines max quantity.
 */
export function calcSkuAvailability(
  skuId: string,
  components: Array<{
    inventoryItemId: string;
    itemName: string;
    requiredPerSku: number;
    availableStock: number;
  }>,
): SalesSkuAvailability {
  const componentAvailability = components.map((comp) => {
    const maxSkuQuantity = comp.requiredPerSku > 0
      ? Math.floor(comp.availableStock / comp.requiredPerSku)
      : 0;
    return {
      itemId: comp.inventoryItemId,
      itemName: comp.itemName,
      requiredPerSku: comp.requiredPerSku,
      availableStock: comp.availableStock,
      maxSkuQuantity,
    };
  });

  const minMaxQuantity = componentAvailability.length > 0
    ? Math.min(...componentAvailability.map((c) => c.maxSkuQuantity))
    : 0;

  return {
    skuId,
    available: minMaxQuantity > 0,
    maxQuantity: minMaxQuantity,
    componentAvailability,
  };
}

/** Check if a specific quantity of SKU can be fulfilled */
export function canFulfillSku(availability: SalesSkuAvailability, quantity: number): boolean {
  return availability.maxQuantity >= quantity;
}

/** Get availability status for display (green/yellow/red) */
export function getAvailabilityStatus(
  availability: SalesSkuAvailability,
  lowThreshold = 5,
): "available" | "low" | "unavailable" {
  if (availability.maxQuantity === 0) return "unavailable";
  if (availability.maxQuantity < lowThreshold) return "low";
  return "available";
}

/** Calculate cart total from items */
export function calcCartTotal(items: Array<{ price: number; quantity: number }>): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/** Validate cart before checkout */
export function validateCart(
  items: Array<{ name: string; quantity: number; maxQuantity: number }>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (items.length === 0) {
    errors.push("Carrinho vazio");
    return { valid: false, errors };
  }

  for (const item of items) {
    if (item.quantity <= 0) {
      errors.push(`Quantidade invalida para ${item.name}`);
    } else if (item.quantity > item.maxQuantity) {
      errors.push(`${item.name}: estoque insuficiente (maximo: ${item.maxQuantity})`);
    }
  }

  return { valid: errors.length === 0, errors };
}
