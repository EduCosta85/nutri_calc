import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowUp, ArrowDown, Plus, Trash2 } from "lucide-react";
import { useRecipes } from "../hooks/useRecipes";
import { useRawMaterials } from "../hooks/useRawMaterials";
import type { Recipe, NutritionInfo, RecipeIngredient } from "../types";
import { calcRecipeNutrition } from "../utils/nutrition";
import { calcRecipeCost } from "../utils/cost";
import { IngredientSearch } from "../components/IngredientSearch";

export function RecipeComparePage() {
  const { id1, id2 } = useParams();
  const { getById, recipes } = useRecipes();
  const { materials } = useRawMaterials();
  
  const [recipe1, setRecipe1] = useState<Recipe | null>(null);
  const [recipe2, setRecipe2] = useState<Recipe | null>(null);
  
  const [nutrition1, setNutrition1] = useState<NutritionInfo | null>(null);
  const [nutrition2, setNutrition2] = useState<NutritionInfo | null>(null);
  
  const [cost1, setCost1] = useState<number | null>(null);
  const [cost2, setCost2] = useState<number | null>(null);

  const [addType1, setAddType1] = useState<"raw_material" | "recipe">("raw_material");
  const [addRefId1, setAddRefId1] = useState<string | number | "">("");
  const [addQty1, setAddQty1] = useState(0);

  const [addType2, setAddType2] = useState<"raw_material" | "recipe">("raw_material");
  const [addRefId2, setAddRefId2] = useState<string | number | "">("");
  const [addQty2, setAddQty2] = useState(0);

  useEffect(() => {
    if (id1) getById(id1).then((r) => { if (r) setRecipe1(r); });
  }, [id1, getById]);

  useEffect(() => {
    if (id2) getById(id2).then((r) => { if (r) setRecipe2(r); });
  }, [id2, getById]);

  useEffect(() => {
    if (recipe1) {
      calcRecipeNutrition(recipe1).then(setNutrition1);
      calcRecipeCost(recipe1).then(setCost1);
    }
  }, [recipe1]);

  useEffect(() => {
    if (recipe2) {
      calcRecipeNutrition(recipe2).then(setNutrition2);
      calcRecipeCost(recipe2).then(setCost2);
    }
  }, [recipe2]);

  function getIngredientName(ing: RecipeIngredient): string {
    if (ing.type === "raw_material") {
      return materials.find((m) => String(m.id) === String(ing.referenceId))?.name ?? "???";
    }
    return recipes.find((r) => String(r.id) === String(ing.referenceId))?.name ?? "Sub-receita";
  }

  function getUnit(ing: RecipeIngredient): string {
    if (ing.type === "recipe") return "g";
    return materials.find((m) => String(m.id) === String(ing.referenceId))?.unit ?? "g";
  }

  function renderDiff(value1: number, value2: number, unit: string = "", lowerIsBetter: boolean = false) {
    const diff = value2 - value1;
    const diffAbs = Math.abs(diff);
    const isBetter = lowerIsBetter ? diff < 0 : diff > 0;
    const isWorse = lowerIsBetter ? diff > 0 : diff < 0;

    if (Math.abs(diff) < 0.01) return <span className="text-muted-foreground text-xs">—</span>;

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

      <h1 className="text-2xl font-bold mb-6 text-center">Comparação de Receitas (Editável em Tempo Real)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RECIPE 1 - EDITABLE */}
        <div className="card">
          <div className="border-b border-border pb-3 mb-4">
            <input
              type="text"
              value={recipe1.name}
              onChange={(e) => setRecipe1({ ...recipe1, name: e.target.value })}
              className="text-xl font-bold w-full bg-transparent border-0 p-0 focus:outline-none focus:ring-0"
            />
            <div className="flex gap-4 mt-2 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Rendimento:</span>
                <input
                  type="number"
                  min="1"
                  value={recipe1.yieldGrams || ""}
                  onChange={(e) => setRecipe1({ ...recipe1, yieldGrams: parseFloat(e.target.value) || 0 })}
                  className="w-16 px-1 py-0.5 text-sm rounded border border-border"
                />
                <span>g</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Porção:</span>
                <input
                  type="number"
                  min="1"
                  value={recipe1.servingSize || ""}
                  onChange={(e) => setRecipe1({ ...recipe1, servingSize: parseFloat(e.target.value) || 0 })}
                  className="w-16 px-1 py-0.5 text-sm rounded border border-border"
                />
                <span>g</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Ingredientes
            </h3>
            <ul className="space-y-1 text-sm mb-3">
              {recipe1.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center justify-between gap-2 bg-secondary/30 rounded px-2 py-1">
                  <span className="flex-1 truncate">{getIngredientName(ing)}</span>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={ing.quantity || ""}
                    onChange={(e) => {
                      const updated = [...recipe1.ingredients];
                      updated[i] = { ...updated[i], quantity: parseFloat(e.target.value) || 0 };
                      setRecipe1({ ...recipe1, ingredients: updated });
                    }}
                    className="w-16 px-1 py-0.5 text-xs rounded border border-border text-right"
                  />
                  <span className="text-xs text-muted-foreground">{getUnit(ing)}</span>
                  <button
                    onClick={() => setRecipe1({ ...recipe1, ingredients: recipe1.ingredients.filter((_, idx) => idx !== i) })}
                    className="p-0.5 hover:bg-red-50 rounded text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="bg-secondary/20 rounded p-2 space-y-2">
              <div className="flex gap-2">
                <select
                  value={addType1}
                  onChange={(e) => { setAddType1(e.target.value as any); setAddRefId1(""); }}
                  className="text-xs px-2 py-1 rounded border border-border"
                >
                  <option value="raw_material">MP</option>
                  <option value="recipe">Receita</option>
                </select>
                <IngredientSearch
                  options={addType1 === "raw_material" 
                    ? materials.map(m => ({ id: m.id!, name: m.name }))
                    : recipes.filter(r => String(r.id) !== String(id1)).map(r => ({ id: r.id!, name: r.name }))
                  }
                  value={addRefId1}
                  onChange={setAddRefId1}
                  placeholder="Item..."
                />
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="Qtd"
                  value={addQty1 || ""}
                  onChange={(e) => setAddQty1(parseFloat(e.target.value) || 0)}
                  className="w-16 px-1 py-1 text-xs rounded border border-border"
                />
                <button
                  onClick={() => {
                    if (addRefId1 !== "" && addQty1 > 0) {
                      setRecipe1({
                        ...recipe1,
                        ingredients: [...recipe1.ingredients, { type: addType1, referenceId: addRefId1, quantity: addQty1 }]
                      });
                      setAddRefId1("");
                      setAddQty1(0);
                    }
                  }}
                  className="px-2 py-1 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

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
                  {cost1 !== null && recipe1.yieldGrams > 0 ? `R$ ${((cost1 / recipe1.yieldGrams) * 100).toFixed(2)}` : '—'}
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

        {/* RECIPE 2 - EDITABLE WITH DIFFS */}
        <div className="card">
          <div className="border-b border-border pb-3 mb-4">
            <input
              type="text"
              value={recipe2.name}
              onChange={(e) => setRecipe2({ ...recipe2, name: e.target.value })}
              className="text-xl font-bold w-full bg-transparent border-0 p-0 focus:outline-none focus:ring-0"
            />
            <div className="flex gap-4 mt-2 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Rendimento:</span>
                <input
                  type="number"
                  min="1"
                  value={recipe2.yieldGrams || ""}
                  onChange={(e) => setRecipe2({ ...recipe2, yieldGrams: parseFloat(e.target.value) || 0 })}
                  className="w-16 px-1 py-0.5 text-sm rounded border border-border"
                />
                <span>g</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Porção:</span>
                <input
                  type="number"
                  min="1"
                  value={recipe2.servingSize || ""}
                  onChange={(e) => setRecipe2({ ...recipe2, servingSize: parseFloat(e.target.value) || 0 })}
                  className="w-16 px-1 py-0.5 text-sm rounded border border-border"
                />
                <span>g</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Ingredientes
            </h3>
            <ul className="space-y-1 text-sm mb-3">
              {recipe2.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center justify-between gap-2 bg-secondary/30 rounded px-2 py-1">
                  <span className="flex-1 truncate">{getIngredientName(ing)}</span>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={ing.quantity || ""}
                    onChange={(e) => {
                      const updated = [...recipe2.ingredients];
                      updated[i] = { ...updated[i], quantity: parseFloat(e.target.value) || 0 };
                      setRecipe2({ ...recipe2, ingredients: updated });
                    }}
                    className="w-16 px-1 py-0.5 text-xs rounded border border-border text-right"
                  />
                  <span className="text-xs text-muted-foreground">{getUnit(ing)}</span>
                  <button
                    onClick={() => setRecipe2({ ...recipe2, ingredients: recipe2.ingredients.filter((_, idx) => idx !== i) })}
                    className="p-0.5 hover:bg-red-50 rounded text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="bg-secondary/20 rounded p-2 space-y-2">
              <div className="flex gap-2">
                <select
                  value={addType2}
                  onChange={(e) => { setAddType2(e.target.value as any); setAddRefId2(""); }}
                  className="text-xs px-2 py-1 rounded border border-border"
                >
                  <option value="raw_material">MP</option>
                  <option value="recipe">Receita</option>
                </select>
                <IngredientSearch
                  options={addType2 === "raw_material" 
                    ? materials.map(m => ({ id: m.id!, name: m.name }))
                    : recipes.filter(r => String(r.id) !== String(id2)).map(r => ({ id: r.id!, name: r.name }))
                  }
                  value={addRefId2}
                  onChange={setAddRefId2}
                  placeholder="Item..."
                />
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="Qtd"
                  value={addQty2 || ""}
                  onChange={(e) => setAddQty2(parseFloat(e.target.value) || 0)}
                  className="w-16 px-1 py-1 text-xs rounded border border-border"
                />
                <button
                  onClick={() => {
                    if (addRefId2 !== "" && addQty2 > 0) {
                      setRecipe2({
                        ...recipe2,
                        ingredients: [...recipe2.ingredients, { type: addType2, referenceId: addRefId2, quantity: addQty2 }]
                      });
                      setAddRefId2("");
                      setAddQty2(0);
                    }
                  }}
                  className="px-2 py-1 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

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
                    {cost2 !== null && recipe2.yieldGrams > 0 ? `R$ ${((cost2 / recipe2.yieldGrams) * 100).toFixed(2)}` : '—'}
                  </p>
                  {cost1 !== null && cost2 !== null && recipe1.yieldGrams > 0 && recipe2.yieldGrams > 0 && renderDiff(
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
