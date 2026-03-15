import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ShoppingCart, DollarSign, Truck, XCircle, CheckCircle } from "lucide-react";
import { useQuickSales } from "../../hooks/useQuickSales";
import type { SaleStatus } from "../../types/common";

const STATUS_FILTERS: Array<{ value: SaleStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Todas" },
  { value: "PENDING", label: "Pendente" },
  { value: "COMPLETED", label: "Concluída" },
  { value: "CANCELLED", label: "Cancelada" },
];

export function QuickSaleListPage() {
  const { sales, loading, updateStatus, markAsPaid, markAsDelivered } = useQuickSales();
  const [filter, setFilter] = useState<SaleStatus | "ALL">("ALL");

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" /></div>;
  }

  const filtered = filter === "ALL" ? sales : sales.filter((s) => s.status === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Status counts
  const counts: Record<string, number> = { ALL: sales.length };
  for (const s of sales) counts[s.status] = (counts[s.status] ?? 0) + 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendas Rápidas</h1>
        <Link to="/vendas/rapida/nova" className="btn btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> Nova Venda
        </Link>
      </div>

      {/* Status filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
              filter === value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              filter === value ? "bg-primary-foreground/20" : "bg-background"
            }`}>
              {counts[value] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
          <p>Nenhuma venda {filter !== "ALL" ? "com este status" : "realizada"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((sale) => (
            <div key={sale.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{sale.saleNumber}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      sale.status === "COMPLETED" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" :
                      sale.status === "CANCELLED" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" :
                      "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                    }`}>
                      {sale.status === "COMPLETED" ? "Concluída" : sale.status === "CANCELLED" ? "Cancelada" : "Pendente"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {sale.customerName || "Sem cliente"} · {new Date(sale.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <p className="text-lg font-bold tabular-nums text-green-600">R$ {sale.totalAmount.toFixed(2)}</p>
              </div>

              {/* Action buttons for pending sales */}
              {sale.status === "PENDING" && sale.id && (
                <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
                  {!sale.paid && (
                    <button onClick={() => markAsPaid(sale.id!)} className="text-xs px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 hover:bg-green-100 flex items-center gap-1">
                      <DollarSign size={12} /> Marcar Pago
                    </button>
                  )}
                  {!sale.delivered && (
                    <button onClick={() => markAsDelivered(sale.id!)} className="text-xs px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 flex items-center gap-1">
                      <Truck size={12} /> Marcar Entregue
                    </button>
                  )}
                  {sale.paid && sale.delivered && (
                    <button onClick={() => updateStatus(sale.id!, "COMPLETED")} className="text-xs px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 hover:bg-green-100 flex items-center gap-1">
                      <CheckCircle size={12} /> Concluir
                    </button>
                  )}
                  <button onClick={() => { if (confirm("Cancelar esta venda?")) updateStatus(sale.id!, "CANCELLED"); }} className="text-xs px-3 py-1.5 rounded-md bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-100 flex items-center gap-1">
                    <XCircle size={12} /> Cancelar
                  </button>
                </div>
              )}

              {/* Status indicators for non-pending */}
              {sale.status === "PENDING" && (sale.paid || sale.delivered) && (
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {sale.paid && <span className="flex items-center gap-1 text-green-600"><DollarSign size={12} /> Pago</span>}
                  {sale.delivered && <span className="flex items-center gap-1 text-blue-600"><Truck size={12} /> Entregue</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
