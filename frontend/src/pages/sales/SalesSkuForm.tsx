import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Upload } from "lucide-react";
import { useSalesSkus } from "../../hooks/useSalesSkus";
import { useSkuComponents } from "../../hooks/useSkuComponents";
import { useInventoryItems } from "../../hooks/useInventoryItems";

interface LocalComponent {
  inventoryItemId: string;
  quantity: number;
}

export function SalesSkuFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add, update, getById } = useSalesSkus();
  const { components: existingComponents, replaceAll } = useSkuComponents(id);
  const { items: inventoryItems } = useInventoryItems();
  const isEditing = !!id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [active, setActive] = useState(true);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [components, setComponents] = useState<LocalComponent[]>([]);
  const [saving, setSaving] = useState(false);
  const [componentsLoaded, setComponentsLoaded] = useState(false);

  // Load SKU data on edit
  useEffect(() => {
    if (isEditing) {
      getById(id).then((sku) => {
        if (sku) {
          setName(sku.name);
          setDescription(sku.description ?? "");
          setPrice(sku.price);
          setActive(sku.active);
          setPhotoUri(sku.photoUri ?? null);
        }
      });
    }
  }, [id, isEditing, getById]);

  // Load existing components on edit
  useEffect(() => {
    if (isEditing && existingComponents.length > 0 && !componentsLoaded) {
      setComponents(
        existingComponents.map((c) => ({
          inventoryItemId: c.inventoryItemId,
          quantity: c.quantity,
        })),
      );
      setComponentsLoaded(true);
    }
  }, [isEditing, existingComponents, componentsLoaded]);

  function addComponent() {
    setComponents((prev) => [...prev, { inventoryItemId: "", quantity: 1 }]);
  }

  function updateComponent(index: number, field: keyof LocalComponent, value: string | number) {
    setComponents((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  }

  function removeComponent(index: number) {
    setComponents((prev) => prev.filter((_, i) => i !== index));
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") setPhotoUri(ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!name.trim() || price <= 0) return;
    setSaving(true);
    try {
      const validComponents = components.filter((c) => c.inventoryItemId && c.quantity > 0);

      if (isEditing) {
        await update(id, { name: name.trim(), description, price, active, photoUri });
        await replaceAll(id, validComponents);
      } else {
        const skuId = await add({ name: name.trim(), description, price, active, photoUri });
        if (validComponents.length > 0) {
          await replaceAll(skuId, validComponents);
        }
      }
      navigate("/vendas");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/vendas")} className="p-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">{isEditing ? "Editar SKU" : "Novo SKU"}</h1>
      </div>

      <div className="space-y-4 bg-card border border-border rounded-lg p-6">
        {/* Photo */}
        <div>
          <label className="block text-sm font-medium mb-1">Foto</label>
          <div className="flex items-center gap-4">
            {photoUri ? (
              <img src={photoUri} alt="SKU" className="w-20 h-20 rounded-lg object-cover border border-border" />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center border border-border">
                <Upload size={24} className="text-muted-foreground" />
              </div>
            )}
            <div>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-sm" />
              {photoUri && (
                <button onClick={() => setPhotoUri(null)} className="text-xs text-red-500 mt-1">
                  Remover foto
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input w-full" placeholder="Nome do produto" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="input w-full" placeholder="Descrição (opcional)" />
        </div>

        {/* Price + Active */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Preço (R$)</label>
            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="input w-full" min={0} step="0.01" />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="rounded" />
              <span className="text-sm">Ativo</span>
            </label>
          </div>
        </div>

        {/* Components */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Composição (ingredientes do estoque)</h3>
            <button onClick={addComponent} className="text-xs text-primary flex items-center gap-1">
              <Plus size={14} /> Adicionar
            </button>
          </div>
          {components.length === 0 && (
            <p className="text-xs text-muted-foreground py-2">Nenhum componente. Adicione itens do estoque que compõem este produto.</p>
          )}
          {components.map((comp, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <select
                value={comp.inventoryItemId}
                onChange={(e) => updateComponent(i, "inventoryItemId", e.target.value)}
                className="input flex-1 text-sm"
              >
                <option value="">Selecione item do estoque...</option>
                {inventoryItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.unit})
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={comp.quantity}
                onChange={(e) => updateComponent(i, "quantity", Number(e.target.value))}
                className="input w-24 text-sm"
                min={0}
                step="0.1"
                placeholder="Qtd"
              />
              <button onClick={() => removeComponent(i)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving || !name.trim() || price <= 0} className="btn btn-primary w-full flex items-center justify-center gap-2">
          <Save size={16} /> {saving ? "Salvando..." : isEditing ? "Salvar" : "Criar SKU"}
        </button>
      </div>
    </div>
  );
}
