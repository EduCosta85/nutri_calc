import { describe, it, expect } from "vitest";
import { detectLowStock, detectExpiringLots } from "./stock-alerts";
import type { InventoryItem, StockLot } from "../types/inventory";

const makeItem = (id: string, threshold = 10, warningDays = 7): InventoryItem => ({
  id,
  name: `Item ${id}`,
  type: "raw_material",
  unit: "g",
  averageCost: 0,
  lowStockThreshold: threshold,
  expiryWarningDays: warningDays,
  tags: [],
  createdAt: "",
  updatedAt: "",
});

const makeLot = (id: string, itemId: string, quantity: number, expiryDate?: string): StockLot => ({
  id,
  itemId,
  lotNumber: `LT${id}`,
  quantity,
  unitCost: 1,
  expiryDate: expiryDate ?? null,
  entryDate: "2024-01-01",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
});

describe("detectLowStock", () => {
  it("detects items below threshold", () => {
    const items = [makeItem("1", 50)];
    const lotsByItem = new Map([["1", [makeLot("l1", "1", 20)]]]);
    const alerts = detectLowStock(items, lotsByItem);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].currentStock).toBe(20);
    expect(alerts[0].threshold).toBe(50);
  });

  it("does not alert for items above threshold", () => {
    const items = [makeItem("1", 10)];
    const lotsByItem = new Map([["1", [makeLot("l1", "1", 100)]]]);
    expect(detectLowStock(items, lotsByItem)).toHaveLength(0);
  });

  it("handles items with no lots", () => {
    const items = [makeItem("1", 10)];
    const lotsByItem = new Map<string, StockLot[]>();
    const alerts = detectLowStock(items, lotsByItem);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].currentStock).toBe(0);
  });
});

describe("detectExpiringLots", () => {
  it("detects lots expiring within warning period", () => {
    const items = [makeItem("1", 10, 7)];
    const today = new Date("2024-06-01");
    const lotsByItem = new Map([["1", [makeLot("l1", "1", 50, "2024-06-05")]]]);
    const alerts = detectExpiringLots(items, lotsByItem, today);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].daysUntilExpiry).toBe(4);
  });

  it("does not alert for lots with no expiry date", () => {
    const items = [makeItem("1", 10, 7)];
    const lotsByItem = new Map([["1", [makeLot("l1", "1", 50)]]]);
    expect(detectExpiringLots(items, lotsByItem)).toHaveLength(0);
  });

  it("sorts alerts by days until expiry ascending", () => {
    const items = [makeItem("1", 10, 30)];
    const today = new Date("2024-06-01");
    const lotsByItem = new Map([
      ["1", [
        makeLot("l1", "1", 50, "2024-06-20"),
        makeLot("l2", "1", 30, "2024-06-05"),
      ]],
    ]);
    const alerts = detectExpiringLots(items, lotsByItem, today);
    expect(alerts[0].daysUntilExpiry).toBe(4);
    expect(alerts[1].daysUntilExpiry).toBe(19);
  });
});
