import { describe, it, expect } from "vitest";
import {
  nextSaleNumber,
  nextOrderNumber,
  nextProductionOrderNumber,
  nextLotNumber,
} from "./auto-numbering";

describe("nextSaleNumber", () => {
  it("generates VD000001 for first sale", () => {
    expect(nextSaleNumber(0)).toBe("VD000001");
  });

  it("generates VD000010 for 9 existing sales", () => {
    expect(nextSaleNumber(9)).toBe("VD000010");
  });
});

describe("nextOrderNumber", () => {
  it("generates PD000001 for first order", () => {
    expect(nextOrderNumber(0)).toBe("PD000001");
  });

  it("generates PD000100 for 99 existing orders", () => {
    expect(nextOrderNumber(99)).toBe("PD000100");
  });
});

describe("nextProductionOrderNumber", () => {
  it("generates OP000001 for first production order", () => {
    expect(nextProductionOrderNumber(0)).toBe("OP000001");
  });
});

describe("nextLotNumber", () => {
  it("generates LT000001 for first lot", () => {
    expect(nextLotNumber(0)).toBe("LT000001");
  });
});
