import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import { useInventoryItems } from "../../hooks/useInventoryItems";
import { TagInput } from "../../components/TagInput";
import type { ItemType } from "../../types/common";
import type { InventoryItem, NutritionalInfo } from "../../types/inventory";

const EMPTY_NUTRITIONAL: NutritionalInfo = {
  energyValue: 0, carbohydrates: 0, totalSugars: 0, addedSugars: 0,
  proteins: 0, totalFat: 0, saturatedFat: 0, transFat: 0,
  fiber: 0, sodium: 0,
};

const NUTRITION_FIELDS = [
  { key: "energyValue", label: "Valor energético", unit: "kcal" },
  { key: "carbohydrates", label: "Carboidratos", unit: "g" },
  { key: "totalSugars", label: "Açúcares totais", unit: "g" },
  { key: "addedSugars", label: "Açúcares adicionados", unit: "g" },
  { key: "proteins", label: "Proteínas", unit: "g" },
  { key: "totalFat", label: "Gorduras totais", unit: "g" },
  { key: "saturatedFat", label: "Gorduras saturadas", unit: "g" },
  { key: "transFat", label: "Gorduras trans", unit: "g" },
  { key: "fiber", label: "Fibra alimentar", unit: "g" },
  { key: "sodium", label: "Sódio", unit: "mg" },
] as const;

export function InventoryItemFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add, update, getById } = useInventoryItems();
  const isEditing = !!id;

  const [name, setName] = useState("");
  const [type, setType] = useState<ItemType>("raw_material");
  const [unit, setUnit] = useState("g");
  const [tags, setTags] = useState<string[]>([]);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [expiryWarningDays, setExpiryWarningDays] = useState(7);
  const [nutritionalInfo, setNutritionalInfo] = useState<NutritionalInfo>(EMPTY_NUTRITIONAL);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      getById(id).then((item) => {
        if (item) {
          setName(item.name);
          setType(item.type);
          setUnit(item.unit);
          setTags(item.tags ?? []);
          setLowStockThreshold(item.lowStockThreshold);
          setExpiryWarningDays(item.expiryWarningDays);
          if (item.nutritionalInfo) setNutritionalInfo(item.nutritionalInfo);
        }
      });
    }
  }, [id, isEditing, getById]);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const data: Partial<InventoryItem> = {
        name: name.trim(),
        type,
        unit,
        tags,
        lowStockThreshold,
        expiryWarningDays,
        nutritionalInfo: type === "raw_material" ? nutritionalInfo : undefined,
      };
      if (isEditing) {
        await update(id, data);
      } else {
        await add({
          ...data,
          name: data.name!,
          type: data.type!,
          unit: data.unit!,
          tags: data.tags!,
          lowStockThreshold: data.lowStockThreshold!,
          expiryWarningDays: data.expiryWarningDays!,
        });
      }
      navigate("/estoque");
    } finally {
      setSaving(false);
    }
  }

  function setNutri(key: keyof NutritionalInfo, value: number) {
    setNutritionalInfo((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/estoque")} className="p-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">{isEditing ? "Editar Item" : "Novo Item"}</h1>
      </div>

      <div className="space-y-4 bg-card border border-border rounded-lg p-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input w-full" placeholder="Nome do item" />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value as ItemType)} className="input w-full" disabled={isEditing}>
            <option value="raw_material">Matéria Prima</option>
            <option value="product">Produto</option>
            <option value="packaging">Embalagem</option>
          </select>
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium mb-1">Unidade</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input w-full">
            <option value="g">Grama (g)</option>
            <option value="kg">Quilograma (kg)</option>
            <option value="ml">Mililitro (ml)</option>
            <option value="L">Litro (L)</option>
            <option value="un">Unidade (un)</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <TagInput tags={tags} onChange={setTags} />
        </div>

        {/* Alert thresholds */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Estoque mínimo</label>
            <input type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(Number(e.target.value))} className="input w-full" min={0} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alerta de validade (dias)</label>
            <input type="number" value={expiryWarningDays} onChange={(e) => setExpiryWarningDays(Number(e.target.value))} className="input w-full" min={1} />
          </div>
        </div>

        {/* Nutritional info — only for raw materials */}
        {type === "raw_material" && (
          <div>
            <h3 className="text-sm font-semibold mb-2 mt-4">Informação Nutricional (por 100g/ml)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {NUTRITION_FIELDS.map(({ key, label, unit: u }) => (
                <div key={key}>
                  <label className="block text-xs text-muted-foreground mb-0.5">{label} ({u})</label>
                  <input
                    type="number"
                    value={nutritionalInfo[key] ?? 0}
                    onChange={(e) => setNutri(key, Number(e.target.value))}
                    className="input w-full text-sm"
                    min={0}
                    step="0.1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          <Save size={16} />
          {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar item"}
        </button>
      </div>
    </div>
  );
}
