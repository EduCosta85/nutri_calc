import { describe, it, expect } from "vitest";
import {
  calcWeightedAverageCost,
  calcTotalStock,
  sortLotsFIFO,
  calcFIFODeduction,
  calcProportionalReturn,
} from "./stock";
import type { StockLot } from "../types/inventory";

const makeLot = (id: string, quantity: number, unitCost: number, entryDate: string): StockLot => ({
  id,
  itemId: "item-1",
  lotNumber: `LT${id}`,
  quantity,
  unitCost,
  entryDate,
  createdAt: entryDate,
  updatedAt: entryDate,
});

describe("calcWeightedAverageCost", () => {
  it("returns 0 when no lots exist", () => {
    expect(calcWeightedAverageCost([])).toBe(0);
  });

  it("returns 0 when all lots have zero quantity", () => {
    const lots = [makeLot("1", 0, 10, "2024-01-01")];
    expect(calcWeightedAverageCost(lots)).toBe(0);
  });

  it("returns unit cost for a single lot", () => {
    const lots = [makeLot("1", 100, 5, "2024-01-01")];
    expect(calcWeightedAverageCost(lots)).toBe(5);
  });

  it("calculates weighted average across multiple lots", () => {
    // 100 units at R$10 + 200 units at R$20 = (1000 + 4000) / 300 = 16.67
    const lots = [
      makeLot("1", 100, 10, "2024-01-01"),
      makeLot("2", 200, 20, "2024-01-02"),
    ];
    expect(calcWeightedAverageCost(lots)).toBeCloseTo(16.667, 2);
  });
});

describe("calcTotalStock", () => {
  it("returns 0 when no lots exist", () => {
    expect(calcTotalStock([])).toBe(0);
  });

  it("sums quantities across all lots, ignoring negatives", () => {
    const lots = [
      makeLot("1", 100, 5, "2024-01-01"),
      makeLot("2", 50, 5, "2024-01-02"),
      makeLot("3", -10, 5, "2024-01-03"), // Should count as 0
    ];
    expect(calcTotalStock(lots)).toBe(150);
  });
});

describe("sortLotsFIFO", () => {
  it("returns lots sorted by entry date ascending, excluding empty lots", () => {
    const lots = [
      makeLot("3", 10, 5, "2024-03-01"),
      makeLot("1", 20, 5, "2024-01-01"),
      makeLot("2", 0, 5, "2024-02-01"), // Empty — excluded
    ];
    const sorted = sortLotsFIFO(lots);
    expect(sorted).toHaveLength(2);
    expect(sorted[0].id).toBe("1");
    expect(sorted[1].id).toBe("3");
  });
});

describe("calcFIFODeduction", () => {
  it("deducts from oldest lot first", () => {
    const lots = [
      makeLot("2", 50, 5, "2024-02-01"),
      makeLot("1", 100, 5, "2024-01-01"),
    ];
    const result = calcFIFODeduction(lots, 80);
    expect(result).toEqual([{ lotId: "1", quantity: 80 }]);
  });

  it("spans multiple lots when first is insufficient", () => {
    const lots = [
      makeLot("1", 30, 5, "2024-01-01"),
      makeLot("2", 50, 5, "2024-02-01"),
    ];
    const result = calcFIFODeduction(lots, 60);
    expect(result).toEqual([
      { lotId: "1", quantity: 30 },
      { lotId: "2", quantity: 30 },
    ]);
  });

  it("returns null when insufficient stock", () => {
    const lots = [makeLot("1", 10, 5, "2024-01-01")];
    expect(calcFIFODeduction(lots, 20)).toBeNull();
  });

  it("handles exact deduction", () => {
    const lots = [makeLot("1", 50, 5, "2024-01-01")];
    const result = calcFIFODeduction(lots, 50);
    expect(result).toEqual([{ lotId: "1", quantity: 50 }]);
  });
});

describe("calcProportionalReturn", () => {
  it("distributes return proportionally to original usages", () => {
    const usages = [
      { lotId: "1", quantity: 60 },
      { lotId: "2", quantity: 40 },
    ];
    const result = calcProportionalReturn(usages, 10);
    expect(result[0].lotId).toBe("1");
    expect(result[0].quantity).toBeCloseTo(6, 5);
    expect(result[1].lotId).toBe("2");
    expect(result[1].quantity).toBeCloseTo(4, 5);
  });

  it("returns empty array when no usages", () => {
    expect(calcProportionalReturn([], 10)).toEqual([]);
  });
});
