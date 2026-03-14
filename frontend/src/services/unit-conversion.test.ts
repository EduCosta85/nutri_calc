import { describe, it, expect } from "vitest";
import { convertUnit, areUnitsCompatible, getConversionOptions } from "./unit-conversion";

describe("convertUnit", () => {
  it("returns same value for identical units", () => {
    expect(convertUnit(100, "g", "g")).toBe(100);
  });

  it("converts grams to kilograms", () => {
    expect(convertUnit(1000, "g", "kg")).toBe(1);
  });

  it("converts kilograms to grams", () => {
    expect(convertUnit(2.5, "kg", "g")).toBe(2500);
  });

  it("converts milliliters to liters", () => {
    expect(convertUnit(500, "ml", "L")).toBe(0.5);
  });

  it("converts liters to milliliters", () => {
    expect(convertUnit(1.5, "L", "ml")).toBe(1500);
  });

  it("returns same value for units (un)", () => {
    expect(convertUnit(5, "un", "un")).toBe(5);
  });

  it("returns same value for incompatible units", () => {
    expect(convertUnit(100, "g", "ml")).toBe(100);
  });
});

describe("areUnitsCompatible", () => {
  it("returns true for weight units", () => {
    expect(areUnitsCompatible("g", "kg")).toBe(true);
  });

  it("returns true for volume units", () => {
    expect(areUnitsCompatible("ml", "L")).toBe(true);
  });

  it("returns false for incompatible units", () => {
    expect(areUnitsCompatible("g", "ml")).toBe(false);
  });

  it("returns true for same unit", () => {
    expect(areUnitsCompatible("g", "g")).toBe(true);
  });
});

describe("getConversionOptions", () => {
  it("returns weight options for grams", () => {
    const options = getConversionOptions("g");
    expect(options).toHaveLength(2);
    expect(options.map((o) => o.abbreviation)).toEqual(["g", "kg"]);
  });

  it("returns volume options for ml", () => {
    const options = getConversionOptions("ml");
    expect(options).toHaveLength(2);
    expect(options.map((o) => o.abbreviation)).toEqual(["ml", "L"]);
  });

  it("returns single option for unknown unit", () => {
    const options = getConversionOptions("xyz");
    expect(options).toHaveLength(1);
    expect(options[0].abbreviation).toBe("xyz");
  });
});
