import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useRawMaterials } from "../hooks/useRawMaterials";
import { TagInput } from "../components/TagInput";
import { TacoSearch } from "../components/TacoSearch";
import type { TacoItem } from "../data/taco";
import type { RawMaterial } from "../types";

const EMPTY: Omit<RawMaterial, "id"> = {
  name: "",
  unit: "g",
  tags: [],
  pricePer100g: 0,
  caloriesPer100g: 0,
  carbsPer100g: 0,
  totalSugarsPer100g: 0,
  addedSugarsPer100g: 0,
  proteinPer100g: 0,
  totalFatPer100g: 0,
  saturatedFatPer100g: 0,
  transFatPer100g: 0,
  fiberPer100g: 0,
  sodiumPer100g: 0,
};

const FIELDS = [
  { key: "caloriesPer100g", label: "Valor energetico", unit: "kcal" },
  { key: "carbsPer100g", label: "Carboidratos", unit: "g" },
  { key: "totalSugarsPer100g", label: "Acucares totais", unit: "g" },
  { key: "addedSugarsPer100g", label: "Acucares adicionados", unit: "g" },
  { key: "proteinPer100g", label: "Proteinas", unit: "g" },
  { key: "totalFatPer100g", label: "Gorduras totais", unit: "g" },
  { key: "saturatedFatPer100g", label: "Gorduras saturadas", unit: "g" },
  { key: "transFatPer100g", label: "Gorduras trans", unit: "g" },
  { key: "fiberPer100g", label: "Fibra alimentar", unit: "g" },
  { key: "sodiumPer100g", label: "Sodio", unit: "mg" },
] as const;

export function RawMaterialFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add, update, getById } = useRawMaterials();
  const [form, setForm] = useState(EMPTY);
  const isEditing = id !== undefined;

  useEffect(() => {
    if (id) {
      getById(Number(id)).then((m) => {
        if (m) setForm(m);
      });
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  function set(field: keyof typeof form, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleTacoSelect(item: TacoItem) {
    setForm((prev) => ({
      ...prev,
      name: prev.name || item.name,
      caloriesPer100g: item.cal,
      carbsPer100g: item.carb,
      totalSugarsPer100g: item.sugT,
      addedSugarsPer100g: item.sugA,
      proteinPer100g: item.prot,
      totalFatPer100g: item.fatT,
      saturatedFatPer100g: item.fatS,
      transFatPer100g: item.fatTr,
      fiberPer100g: item.fib,
      sodiumPer100g: item.sod,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEditing) {
      await update(Number(id), form);
    } else {
      await add(form);
    }
    navigate("/materias-primas");
  }

  return (
    <div>
      <Link
        to="/materias-primas"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <div className="card max-w-2xl mx-auto">
        <h1 className="text-xl font-bold mb-6">
          {isEditing ? "Editar" : "Nova"} Materia Prima
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Preencher via tabela TACO</label>
              <TacoSearch onSelect={handleTacoSelect} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Nome</label>
              <input
                type="text"
                required
                placeholder="Ex: Farinha de trigo"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Unidade</label>
              <select
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                className="input"
              >
                <option value="g">Gramas (g)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="un">Unidade (un)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Tags</label>
              <TagInput
                tags={form.tags}
                onChange={(tags) => setForm((prev) => ({ ...prev, tags }))}
                suggestions={["sem gluten", "sem lactose", "vegano", "organico", "integral"]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Preco por 100{form.unit} (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.pricePer100g || ""}
                onChange={(e) => set("pricePer100g", parseFloat(e.target.value) || 0)}
                className="input"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Valores por 100{form.unit}
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
              {FIELDS.map(({ key, label, unit }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1.5">
                    {label} <span className="text-muted-foreground font-normal">({unit})</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form[key]}
                    onChange={(e) => set(key, parseFloat(e.target.value) || 0)}
                    className="input"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              Salvar
            </button>
            <button
              type="button"
              onClick={() => navigate("/materias-primas")}
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
