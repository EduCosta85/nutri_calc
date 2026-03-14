import { Link } from "react-router-dom";
import { Plus, ShoppingCart, DollarSign, Truck } from "lucide-react";
import { useQuickSales } from "../../hooks/useQuickSales";

export function QuickSaleListPage() {
  const { sales, loading } = useQuickSales();

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" /></div>;
  }

  const sorted = [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendas Rápidas</h1>
        <Link to="/vendas/rapida/nova" className="btn btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> Nova Venda
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
          <p>Nenhuma venda realizada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((sale) => (
            <div key={sale.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <p className="font-medium">{sale.saleNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {sale.customerName || "Sem cliente"} · {new Date(sale.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {sale.paid && <DollarSign size={14} className="text-green-600" />}
                  {sale.delivered && <Truck size={14} className="text-blue-600" />}
                </div>
                <p className="font-bold tabular-nums">R$ {sale.totalAmount.toFixed(2)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  sale.status === "COMPLETED" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" :
                  sale.status === "CANCELLED" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" :
                  "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                }`}>
                  {sale.status === "COMPLETED" ? "Concluída" : sale.status === "CANCELLED" ? "Cancelada" : "Pendente"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
