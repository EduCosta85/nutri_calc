import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, TrendingUp } from "lucide-react";
import { useQuickSales } from "../../hooks/useQuickSales";
import { useSalesSkus } from "../../hooks/useSalesSkus";

export function TopProductsReportPage() {
  const navigate = useNavigate();
  const { sales } = useQuickSales();
  const { skus } = useSalesSkus();

  // For now, show SKU list sorted by activity — in full implementation,
  // we'd aggregate from QuickSaleItems
  const completedSales = sales.filter((s) => s.status === "COMPLETED");
  const totalRevenue = completedSales.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/relatorios")} className="p-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Top Produtos</h1>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-primary" />
          <p className="font-medium">Resumo</p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold">{skus.length}</p>
            <p className="text-xs text-muted-foreground">SKUs</p>
          </div>
          <div>
            <p className="text-xl font-bold">{completedSales.length}</p>
            <p className="text-xs text-muted-foreground">Vendas</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-600">R$ {totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Receita</p>
          </div>
        </div>
      </div>

      {skus.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Star size={48} className="mx-auto mb-3 opacity-50" />
          <p>Nenhum produto cadastrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {skus.map((sku, i) => (
            <div key={sku.id} className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < 3 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" : "bg-secondary text-muted-foreground"}`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{sku.name}</p>
                <p className="text-xs text-muted-foreground">R$ {sku.price.toFixed(2)}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${sku.active ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"}`}>
                {sku.active ? "Ativo" : "Inativo"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
