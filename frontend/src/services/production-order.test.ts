import { describe, it, expect } from "vitest";
import {
  getNextPhase,
  canCancel,
  canAdvance,
  wasSeparated,
  calcProductionCost,
  calcPlannedIngredients,
} from "./production-order";

describe("getNextPhase", () => {
  it("advances NEW -> SEPARATING", () => {
    expect(getNextPhase("NEW")).toBe("SEPARATING");
  });

  it("advances SEPARATING -> PRODUCING", () => {
    expect(getNextPhase("SEPARATING")).toBe("PRODUCING");
  });

  it("advances PRODUCING -> FINISHING", () => {
    expect(getNextPhase("PRODUCING")).toBe("FINISHING");
  });

  it("returns null for FINISHING (manual completion)", () => {
    expect(getNextPhase("FINISHING")).toBeNull();
  });

  it("returns null for COMPLETED", () => {
    expect(getNextPhase("COMPLETED")).toBeNull();
  });

  it("returns null for CANCELLED", () => {
    expect(getNextPhase("CANCELLED")).toBeNull();
  });
});

describe("canCancel", () => {
  it("allows cancellation from NEW", () => {
    expect(canCancel("NEW")).toBe(true);
  });

  it("allows cancellation from PRODUCING", () => {
    expect(canCancel("PRODUCING")).toBe(true);
  });

  it("prevents cancellation of COMPLETED", () => {
    expect(canCancel("COMPLETED")).toBe(false);
  });

  it("prevents cancellation of already CANCELLED", () => {
    expect(canCancel("CANCELLED")).toBe(false);
  });
});

describe("canAdvance", () => {
  it("returns true for NEW", () => {
    expect(canAdvance("NEW")).toBe(true);
  });

  it("returns false for FINISHING", () => {
    expect(canAdvance("FINISHING")).toBe(false);
  });
});

describe("wasSeparated", () => {
  it("returns false for NEW (no materials separated yet)", () => {
    expect(wasSeparated("NEW")).toBe(false);
  });

  it("returns true for SEPARATING", () => {
    expect(wasSeparated("SEPARATING")).toBe(true);
  });

  it("returns true for PRODUCING", () => {
    expect(wasSeparated("PRODUCING")).toBe(true);
  });
});

describe("calcProductionCost", () => {
  it("calculates cost from actual usage", () => {
    const ingredients = [
      { actualQuantity: 100, returnedQuantity: 10, lossQuantity: 5, averageCost: 2 },
      { actualQuantity: 50, returnedQuantity: 0, lossQuantity: 0, averageCost: 3 },
    ];
    // (85 * 2 + 50 * 3) / 200 = (170 + 150) / 200 = 1.6
    expect(calcProductionCost(ingredients, 200)).toBeCloseTo(1.6, 5);
  });

  it("returns 0 when output quantity is 0", () => {
    const ingredients = [
      { actualQuantity: 100, returnedQuantity: 0, lossQuantity: 0, averageCost: 2 },
    ];
    expect(calcProductionCost(ingredients, 0)).toBe(0);
  });
});

describe("calcPlannedIngredients", () => {
  it("multiplies recipe quantities by target quantity", () => {
    const recipe = [
      { ingredientId: "a", quantity: 100 },
      { ingredientId: "b", quantity: 50 },
    ];
    const result = calcPlannedIngredients(recipe, 3);
    expect(result).toEqual([
      { ingredientId: "a", plannedQuantity: 300 },
      { ingredientId: "b", plannedQuantity: 150 },
    ]);
  });
});
