import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useInventoryItems } from "../../hooks/useInventoryItems";
import { useStockLots } from "../../hooks/useStockLots";
import { calcTotalStock, calcWeightedAverageCost } from "../../services/stock";

export function PurchaseBalanceReportPage() {
  const navigate = useNavigate();
  const { items } = useInventoryItems("raw_material");
  const { lots } = useStockLots();

  const report = useMemo(() => {
    const lotsByItem = new Map<string, typeof lots>();
    for (const lot of lots) {
      const existing = lotsByItem.get(lot.itemId) ?? [];
      existing.push(lot);
      lotsByItem.set(lot.itemId, existing);
    }

    return items.map((item) => {
      const itemLots = lotsByItem.get(item.id!) ?? [];
      const totalStock = calcTotalStock(itemLots);
      const avgCost = calcWeightedAverageCost(itemLots);
      const totalValue = totalStock * avgCost;

      return { item, totalStock, avgCost, totalValue, lotCount: itemLots.length };
    }).sort((a, b) => b.totalValue - a.totalValue);
  }, [items, lots]);

  const grandTotal = report.reduce((sum, r) => sum + r.totalValue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/relatorios")} className="p-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Balanço de Compras</h1>
      </div>

      {/* Summary */}
      <div className="bg-card border border-border rounded-lg p-4 text-center">
        <p className="text-xs text-muted-foreground">Valor Total em Estoque</p>
        <p className="text-3xl font-bold text-primary tabular-nums">R$ {grandTotal.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-1">{items.length} matérias primas · {lots.length} lotes</p>
      </div>

      {/* Items */}
      {report.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingBag size={48} className="mx-auto mb-3 opacity-50" />
          <p>Nenhuma matéria prima em estoque</p>
        </div>
      ) : (
        <div className="space-y-2">
          {report.map(({ item, totalStock, avgCost, totalValue, lotCount }) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {totalStock.toFixed(1)} {item.unit} · {lotCount} lotes · Custo médio: R$ {avgCost.toFixed(2)}/{item.unit}
                </p>
              </div>
              <p className="font-bold tabular-nums">R$ {totalValue.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
