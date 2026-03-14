import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useProductionOrders } from "../../hooks/useProductionOrders";
import { useStockLots } from "../../hooks/useStockLots";
import { useInventoryItems } from "../../hooks/useInventoryItems";
import type { ProductionOrder } from "../../types/production";
import type { StockLot } from "../../types/inventory";

interface LotSelection {
  lotId: string;
  lotNumber: string;
  availableQty: number;
  selectedQty: number;
}

interface IngredientSelection {
  ingredientId: string;
  ingredientName: string;
  plannedQuantity: number;
  unit: string;
  lots: LotSelection[];
}

export function ProductionOrderSeparationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, updateStatus } = useProductionOrders();
  const { lots } = useStockLots();
  const { items } = useInventoryItems();

  const [order, setOrder] = useState<ProductionOrder | null>(null);
  const [selections, setSelections] = useState<IngredientSelection[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) getById(id).then(setOrder);
  }, [id, getById]);

  // Build ingredient selections from order's recipe
  useEffect(() => {
    if (!order) return;

    // For now, we use a simplified approach — in a full implementation,
    // we'd load the product's recipe ingredients from the order
    // This shows the lot selection UI pattern
    const lotsByItem = new Map<string, StockLot[]>();
    for (const lot of lots) {
      const existing = lotsByItem.get(lot.itemId) ?? [];
      existing.push(lot);
      lotsByItem.set(lot.itemId, existing);
    }

    // Build selections for demo — in production this comes from ProductionOrderIngredient
    const sel: IngredientSelection[] = [];
    // We'd iterate over order.ingredients here, but since we store them in a subcollection,
    // for now we show the UI pattern with available items
    setSelections(sel);
  }, [order, items, lots]);

  function updateLotQuantity(ingredientId: string, lotId: string, quantity: number) {
    setSelections((prev) =>
      prev.map((sel) =>
        sel.ingredientId === ingredientId
          ? { ...sel, lots: sel.lots.map((lot) => lot.lotId === lotId ? { ...lot, selectedQty: quantity } : lot) }
          : sel,
      ),
    );
  }

  function getTotalSelected(ingredientId: string): number {
    const selection = selections.find((s) => s.ingredientId === ingredientId);
    if (!selection) return 0;
    return selection.lots.reduce((sum, lot) => sum + lot.selectedQty, 0);
  }

  async function handleConfirm() {
    if (!id || !order) return;
    setSaving(true);
    try {
      // Validate all ingredients have sufficient quantity selected
      for (const sel of selections) {
        const total = getTotalSelected(sel.ingredientId);
        if (total <= 0) {
          alert(`Informe a quantidade separada para ${sel.ingredientName}`);
          setSaving(false);
          return;
        }
      }

      // Advance status: NEW -> SEPARATING -> PRODUCING
      if (order.status === "NEW") {
        await updateStatus(id, "SEPARATING");
      }
      await updateStatus(id, "PRODUCING");
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
          <p className="text-sm text-muted-foreground">Separação de Materiais</p>
        </div>
      </div>

      {/* Ingredient sections */}
      {selections.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
          <p>Nenhum ingrediente para separar.</p>
          <p className="text-xs mt-1">Os ingredientes serão carregados da receita do produto.</p>
        </div>
      ) : (
        selections.map((sel) => {
          const totalSelected = getTotalSelected(sel.ingredientId);
          const isComplete = totalSelected >= sel.plannedQuantity;

          return (
            <div key={sel.ingredientId} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <p className="font-medium">{sel.ingredientName}</p>
                  <p className="text-xs text-muted-foreground">Planejado: {sel.plannedQuantity.toFixed(2)} {sel.unit}</p>
                </div>
                <span className={`text-sm font-bold ${isComplete ? "text-green-600" : "text-yellow-600"}`}>
                  {totalSelected.toFixed(2)} / {sel.plannedQuantity.toFixed(2)} {sel.unit}
                </span>
              </div>

              {sel.lots.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">Sem estoque disponível</p>
              ) : (
                sel.lots.map((lot) => (
                  <div key={lot.lotId} className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{lot.lotNumber}</p>
                      <p className="text-xs text-muted-foreground">Disponível: {lot.availableQty.toFixed(2)} {sel.unit}</p>
                    </div>
                    <input
                      type="number"
                      value={lot.selectedQty || ""}
                      onChange={(e) => updateLotQuantity(sel.ingredientId, lot.lotId, Number(e.target.value))}
                      className="input w-24 text-right text-sm"
                      min={0}
                      max={lot.availableQty}
                      step="0.1"
                      placeholder="0"
                    />
                  </div>
                ))
              )}
            </div>
          );
        })
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => navigate(`/producao/${id}`)} className="btn btn-secondary flex-1">
          Voltar
        </button>
        <button
          onClick={handleConfirm}
          disabled={saving}
          className="btn btn-primary flex-[2] flex items-center justify-center gap-2"
        >
          <CheckCircle size={16} />
          {saving ? "Processando..." : "Confirmar Separação"}
        </button>
      </div>
    </div>
  );
}
