import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Package } from "lucide-react";
import { useStockMovements } from "../../hooks/useStockMovements";
import { useInventoryItems } from "../../hooks/useInventoryItems";
import type { InventoryItem } from "../../types/inventory";

const SOURCE_LABELS: Record<string, string> = {
  manual: "Entrada Manual",
  production_input: "Produção (Entrada)",
  production_output: "Produção (Saída)",
  production_return: "Devolução Produção",
  sale: "Venda",
  sale_cancellation: "Cancelamento Venda",
  order_separation: "Separação Pedido",
  order_cancellation: "Cancelamento Pedido",
};

export function StockMovementHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { movements, loading } = useStockMovements(id);
  const { getById } = useInventoryItems();
  const [item, setItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    if (id) getById(id).then(setItem);
  }, [id, getById]);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(id ? `/estoque/${id}` : "/estoque")} className="p-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Movimentações</h1>
          {item && <p className="text-sm text-muted-foreground">{item.name}</p>}
        </div>
      </div>

      {movements.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package size={48} className="mx-auto mb-3 opacity-50" />
          <p>Nenhuma movimentação registrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {movements.map((mov) => {
            const isEntry = mov.direction === "entry";
            return (
              <div key={mov.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isEntry ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"}`}>
                    {isEntry ? <TrendingUp size={16} className="text-green-600" /> : <TrendingDown size={16} className="text-red-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{SOURCE_LABELS[mov.source] ?? mov.source}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(mov.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
                <p className={`font-bold tabular-nums ${isEntry ? "text-green-600" : "text-red-600"}`}>
                  {isEntry ? "+" : "-"}{Math.abs(mov.quantity).toFixed(2)} {item?.unit ?? ""}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
