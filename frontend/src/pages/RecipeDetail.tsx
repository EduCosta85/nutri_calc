import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Pencil, ArrowLeft, Clock, DollarSign } from "lucide-react";
import { useRecipes } from "../hooks/useRecipes";
import { useRawMaterials } from "../hooks/useRawMaterials";
import type { Recipe } from "../types";
import type { NutritionInfo, RecipeIngredient } from "../types";
import { calcRecipeNutrition } from "../utils/nutrition";
import { calcRecipeCost } from "../utils/cost";
import { NutritionLabel } from "../components/NutritionLabel";

export function RecipeDetailPage() {
  const { id } = useParams();
  const { getById, recipes } = useRecipes();
  const { materials } = useRawMaterials();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [nutrition, setNutrition] = useState<NutritionInfo | null>(null);
  const [cost, setCost] = useState<number | null>(null);

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

  function getIngredientName(ing: RecipeIngredient): string {
    if (ing.type === "raw_material") {
      return materials.find((m) => String(m.id) === String(ing.referenceId))?.name ?? "???";
    }
    return recipes.find((r) => String(r.id) === String(ing.referenceId))?.name ?? "???";
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

        {/* Ingredients */}
        <div className="card">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Ingredientes
          </h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <li
                key={i}
                className="flex items-center justify-between bg-secondary/70 rounded-lg px-4 py-2.5 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{getIngredientName(ing)}</span>
                  {ing.type === "recipe" && (
                    <span className="text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded font-medium">
                      receita
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground font-medium">{ing.quantity}g</span>
              </li>
            ))}
          </ul>
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
