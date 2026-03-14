import { describe, it, expect } from "vitest";
import {
  calcSkuAvailability,
  canFulfillSku,
  getAvailabilityStatus,
  calcCartTotal,
  validateCart,
} from "./sales-sku";

describe("calcSkuAvailability", () => {
  it("calculates max quantity based on limiting component", () => {
    const components = [
      { inventoryItemId: "a", itemName: "Farinha", requiredPerSku: 100, availableStock: 500 },
      { inventoryItemId: "b", itemName: "Acucar", requiredPerSku: 50, availableStock: 100 },
    ];
    const result = calcSkuAvailability("sku-1", components);
    // Farinha: 500/100 = 5, Acucar: 100/50 = 2 -> min = 2
    expect(result.maxQuantity).toBe(2);
    expect(result.available).toBe(true);
  });

  it("returns unavailable when any component has 0 stock", () => {
    const components = [
      { inventoryItemId: "a", itemName: "Farinha", requiredPerSku: 100, availableStock: 0 },
    ];
    const result = calcSkuAvailability("sku-1", components);
    expect(result.maxQuantity).toBe(0);
    expect(result.available).toBe(false);
  });

  it("returns 0 for empty components", () => {
    const result = calcSkuAvailability("sku-1", []);
    expect(result.maxQuantity).toBe(0);
    expect(result.available).toBe(false);
  });
});

describe("canFulfillSku", () => {
  it("returns true when enough stock", () => {
    const availability = { skuId: "1", available: true, maxQuantity: 10, componentAvailability: [] };
    expect(canFulfillSku(availability, 5)).toBe(true);
  });

  it("returns false when insufficient stock", () => {
    const availability = { skuId: "1", available: true, maxQuantity: 2, componentAvailability: [] };
    expect(canFulfillSku(availability, 5)).toBe(false);
  });
});

describe("getAvailabilityStatus", () => {
  it("returns unavailable for 0 quantity", () => {
    const availability = { skuId: "1", available: false, maxQuantity: 0, componentAvailability: [] };
    expect(getAvailabilityStatus(availability)).toBe("unavailable");
  });

  it("returns low for quantity below threshold", () => {
    const availability = { skuId: "1", available: true, maxQuantity: 3, componentAvailability: [] };
    expect(getAvailabilityStatus(availability)).toBe("low");
  });

  it("returns available for sufficient quantity", () => {
    const availability = { skuId: "1", available: true, maxQuantity: 10, componentAvailability: [] };
    expect(getAvailabilityStatus(availability)).toBe("available");
  });
});

describe("calcCartTotal", () => {
  it("calculates total from price * quantity", () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 25, quantity: 1 },
    ];
    expect(calcCartTotal(items)).toBe(45);
  });
});

describe("validateCart", () => {
  it("returns invalid for empty cart", () => {
    const result = validateCart([]);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Carrinho vazio");
  });

  it("returns invalid for quantity exceeding max", () => {
    const result = validateCart([{ name: "Bolo", quantity: 5, maxQuantity: 2 }]);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("Bolo");
  });

  it("returns valid for correct quantities", () => {
    const result = validateCart([{ name: "Bolo", quantity: 2, maxQuantity: 10 }]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
