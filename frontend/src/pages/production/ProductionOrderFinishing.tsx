import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, Undo2, AlertTriangle } from "lucide-react";
import { useProductionOrders } from "../../hooks/useProductionOrders";
import type { ProductionOrder } from "../../types/production";

interface IngredientReturn {
  ingredientId: string;
  ingredientName: string;
  actualQuantity: number;
  returnedQuantity: number;
  lossQuantity: number;
}

export function ProductionOrderFinishingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, update } = useProductionOrders();

  const [order, setOrder] = useState<ProductionOrder | null>(null);
  const [outputQuantity, setOutputQuantity] = useState(0);
  const [returns, setReturns] = useState<IngredientReturn[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) getById(id).then(setOrder);
  }, [id, getById]);

  function updateReturn(ingredientId: string, field: "returnedQuantity" | "lossQuantity", value: number) {
    setReturns((prev) =>
      prev.map((r) => r.ingredientId === ingredientId ? { ...r, [field]: value } : r),
    );
  }

  async function handleComplete() {
    if (!id || outputQuantity <= 0) {
      alert("Informe a quantidade produzida");
      return;
    }
    setSaving(true);
    try {
      await update(id, {
        actualQuantity: outputQuantity,
        status: "COMPLETED",
        completedAt: new Date().toISOString(),
      });
      navigate(`/producao/${id}`);
    } finally {
      setSaving(false);
    }
  }

  if (!order) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/producao/${id}`)} className="p-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">Finalização</p>
        </div>
      </div>

      {/* Output quantity */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <CheckCircle size={18} className="text-green-600" />
          Quantidade Produzida
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Quantidade alvo</label>
            <p className="text-xl font-bold">{order.targetQuantity}</p>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Quantidade real</label>
            <input
              type="number"
              value={outputQuantity || ""}
              onChange={(e) => setOutputQuantity(Number(e.target.value))}
              className="input w-full text-xl font-bold"
              min={0}
              step="0.1"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Returns & losses */}
      {returns.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Undo2 size={18} className="text-blue-600" />
            Devoluções e Perdas
          </h3>
          {returns.map((ret) => (
            <div key={ret.ingredientId} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <p className="font-medium text-sm">{ret.ingredientName}</p>
              <p className="text-xs text-muted-foreground">Qtd usada: {ret.actualQuantity.toFixed(2)}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-0.5">Devolvido</label>
                  <input
                    type="number"
                    value={ret.returnedQuantity || ""}
                    onChange={(e) => updateReturn(ret.ingredientId, "returnedQuantity", Number(e.target.value))}
                    className="input w-full text-sm"
                    min={0}
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                    <AlertTriangle size={10} className="text-red-500" /> Perda
                  </label>
                  <input
                    type="number"
                    value={ret.lossQuantity || ""}
                    onChange={(e) => updateReturn(ret.ingredientId, "lossQuantity", Number(e.target.value))}
                    className="input w-full text-sm"
                    min={0}
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => navigate(`/producao/${id}`)} className="btn btn-secondary flex-1">Voltar</button>
        <button
          onClick={handleComplete}
          disabled={saving || outputQuantity <= 0}
          className="btn btn-primary flex-[2] flex items-center justify-center gap-2"
        >
          <CheckCircle size={16} />
          {saving ? "Concluindo..." : "Concluir OP"}
        </button>
      </div>
    </div>
  );
}
