import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, AlertTriangle, Clock, Package } from "lucide-react";
import { useInventoryItems } from "../../hooks/useInventoryItems";
import { useStockLots } from "../../hooks/useStockLots";
import type { ItemType } from "../../types/common";
import { calcTotalStock } from "../../services/stock";
import { detectLowStock, detectExpiringLots } from "../../services/stock-alerts";

const TABS: { type: ItemType; label: string }[] = [
  { type: "raw_material", label: "Matérias Primas" },
  { type: "product", label: "Produtos" },
  { type: "packaging", label: "Embalagens" },
];

export function InventoryListPage() {
  const [activeTab, setActiveTab] = useState<ItemType>("raw_material");
  const [search, setSearch] = useState("");
  const { items, loading } = useInventoryItems(activeTab);
  const { lots } = useStockLots();

  const lotsByItem = new Map<string, typeof lots>();
  for (const lot of lots) {
    const existing = lotsByItem.get(lot.itemId) ?? [];
    existing.push(lot);
    lotsByItem.set(lot.itemId, existing);
  }

  const lowStockAlerts = detectLowStock(items, lotsByItem);
  const expiryAlerts = detectExpiringLots(items, lotsByItem);

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Estoque</h1>
        <Link to="/estoque/novo" className="btn btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> Novo item
        </Link>
      </div>

      {/* Alerts */}
      {(lowStockAlerts.length > 0 || expiryAlerts.length > 0) && (
        <div className="space-y-2">
          {lowStockAlerts.map((alert) => (
            <div key={alert.item.id} className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm">
              <AlertTriangle size={16} className="text-yellow-600 shrink-0" />
              <span><strong>{alert.item.name}</strong>: estoque baixo ({alert.currentStock} / {alert.threshold})</span>
            </div>
          ))}
          {expiryAlerts.slice(0, 5).map((alert) => (
            <div key={alert.lot.id} className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm">
              <Clock size={16} className="text-red-600 shrink-0" />
              <span><strong>{alert.item.name}</strong> (Lote {alert.lot.lotNumber}): vence em {alert.daysUntilExpiry} dias</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
        {TABS.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === type
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9 w-full"
        />
      </div>

      {/* Item list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package size={48} className="mx-auto mb-3 opacity-50" />
          <p>Nenhum item encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const itemLots = lotsByItem.get(item.id!) ?? [];
            const totalStock = calcTotalStock(itemLots);
            const isLowStock = totalStock < item.lowStockThreshold;

            return (
              <Link
                key={item.id}
                to={`/estoque/${item.id}`}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  {item.photoUri ? (
                    <img src={item.photoUri} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Package size={20} className="text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.unit} · Custo médio: R$ {item.averageCost.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold tabular-nums ${isLowStock ? "text-yellow-600" : ""}`}>
                    {totalStock.toFixed(1)} {item.unit}
                  </p>
                  <p className="text-xs text-muted-foreground">{itemLots.length} lotes</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
