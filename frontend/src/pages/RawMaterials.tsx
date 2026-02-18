import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, ChevronUp } from "lucide-react";
import { useRawMaterials } from "../hooks/useRawMaterials";
import { TacoSearch } from "../components/TacoSearch";
import { TagInput } from "../components/TagInput";
import type { TacoItem } from "../data/taco";
import type { RawMaterial } from "../types";

const EMPTY: Omit<RawMaterial, "id"> = {
  name: "", unit: "g", tags: [],
  pricePer100g: 0, caloriesPer100g: 0, carbsPer100g: 0,
  totalSugarsPer100g: 0, addedSugarsPer100g: 0, proteinPer100g: 0,
  totalFatPer100g: 0, saturatedFatPer100g: 0, transFatPer100g: 0,
  fiberPer100g: 0, sodiumPer100g: 0,
};

const FIELDS = [
  { key: "caloriesPer100g",    label: "Kcal",       unit: "kcal" },
  { key: "carbsPer100g",       label: "Carb",       unit: "g" },
  { key: "totalSugarsPer100g", label: "Açúc. tot",  unit: "g" },
  { key: "addedSugarsPer100g", label: "Açúc. adic", unit: "g" },
  { key: "proteinPer100g",     label: "Prot",       unit: "g" },
  { key: "totalFatPer100g",    label: "Gord. tot",  unit: "g" },
  { key: "saturatedFatPer100g",label: "Gord. sat",  unit: "g" },
  { key: "transFatPer100g",    label: "Gord. trans",unit: "g" },
  { key: "fiberPer100g",       label: "Fibra",      unit: "g" },
  { key: "sodiumPer100g",      label: "Sódio",      unit: "mg" },
] as const;

function InlineForm({
  initial,
  onSave,
  onCancel,
  isNew = false,
}: {
  initial: Omit<RawMaterial, "id">;
  onSave: (data: Omit<RawMaterial, "id">) => Promise<void>;
  onCancel: () => void;
  isNew?: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  function set(field: keyof typeof form, value: string | number | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleTacoSelect(item: TacoItem) {
    setForm((prev) => ({
      ...prev,
      name: prev.name || item.name,
      caloriesPer100g: item.cal, carbsPer100g: item.carb,
      totalSugarsPer100g: item.sugT, addedSugarsPer100g: item.sugA,
      proteinPer100g: item.prot, totalFatPer100g: item.fatT,
      saturatedFatPer100g: item.fatS, transFatPer100g: item.fatTr,
      fiberPer100g: item.fib, sodiumPer100g: item.sod,
    }));
  }

  async function handleSave() {
    if (!form.name) return;
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  }

  return (
    <div className="bg-secondary/30 rounded-xl p-4 space-y-4 border border-border">
      {isNew && (
        <div>
          <label className="block text-xs font-medium mb-1 text-muted-foreground">Preencher via TACO</label>
          <TacoSearch onSelect={handleTacoSelect} />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium mb-1 text-muted-foreground">Nome *</label>
          <input className="input" required value={form.name}
            onChange={(e) => set("name", e.target.value)} placeholder="Ex: Farinha de trigo" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-muted-foreground">Unidade</label>
          <select className="input" value={form.unit} onChange={(e) => set("unit", e.target.value)}>
            <option value="g">g</option>
            <option value="ml">ml</option>
            <option value="un">un</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-muted-foreground">Preço/100 (R$)</label>
          <input className="input" type="number" step="0.01" min="0"
            value={form.pricePer100g || ""} onChange={(e) => set("pricePer100g", parseFloat(e.target.value) || 0)} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1 text-muted-foreground">Tags</label>
        <TagInput tags={form.tags} onChange={(tags) => set("tags", tags)}
          suggestions={["sem gluten", "sem lactose", "vegano", "organico", "integral"]} />
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Valores por 100{form.unit}</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {FIELDS.map(({ key, label, unit }) => (
            <div key={key}>
              <label className="block text-[10px] font-medium mb-1 text-muted-foreground">{label} ({unit})</label>
              <input className="input !py-1.5 !text-sm" type="number" step="0.01" min="0"
                value={form[key] || ""} onChange={(e) => set(key, parseFloat(e.target.value) || 0)} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} disabled={saving || !form.name}
          className="btn btn-primary text-sm disabled:opacity-40">
          <Save size={14} /> {saving ? "Salvando..." : "Salvar"}
        </button>
        <button onClick={onCancel} className="btn btn-secondary text-sm">
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  );
}

export function RawMaterialsPage() {
  const { materials, add, update, remove } = useRawMaterials();
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = materials.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string | number, name: string) {
    if (window.confirm(`Excluir "${name}"?`)) await remove(String(id));
  }

  async function handleUpdate(id: string | number, data: Omit<RawMaterial, "id">) {
    await update(String(id), data);
    setEditingId(null);
  }

  async function handleAdd(data: Omit<RawMaterial, "id">) {
    await add(data);
    setShowNew(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Matérias Primas</h1>
        <button onClick={() => { setShowNew(true); setEditingId(null); }} className="btn btn-primary">
          <Plus size={16} /> Nova
        </button>
      </div>

      {/* Search */}
      {materials.length > 0 && (
        <input className="input mb-4" placeholder="Buscar matéria prima..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      )}

      {/* New form */}
      {showNew && (
        <div className="mb-4">
          <InlineForm initial={EMPTY} onSave={handleAdd} onCancel={() => setShowNew(false)} isNew />
        </div>
      )}

      {materials.length === 0 && !showNew ? (
        <div className="card text-center py-12">
          <p className="text-muted-foreground mb-4">Nenhuma matéria prima cadastrada.</p>
          <button onClick={() => setShowNew(true)} className="btn btn-primary">
            <Plus size={16} /> Cadastrar primeira
          </button>
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          {/* Table header */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Nome</th>
                  <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Kcal</th>
                  <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Carb</th>
                  <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Prot</th>
                  <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Gord</th>
                  <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Sódio</th>
                  <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">R$/100</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <>
                    <tr
                      key={m.id}
                      className={`${i < filtered.length - 1 || editingId === m.id ? "border-b border-border" : ""} hover:bg-secondary/30 transition-colors`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{m.name}</span>
                          {(m.tags ?? []).map((t) => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium hidden sm:inline">{t}</span>
                          ))}
                        </div>
                      </td>
                      <td className="text-right px-3 py-2.5 tabular-nums text-muted-foreground">{m.caloriesPer100g}</td>
                      <td className="text-right px-3 py-2.5 tabular-nums text-muted-foreground">{m.carbsPer100g}g</td>
                      <td className="text-right px-3 py-2.5 tabular-nums text-muted-foreground">{m.proteinPer100g}g</td>
                      <td className="text-right px-3 py-2.5 tabular-nums text-muted-foreground">{m.totalFatPer100g}g</td>
                      <td className="text-right px-3 py-2.5 tabular-nums text-muted-foreground">{m.sodiumPer100g}mg</td>
                      <td className="text-right px-3 py-2.5 tabular-nums text-muted-foreground">
                        {m.pricePer100g > 0 ? `R$ ${m.pricePer100g.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setEditingId(editingId === m.id ? null : m.id!)}
                            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                            title="Editar"
                          >
                            {editingId === m.id ? <ChevronUp size={16} /> : <Pencil size={16} />}
                          </button>
                          <button
                            onClick={() => handleDelete(m.id!, m.name)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-destructive"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline edit row */}
                    {editingId === m.id && (
                      <tr key={`${m.id}-edit`} className="border-b border-border">
                        <td colSpan={8} className="px-4 py-4">
                          <InlineForm
                            initial={m}
                            onSave={(data) => handleUpdate(m.id!, data)}
                            onCancel={() => setEditingId(null)}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && search && (
            <p className="text-center text-muted-foreground py-8 text-sm">Nenhum resultado para "{search}"</p>
          )}
        </div>
      )}
    </div>
  );
}
