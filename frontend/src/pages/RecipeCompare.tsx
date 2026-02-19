import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowUp, ArrowDown } from "lucide-react";
import { useRecipes } from "../hooks/useRecipes";
import { useRawMaterials } from "../hooks/useRawMaterials";
import type { Recipe, NutritionInfo } from "../types";
import { calcRecipeNutrition } from "../utils/nutrition";
import { calcRecipeCost } from "../utils/cost";

export function RecipeComparePage() {
  const { id1, id2 } = useParams();
  const { getById } = useRecipes();
  const { materials } = useRawMaterials();
  
  const [recipe1, setRecipe1] = useState<Recipe | null>(null);
  const [recipe2, setRecipe2] = useState<Recipe | null>(null);
  
  const [nutrition1, setNutrition1] = useState<NutritionInfo | null>(null);
  const [nutrition2, setNutrition2] = useState<NutritionInfo | null>(null);
  
  const [cost1, setCost1] = useState<number | null>(null);
  const [cost2, setCost2] = useState<number | null>(null);

  useEffect(() => {
    if (id1) {
      getById(id1).then((r) => {
        if (r) {
          setRecipe1(r);
          calcRecipeNutrition(r).then(setNutrition1);
          calcRecipeCost(r).then(setCost1);
        }
      });
    }
  }, [id1, getById]);

  useEffect(() => {
    if (id2) {
      getById(id2).then((r) => {
        if (r) {
          setRecipe2(r);
          calcRecipeNutrition(r).then(setNutrition2);
          calcRecipeCost(r).then(setCost2);
        }
      });
    }
  }, [id2, getById]);

  function getIngredientName(ing: Recipe["ingredients"][0]): string {
    if (ing.type === "raw_material") {
      return materials.find((m) => String(m.id) === String(ing.referenceId))?.name ?? "???";
    }
    return "Sub-receita";
  }

  function getUnit(ing: Recipe["ingredients"][0]): string {
    if (ing.type === "recipe") return "g";
    return materials.find((m) => String(m.id) === String(ing.referenceId))?.unit ?? "g";
  }

  function renderDiff(value1: number, value2: number, unit: string = "", lowerIsBetter: boolean = false) {
    const diff = value2 - value1;
    const diffAbs = Math.abs(diff);
    const isBetter = lowerIsBetter ? diff < 0 : diff > 0;
    const isWorse = lowerIsBetter ? diff > 0 : diff < 0;

    if (diff === 0) {
      return <span className="text-muted-foreground text-xs">—</span>;
    }

    return (
      <span className={`text-xs flex items-center gap-0.5 ${isBetter ? 'text-green-600' : isWorse ? 'text-red-600' : 'text-muted-foreground'}`}>
        {diff > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        {diff > 0 ? '+' : ''}{diffAbs.toFixed(1)}{unit}
      </span>
    );
  }

  if (!recipe1 || !recipe2) {
    return <p className="text-center text-muted-foreground py-12">Carregando...</p>;
  }

  return (
    <div>
      <Link
        to="/receitas"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <h1 className="text-2xl font-bold mb-6 text-center">Comparação de Receitas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recipe 1 */}
        <div className="card">
          <div className="border-b border-border pb-3 mb-4">
            <h2 className="text-xl font-bold">{recipe1.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Rendimento: {recipe1.yieldGrams}g · Porção: {recipe1.servingSize}g ({recipe1.servingName})
            </p>
          </div>

          {/* Ingredients */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Ingredientes
            </h3>
            <ul className="space-y-1 text-sm">
              {recipe1.ingredients.map((ing, i) => (
                <li key={i} className="flex justify-between">
                  <span>{getIngredientName(ing)}</span>
                  <span className="text-muted-foreground">{ing.quantity}{getUnit(ing)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Totals */}
          <div className="border-t border-border pt-4 space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Totais
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Custo Total:</span>
                <p className="font-semibold">{cost1 !== null ? `R$ ${cost1.toFixed(2)}` : '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Custo/100g:</span>
                <p className="font-semibold">
                  {cost1 !== null ? `R$ ${((cost1 / recipe1.yieldGrams) * 100).toFixed(2)}` : '—'}
                </p>
              </div>
              {nutrition1 && (
                <>
                  <div>
                    <span className="text-muted-foreground">Calorias:</span>
                    <p className="font-semibold">{nutrition1.calories.toFixed(1)} kcal</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carb:</span>
                    <p className="font-semibold">{nutrition1.carbs.toFixed(1)}g</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Proteína:</span>
                    <p className="font-semibold">{nutrition1.protein.toFixed(1)}g</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gordura:</span>
                    <p className="font-semibold">{nutrition1.totalFat.toFixed(1)}g</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recipe 2 with diffs */}
        <div className="card">
          <div className="border-b border-border pb-3 mb-4">
            <h2 className="text-xl font-bold">{recipe2.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Rendimento: {recipe2.yieldGrams}g · Porção: {recipe2.servingSize}g ({recipe2.servingName})
            </p>
          </div>

          {/* Ingredients */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Ingredientes
            </h3>
            <ul className="space-y-1 text-sm">
              {recipe2.ingredients.map((ing, i) => (
                <li key={i} className="flex justify-between">
                  <span>{getIngredientName(ing)}</span>
                  <span className="text-muted-foreground">{ing.quantity}{getUnit(ing)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Totals with diffs */}
          <div className="border-t border-border pt-4 space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Totais (vs. {recipe1.name})
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Custo Total:</span>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{cost2 !== null ? `R$ ${cost2.toFixed(2)}` : '—'}</p>
                  {cost1 !== null && cost2 !== null && renderDiff(cost1, cost2, '', true)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Custo/100g:</span>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">
                    {cost2 !== null ? `R$ ${((cost2 / recipe2.yieldGrams) * 100).toFixed(2)}` : '—'}
                  </p>
                  {cost1 !== null && cost2 !== null && renderDiff(
                    (cost1 / recipe1.yieldGrams) * 100,
                    (cost2 / recipe2.yieldGrams) * 100,
                    '',
                    true
                  )}
                </div>
              </div>
              {nutrition1 && nutrition2 && (
                <>
                  <div>
                    <span className="text-muted-foreground">Calorias:</span>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{nutrition2.calories.toFixed(1)} kcal</p>
                      {renderDiff(nutrition1.calories, nutrition2.calories, ' kcal')}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carb:</span>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{nutrition2.carbs.toFixed(1)}g</p>
                      {renderDiff(nutrition1.carbs, nutrition2.carbs, 'g')}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Proteína:</span>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{nutrition2.protein.toFixed(1)}g</p>
                      {renderDiff(nutrition1.protein, nutrition2.protein, 'g', false)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gordura:</span>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{nutrition2.totalFat.toFixed(1)}g</p>
                      {renderDiff(nutrition1.totalFat, nutrition2.totalFat, 'g')}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
