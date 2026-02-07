import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, GitCompareArrows } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import type { NutritionInfo } from "../types";
import { NUTRITION_ROWS } from "../types";
import { calcRecipeNutrition, nutritionPer100g } from "../utils/nutrition";

function formatVal(n: number, unit: string): string {
  if (unit === "mg") return Math.round(n).toString();
  return n.toFixed(1);
}

export function ComparePage() {
  const recipes = useLiveQuery(() => db.recipes.toArray()) ?? [];
  const [idA, setIdA] = useState<number | "">("");
  const [idB, setIdB] = useState<number | "">("");
  const [nutritionA, setNutritionA] = useState<NutritionInfo | null>(null);
  const [nutritionB, setNutritionB] = useState<NutritionInfo | null>(null);

  const recipeA = recipes.find((r) => r.id === idA);
  const recipeB = recipes.find((r) => r.id === idB);

  useEffect(() => {
    if (recipeA) calcRecipeNutrition(recipeA).then(setNutritionA);
    else setNutritionA(null);
  }, [recipeA]);

  useEffect(() => {
    if (recipeB) calcRecipeNutrition(recipeB).then(setNutritionB);
    else setNutritionB(null);
  }, [recipeB]);

  const per100A = nutritionA && recipeA ? nutritionPer100g(nutritionA, recipeA.yieldGrams) : null;
  const per100B = nutritionB && recipeB ? nutritionPer100g(nutritionB, recipeB.yieldGrams) : null;

  return (
    <div>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <GitCompareArrows size={24} className="text-primary" />
          <h1 className="text-xl font-bold">Comparar Receitas</h1>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Receita A</label>
            <select
              value={idA}
              onChange={(e) => setIdA(e.target.value ? Number(e.target.value) : "")}
              className="input"
            >
              <option value="">Selecione...</option>
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Receita B</label>
            <select
              value={idB}
              onChange={(e) => setIdB(e.target.value ? Number(e.target.value) : "")}
              className="input"
            >
              <option value="">Selecione...</option>
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison table */}
        {per100A && per100B && recipeA && recipeB && (
          <div className="card !p-0 overflow-hidden">
            <div className="px-4 py-3 bg-primary/5 border-b border-border">
              <h2 className="text-sm font-semibold text-primary">Valores por 100g</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Nutriente</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">{recipeA.name}</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">{recipeB.name}</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Dif.</th>
                </tr>
              </thead>
              <tbody>
                {NUTRITION_ROWS.map(({ key, label, unit }, i) => {
                  const valA = per100A[key];
                  const valB = per100B[key];
                  const diff = valB - valA;
                  const diffPct = valA > 0 ? ((diff / valA) * 100) : 0;

                  return (
                    <tr
                      key={key}
                      className={i < NUTRITION_ROWS.length - 1 ? "border-b border-border" : ""}
                    >
                      <td className="px-4 py-2">{label}</td>
                      <td className="text-right px-4 py-2 tabular-nums">
                        {formatVal(valA, unit)} {unit}
                      </td>
                      <td className="text-right px-4 py-2 tabular-nums">
                        {formatVal(valB, unit)} {unit}
                      </td>
                      <td className={`text-right px-4 py-2 tabular-nums text-xs font-medium ${
                        Math.abs(diffPct) < 1 ? "text-muted-foreground" :
                        diff > 0 ? "text-red-600" : "text-green-600"
                      }`}>
                        {Math.abs(diffPct) < 1 ? "=" : `${diff > 0 ? "+" : ""}${Math.round(diffPct)}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {(!per100A || !per100B) && (idA !== "" || idB !== "") && (
          <p className="text-sm text-muted-foreground text-center">
            Selecione duas receitas para comparar.
          </p>
        )}
      </div>
    </div>
  );
}
