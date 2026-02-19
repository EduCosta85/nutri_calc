import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Pencil, ArrowLeft, Clock, DollarSign, Trash2, Save, X, Plus, ChevronUp } from "lucide-react";
import { useRecipes } from "../hooks/useRecipes";
import { useRawMaterials } from "../hooks/useRawMaterials";
import type { Recipe } from "../types";
import type { NutritionInfo, RecipeIngredient } from "../types";
import { calcRecipeNutrition } from "../utils/nutrition";
import { calcRecipeCost } from "../utils/cost";
import { NutritionLabel } from "../components/NutritionLabel";
import { IngredientSearch } from "../components/IngredientSearch";

export function RecipeDetailPage() {
  const { id } = useParams();
  const { getById, recipes, update } = useRecipes();
  const { materials } = useRawMaterials();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [nutrition, setNutrition] = useState<NutritionInfo | null>(null);
  const [cost, setCost] = useState<number | null>(null);
  const [ingredientCosts, setIngredientCosts] = useState<Map<number, number>>(new Map());
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editType, setEditType] = useState<"raw_material" | "recipe">("raw_material");
  const [editRefId, setEditRefId] = useState<string | number | "">("");
  const [editQty, setEditQty] = useState(0);
  
  const [showAddNew, setShowAddNew] = useState(false);
  const [addType, setAddType] = useState<"raw_material" | "recipe">("raw_material");
  const [addRefId, setAddRefId] = useState<string | number | "">("");
  const [addQty, setAddQty] = useState(0);

  useEffect(() => {
    if (id) {
      getById(id).then((r) => {
        if (r) setRecipe(r);
      });
    }
  }, [id, getById]);

  useEffect(() => {
    if (recipe) {
      calcRecipeNutrition(recipe).then(setNutrition);
      calcRecipeCost(recipe).then(setCost);
    }
  }, [recipe]);

  useEffect(() => {
    if (!recipe) return;
    
    async function calculateIngredientCosts() {
      if (!recipe) return;
      const costs = new Map<number, number>();
      
      for (let i = 0; i < recipe.ingredients.length; i++) {
        const ing = recipe.ingredients[i];
        
        if (ing.type === "raw_material") {
          const mat = materials.find((m) => String(m.id) === String(ing.referenceId));
          if (mat) {
            costs.set(i, (mat.pricePer100g * ing.quantity) / 100);
          }
        } else {
          const subRecipe = recipes.find((r) => String(r.id) === String(ing.referenceId));
          if (subRecipe) {
            const subCost = await calcRecipeCost(subRecipe);
            costs.set(i, (subCost * ing.quantity) / subRecipe.yieldGrams);
          }
        }
      }
      
      setIngredientCosts(costs);
    }
    
    calculateIngredientCosts();
  }, [recipe, materials, recipes]);

  function getIngredientUnit(ing: RecipeIngredient): string {
    if (ing.type === "recipe") return "g";
    return materials.find((m) => String(m.id) === String(ing.referenceId))?.unit ?? "g";
  }

  function getIngredientName(ing: RecipeIngredient): string {
    if (ing.type === "raw_material") {
      return materials.find((m) => String(m.id) === String(ing.referenceId))?.name ?? "???";
    }
    return recipes.find((r) => String(r.id) === String(ing.referenceId))?.name ?? "???";
  }

  async function handleRemoveIngredient(index: number) {
    if (!recipe || !id) return;
    if (!window.confirm(`Remover ${getIngredientName(recipe.ingredients[index])}?`)) return;
    
    const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
    await update(id, { ...recipe, ingredients: newIngredients });
  }

  async function handleUpdateIngredient(index: number) {
    if (!recipe || !id || editRefId === "" || editQty <= 0) return;
    
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = { type: editType, referenceId: editRefId, quantity: editQty };
    
    await update(id, { ...recipe, ingredients: newIngredients });
    setEditingIndex(null);
  }

  async function handleAddIngredient() {
    if (!recipe || !id || addRefId === "" || addQty <= 0) return;
    
    const newIngredients = [
      ...recipe.ingredients,
      { type: addType, referenceId: addRefId, quantity: addQty }
    ];
    
    await update(id, { ...recipe, ingredients: newIngredients });
    setShowAddNew(false);
    setAddRefId("");
    setAddQty(0);
  }

  function startEdit(index: number) {
    const ing = recipe!.ingredients[index];
    setEditType(ing.type);
    setEditRefId(ing.referenceId);
    setEditQty(ing.quantity);
    setEditingIndex(index);
    setShowAddNew(false);
  }

  function cancelEdit() {
    setEditingIndex(null);
  }

  function getSelectedUnit(type: "raw_material" | "recipe", refId: string | number | ""): string {
    if (type !== "raw_material" || refId === "") return "g";
    return materials.find((m) => String(m.id) === String(refId))?.unit ?? "g";
  }

  if (!recipe) {
    return <p className="text-muted-foreground text-center py-12">Carregando...</p>;
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

      <div className="max-w-xl mx-auto space-y-6">
        {/* Photo */}
        {recipe.photo && (
          <img
            src={recipe.photo}
            alt={recipe.name}
            className="w-full h-48 object-cover rounded-xl"
          />
        )}

        {/* Header */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">{recipe.name}</h1>
            <Link to={`/receitas/${id}/editar`} className="btn btn-secondary text-sm !px-3 !py-1.5">
              <Pencil size={14} />
              Editar
            </Link>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <p>
              Rendimento: <span className="font-semibold text-foreground">{recipe.yieldGrams}g</span>
            </p>
            {cost !== null && cost > 0 && (
              <p className="inline-flex items-center gap-1">
                <DollarSign size={14} />
                Total: <span className="font-semibold text-foreground">R$ {cost.toFixed(2)}</span>
                {recipe.servingSize > 0 && (
                  <span className="ml-1">
                    · Porcao: R$ {((cost / recipe.yieldGrams) * recipe.servingSize).toFixed(2)}
                  </span>
                )}
              </p>
            )}
          </div>
          {(recipe.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {recipe.tags.map((t) => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Ingredients Table */}
        <div className="card !p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-secondary/20 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Ingredientes
            </h2>
            {!showAddNew && (
              <button
                onClick={() => { setShowAddNew(true); setEditingIndex(null); }}
                className="btn btn-primary !text-xs !px-2 !py-1"
              >
                <Plus size={14} /> Adicionar
              </button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Ingrediente</th>
                  <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Quantidade</th>
                  <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Custo</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {recipe.ingredients.map((ing, i) => (
                  <>
                    <tr
                      key={i}
                      className={`${i < recipe.ingredients.length - 1 || editingIndex === i || showAddNew ? "border-b border-border" : ""} hover:bg-secondary/30 transition-colors`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{getIngredientName(ing)}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            ing.type === "recipe" 
                              ? "bg-accent text-accent-foreground" 
                              : "bg-primary/10 text-primary"
                          }`}>
                            {ing.type === "recipe" ? "receita" : "ingrediente"}
                          </span>
                        </div>
                      </td>
                      <td className="text-right px-3 py-2.5 tabular-nums text-muted-foreground">
                        {ing.quantity}{getIngredientUnit(ing)}
                      </td>
                      <td className="text-right px-3 py-2.5 text-muted-foreground">
                        {ingredientCosts.has(i) && ingredientCosts.get(i)! > 0 ? (
                          <div className="flex flex-col items-end">
                            <span className="tabular-nums">R$ {ingredientCosts.get(i)!.toFixed(2)}</span>
                            {cost !== null && cost > 0 && (
                              <span className="text-xs text-muted-foreground/70">
                                {((ingredientCosts.get(i)! / cost) * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => editingIndex === i ? cancelEdit() : startEdit(i)}
                            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                            title="Editar"
                          >
                            {editingIndex === i ? <ChevronUp size={16} /> : <Pencil size={16} />}
                          </button>
                          <button
                            onClick={() => handleRemoveIngredient(i)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-destructive"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline edit row */}
                    {editingIndex === i && (
                      <tr key={`${i}-edit`} className="border-b border-border">
                        <td colSpan={4} className="px-4 py-4">
                          <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_5rem] gap-3 items-end">
                              <div>
                                <label className="block text-xs font-medium mb-1 text-muted-foreground">Tipo</label>
                                <select
                                  value={editType}
                                  onChange={(e) => {
                                    setEditType(e.target.value as "raw_material" | "recipe");
                                    setEditRefId("");
                                  }}
                                  className="input"
                                >
                                  <option value="raw_material">Matéria Prima</option>
                                  <option value="recipe">Receita</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1 text-muted-foreground">Item</label>
                                <IngredientSearch
                                  options={editType === "raw_material"
                                    ? materials.map((m) => ({ id: m.id!, name: m.name }))
                                    : recipes.filter((r) => String(r.id) !== String(id)).map((r) => ({ id: r.id!, name: r.name }))
                                  }
                                  value={editRefId}
                                  onChange={setEditRefId}
                                  placeholder={editType === "raw_material" ? "Buscar matéria prima..." : "Buscar receita..."}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1 text-muted-foreground">
                                  Qtd ({getSelectedUnit(editType, editRefId)})
                                </label>
                                <input
                                  type="number"
                                  min="0.1"
                                  step="0.1"
                                  placeholder="0"
                                  value={editQty || ""}
                                  onChange={(e) => setEditQty(parseFloat(e.target.value) || 0)}
                                  className="input"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateIngredient(i)}
                                disabled={editRefId === "" || editQty <= 0}
                                className="btn btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <Save size={14} /> Salvar
                              </button>
                              <button onClick={cancelEdit} className="btn btn-secondary text-sm">
                                <X size={14} /> Cancelar
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}

                {/* Add new ingredient row */}
                {showAddNew && (
                  <tr className="border-b border-border">
                    <td colSpan={4} className="px-4 py-4">
                      <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_5rem] gap-3 items-end">
                          <div>
                            <label className="block text-xs font-medium mb-1 text-muted-foreground">Tipo</label>
                            <select
                              value={addType}
                              onChange={(e) => {
                                setAddType(e.target.value as "raw_material" | "recipe");
                                setAddRefId("");
                              }}
                              className="input"
                            >
                              <option value="raw_material">Matéria Prima</option>
                              <option value="recipe">Receita</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1 text-muted-foreground">Item</label>
                            <IngredientSearch
                              options={addType === "raw_material"
                                ? materials.map((m) => ({ id: m.id!, name: m.name }))
                                : recipes.filter((r) => String(r.id) !== String(id)).map((r) => ({ id: r.id!, name: r.name }))
                              }
                              value={addRefId}
                              onChange={setAddRefId}
                              placeholder={addType === "raw_material" ? "Buscar matéria prima..." : "Buscar receita..."}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1 text-muted-foreground">
                              Qtd ({getSelectedUnit(addType, addRefId)})
                            </label>
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              placeholder="0"
                              value={addQty || ""}
                              onChange={(e) => setAddQty(parseFloat(e.target.value) || 0)}
                              className="input"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddIngredient}
                            disabled={addRefId === "" || addQty <= 0}
                            className="btn btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Save size={14} /> Adicionar
                          </button>
                          <button
                            onClick={() => {
                              setShowAddNew(false);
                              setAddRefId("");
                              setAddQty(0);
                            }}
                            className="btn btn-secondary text-sm"
                          >
                            <X size={14} /> Cancelar
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modo de Preparo */}
        {(recipe.steps ?? []).length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Modo de Preparo
              </h2>
              {(recipe.prepTimeMin ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={14} />
                  {recipe.prepTimeMin} min
                </span>
              )}
            </div>
            <ol className="space-y-2 list-decimal list-inside text-sm">
              {recipe.steps.map((step, i) => (
                <li key={i} className="leading-relaxed">{step}</li>
              ))}
            </ol>
          </div>
        )}

        {/* ANVISA RDC 429/2020 Nutrition Label */}
        {nutrition && (
          <NutritionLabel
            nutrition={nutrition}
            yieldGrams={recipe.yieldGrams}
            servingSize={recipe.servingSize ?? 0}
            servingName={recipe.servingName ?? ""}
          />
        )}
      </div>
    </div>
  );
}
