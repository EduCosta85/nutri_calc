/** Unit conversion utilities — weight (g/kg), volume (ml/L), unit (un) */

export interface UnitConversionOption {
  abbreviation: string;
  name: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

const weightConversions: Record<string, UnitConversionOption> = {
  g: { abbreviation: "g", name: "Gramas", toBase: (v) => v, fromBase: (v) => v },
  kg: { abbreviation: "kg", name: "Quilogramas", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
};

const volumeConversions: Record<string, UnitConversionOption> = {
  ml: { abbreviation: "ml", name: "Mililitros", toBase: (v) => v, fromBase: (v) => v },
  L: { abbreviation: "L", name: "Litros", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
};

const unitConversions: Record<string, UnitConversionOption> = {
  un: { abbreviation: "un", name: "Unidades", toBase: (v) => v, fromBase: (v) => v },
};

/** Get available conversion options for a given unit */
export function getConversionOptions(baseUnit: string): UnitConversionOption[] {
  if (baseUnit in weightConversions) return Object.values(weightConversions);
  if (baseUnit in volumeConversions) return Object.values(volumeConversions);
  if (baseUnit in unitConversions) return Object.values(unitConversions);
  return [{ abbreviation: baseUnit, name: baseUnit, toBase: (v) => v, fromBase: (v) => v }];
}

/** Convert a value from one unit to another */
export function convertUnit(value: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return value;

  const options = getConversionOptions(fromUnit);
  const fromConversion = options.find((o) => o.abbreviation === fromUnit);
  const toConversion = options.find((o) => o.abbreviation === toUnit);

  if (!fromConversion || !toConversion) return value;

  const baseValue = fromConversion.toBase(value);
  return toConversion.fromBase(baseValue);
}

/** Check if two units are compatible (can be converted between) */
export function areUnitsCompatible(unit1: string, unit2: string): boolean {
  const options1 = getConversionOptions(unit1);
  const options2 = getConversionOptions(unit2);
  return options1.some((o1) => options2.some((o2) => o1.abbreviation === o2.abbreviation));
}
