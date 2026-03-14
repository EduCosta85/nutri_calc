import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useInventoryItems } from "../../hooks/useInventoryItems";
import { useProductionOrders } from "../../hooks/useProductionOrders";

export function ProductionOrderFormPage() {
  const navigate = useNavigate();
  const { items } = useInventoryItems("product");
  const { add } = useProductionOrders();

  const [productId, setProductId] = useState("");
  const [targetQuantity, setTargetQuantity] = useState(1);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!productId || targetQuantity <= 0) return;
    setSaving(true);
    try {
      await add({ productId, targetQuantity });
      navigate("/producao");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/producao")} className="p-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Nova Ordem de Produção</h1>
      </div>

      <div className="space-y-4 bg-card border border-border rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium mb-1">Produto</label>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className="input w-full">
            <option value="">Selecione um produto...</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Quantidade alvo</label>
          <input
            type="number"
            value={targetQuantity}
            onChange={(e) => setTargetQuantity(Number(e.target.value))}
            className="input w-full"
            min={1}
            step="0.1"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !productId || targetQuantity <= 0}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          <Save size={16} />
          {saving ? "Criando..." : "Criar Ordem de Produção"}
        </button>
      </div>
    </div>
  );
}
