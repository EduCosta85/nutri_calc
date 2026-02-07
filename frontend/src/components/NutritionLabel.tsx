import { useRef } from "react";
import { Printer } from "lucide-react";
import type { NutritionInfo } from "../types";
import { roundAnvisa, calcFopWarnings, type FopResult } from "../utils/anvisa-rounding";

/** ANVISA RDC 429/2020 daily reference values (VDR) */
const VDR: Partial<Record<keyof NutritionInfo, number>> = {
  calories: 2000,
  carbs: 300,
  addedSugars: 50,
  protein: 75,
  totalFat: 65,
  saturatedFat: 22,
  fiber: 25,
  sodium: 2000,
};

interface NutrientRowDef {
  key: keyof NutritionInfo;
  label: string;
  unit: string;
  indent?: boolean;
  bold?: boolean;
}

const NUTRIENT_ROWS: readonly NutrientRowDef[] = [
  { key: "calories", label: "Valor energetico", unit: "kcal", bold: true },
  { key: "carbs", label: "Carboidratos", unit: "g" },
  { key: "totalSugars", label: "Acucares totais", unit: "g", indent: true },
  { key: "addedSugars", label: "Acucares adicionados", unit: "g", indent: true },
  { key: "protein", label: "Proteinas", unit: "g" },
  { key: "totalFat", label: "Gorduras totais", unit: "g" },
  { key: "saturatedFat", label: "Gorduras saturadas", unit: "g", indent: true },
  { key: "transFat", label: "Gorduras trans", unit: "g", indent: true },
  { key: "fiber", label: "Fibra alimentar", unit: "g" },
  { key: "sodium", label: "Sodio", unit: "mg" },
] as const;

function formatValue(value: number, unit: string): string {
  if (unit === "mg") return Math.round(value).toString();
  if (unit === "kcal") return Math.round(value).toString();
  return value.toFixed(1);
}

function calcVdPercent(key: keyof NutritionInfo, servingValue: number): string | null {
  const dailyRef = VDR[key];
  if (!dailyRef) return null;
  const pct = (servingValue / dailyRef) * 100;
  return Math.round(pct).toString();
}

function FopWarningBadge({ warning }: { warning: FopResult }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg text-xs font-bold">
      <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
        <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2" />
        <circle cx="12" cy="12" r="6" fill="white" />
        <line x1="16" y1="4" x2="22" y2="1" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span>{warning.label}</span>
    </div>
  );
}

interface NutritionLabelProps {
  nutrition: NutritionInfo;
  yieldGrams: number;
  servingSize: number;
  servingName: string;
}

export function NutritionLabel({
  nutrition,
  yieldGrams,
  servingSize,
  servingName,
}: NutritionLabelProps) {
  const labelRef = useRef<HTMLDivElement>(null);

  const servingsPerPackage =
    yieldGrams > 0 && servingSize > 0
      ? Math.round(yieldGrams / servingSize)
      : null;

  function getRaw(key: keyof NutritionInfo, basis: number): number {
    if (yieldGrams === 0 || basis === 0) return 0;
    return (nutrition[key] / yieldGrams) * basis;
  }

  function makeInfo(basis: number): NutritionInfo {
    const keys: (keyof NutritionInfo)[] = [
      "calories", "carbs", "totalSugars", "addedSugars", "protein",
      "totalFat", "saturatedFat", "transFat", "fiber", "sodium",
    ];
    const raw = {} as NutritionInfo;
    for (const k of keys) raw[k] = getRaw(k, basis);
    return raw;
  }

  const rounded100g = roundAnvisa(makeInfo(100));
  const roundedServing = roundAnvisa(makeInfo(servingSize));

  // Front-of-pack warnings based on per 100g values
  const fopWarnings = calcFopWarnings(makeInfo(100));

  function handlePrint() {
    const el = labelRef.current;
    if (!el) return;
    const printWindow = window.open("", "_blank", "width=500,height=700");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Tabela Nutricional</title>
      <style>
        body { margin: 20px; font-family: Arial, sans-serif; }
        * { box-sizing: border-box; }
      </style>
      </head><body>${el.outerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  return (
    <div className="space-y-3">
      {/* Front-of-pack warnings */}
      {fopWarnings.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {fopWarnings.map((w) => (
            <FopWarningBadge key={w.warning} warning={w} />
          ))}
        </div>
      )}

      {/* Nutrition label */}
      <div ref={labelRef} className="border-[3px] border-black bg-white text-black max-w-md font-sans text-sm">
        {/* Header */}
        <div className="px-3 pt-2 pb-1">
          <h2 className="text-base font-extrabold tracking-tight leading-tight">
            INFORMACAO NUTRICIONAL
          </h2>
        </div>

        {/* Serving info */}
        <div className="px-3 pb-1 text-xs leading-snug">
          {servingsPerPackage !== null && (
            <p>
              Porcoes por embalagem:{" "}
              <span className="font-semibold">{servingsPerPackage}</span>
            </p>
          )}
          {servingSize > 0 && (
            <p>
              Porcao: {servingSize}g
              {servingName && ` (${servingName})`}
            </p>
          )}
        </div>

        {/* Thick separator */}
        <div className="h-[3px] bg-black mx-0" />

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-3 py-1 text-xs font-bold border-b-[2px] border-black">
          <span />
          <span className="text-right">100g</span>
          <span className="text-right">{servingSize > 0 ? `${servingSize}g` : "Porcao"}</span>
          <span className="text-right">%VD*</span>
        </div>

        {/* Nutrient rows */}
        <div>
          {NUTRIENT_ROWS.map(({ key, label, unit, indent, bold }, i) => {
            const val100g = rounded100g[key];
            const valServing = roundedServing[key];
            const vdPct = calcVdPercent(key, valServing);
            const isLast = i === NUTRIENT_ROWS.length - 1;

            return (
              <div
                key={key}
                className={`grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-3 py-[3px] text-xs ${
                  !isLast ? "border-b border-black/20" : ""
                } ${bold ? "font-bold" : ""}`}
              >
                <span className={indent ? "pl-3" : ""}>
                  {label}
                </span>
                <span className="text-right tabular-nums">
                  {formatValue(val100g, unit)} {unit}
                </span>
                <span className="text-right tabular-nums">
                  {formatValue(valServing, unit)} {unit}
                </span>
                <span className="text-right tabular-nums w-10">
                  {vdPct !== null ? `${vdPct}%` : "**"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Thick bottom separator */}
        <div className="h-[3px] bg-black mx-0" />

        {/* Footnotes */}
        <div className="px-3 py-1.5 text-[10px] leading-tight text-black/80">
          <p>*Percentual de valores diarios fornecidos pela porcao.</p>
          <p>**VD nao estabelecido.</p>
        </div>
      </div>

      {/* Print button */}
      <button
        onClick={handlePrint}
        className="btn btn-secondary text-sm no-print"
      >
        <Printer size={16} />
        Imprimir tabela
      </button>
    </div>
  );
}
