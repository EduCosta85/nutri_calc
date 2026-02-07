import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, X, Save, Camera } from "lucide-react";
import { useRecipes } from "../hooks/useRecipes";
import { useRawMaterials } from "../hooks/useRawMaterials";
import { TagInput } from "../components/TagInput";
import type { RecipeIngredient } from "../types";

export function RecipeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, add, update, getById } = useRecipes();
  const { materials } = useRawMaterials();
  const isEditing = id !== undefined;

  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [yieldGrams, setYieldGrams] = useState(0);
  const [servingSize, setServingSize] = useState(0);
  const [servingName, setServingName] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [prepTimeMin, setPrepTimeMin] = useState(0);
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [addType, setAddType] = useState<"raw_material" | "recipe">("raw_material");
  const [addRefId, setAddRefId] = useState<number | "">("");
  const [addQty, setAddQty] = useState<number>(0);

  useEffect(() => {
    if (id) {
      getById(Number(id)).then((r) => {
        if (r) {
          setName(r.name);
          setTags(r.tags ?? []);
          setYieldGrams(r.yieldGrams);
          setServingSize(r.servingSize ?? 0);
          setServingName(r.servingName ?? "");
          setIngredients(r.ingredients);
          setSteps(r.steps ?? []);
          setPrepTimeMin(r.prepTimeMin ?? 0);
          setPhoto(r.photo);
        }
      });
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const recipeOptions = recipes.filter((r) => r.id !== Number(id));

  function addIngredient() {
    if (addRefId === "" || addQty <= 0) return;
    setIngredients((prev) => [
      ...prev,
      { type: addType, referenceId: Number(addRefId), quantity: addQty },
    ]);
    setAddRefId("");
    setAddQty(0);
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  function getIngredientName(ing: RecipeIngredient): string {
    if (ing.type === "raw_material") {
      return materials.find((m) => m.id === ing.referenceId)?.name ?? "???";
    }
    return recipes.find((r) => r.id === ing.referenceId)?.name ?? "???";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      name,
      tags,
      yieldGrams,
      servingSize,
      servingName,
      ingredients,
      steps,
      prepTimeMin,
      photo,
    };
    if (isEditing) {
      await update(Number(id), data);
    } else {
      await add(data);
    }
    navigate("/receitas");
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

      <div className="card max-w-xl mx-auto">
        <h1 className="text-xl font-bold mb-6">
          {isEditing ? "Editar" : "Nova"} Receita
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Nome</label>
            <input
              type="text"
              required
              placeholder="Ex: Bolo de cenoura"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Foto</label>
            <div className="flex items-center gap-4">
              {photo ? (
                <div className="relative">
                  <img
                    src={photo}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setPhoto(undefined)}
                    className="absolute -top-2 -right-2 p-0.5 rounded-full bg-destructive text-destructive-foreground"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Camera size={20} />
                  <span className="text-[10px] mt-1">Adicionar</span>
                </button>
              )}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setPhoto(reader.result as string);
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Tags</label>
            <TagInput
              tags={tags}
              onChange={setTags}
              suggestions={["bolo", "salgado", "doce", "sem gluten", "sem lactose", "vegano"]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Rendimento (g)</label>
              <input
                type="number"
                min="1"
                required
                placeholder="1200"
                value={yieldGrams || ""}
                onChange={(e) => setYieldGrams(parseFloat(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Porcao (g)</label>
              <input
                type="number"
                min="1"
                required
                placeholder="80"
                value={servingSize || ""}
                onChange={(e) => setServingSize(parseFloat(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Medida caseira</label>
              <input
                type="text"
                required
                placeholder="Ex: 1 fatia"
                value={servingName}
                onChange={(e) => setServingName(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Ingredientes
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>

            {ingredients.length > 0 && (
              <ul className="space-y-2 mb-4">
                {ingredients.map((ing, i) => (
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
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{ing.quantity}g</span>
                      <button
                        type="button"
                        onClick={() => removeIngredient(i)}
                        className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Add ingredient */}
            <div className="bg-secondary/40 rounded-lg p-4 space-y-3">
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
                    <option value="raw_material">Materia Prima</option>
                    <option value="recipe">Receita</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Item</label>
                  <select
                    value={addRefId}
                    onChange={(e) => setAddRefId(Number(e.target.value))}
                    className="input"
                  >
                    <option value="">Selecione...</option>
                    {addType === "raw_material"
                      ? materials.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))
                      : recipeOptions.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Qtd (g)</label>
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
              <button
                type="button"
                onClick={addIngredient}
                disabled={addRefId === "" || addQty <= 0}
                className="btn btn-secondary w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Adicionar ingrediente
              </button>
            </div>
          </div>

          {/* Modo de Preparo */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Modo de Preparo
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                Tempo de preparo (min)
              </label>
              <input
                type="number"
                min="0"
                placeholder="30"
                value={prepTimeMin || ""}
                onChange={(e) => setPrepTimeMin(parseInt(e.target.value) || 0)}
                className="input !w-32"
              />
            </div>

            {steps.length > 0 && (
              <ol className="space-y-2 mb-4 list-decimal list-inside">
                {steps.map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 bg-secondary/70 rounded-lg px-4 py-2.5 text-sm"
                  >
                    <span className="flex-1">{step}</span>
                    <button
                      type="button"
                      onClick={() => setSteps((prev) => prev.filter((_, j) => j !== i))}
                      className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ol>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Descreva o passo..."
                id="step-input"
                className="input flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const input = e.currentTarget;
                    if (input.value.trim()) {
                      setSteps((prev) => [...prev, input.value.trim()]);
                      input.value = "";
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById("step-input") as HTMLInputElement;
                  if (input?.value.trim()) {
                    setSteps((prev) => [...prev, input.value.trim()]);
                    input.value = "";
                  }
                }}
                className="btn btn-secondary !px-3"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              Salvar
            </button>
            <button
              type="button"
              onClick={() => navigate("/receitas")}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
