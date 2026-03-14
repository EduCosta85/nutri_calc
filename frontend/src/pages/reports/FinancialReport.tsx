import { useState } from "react";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuickSales } from "../../hooks/useQuickSales";

type SortBy = "revenue" | "quantity" | "profit" | "margin";

export function FinancialReportPage() {
  const navigate = useNavigate();
  const { sales } = useQuickSales();
  const [sortBy, setSortBy] = useState<SortBy>("revenue");

  // Aggregate by sale for now (will be enhanced with SKU breakdown later)
  const completedSales = sales.filter((s) => s.status === "COMPLETED");
  const totalRevenue = completedSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalOrders = completedSales.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/relatorios")} className="p-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Relatório Financeiro</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold tabular-nums text-green-600">R$ {totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Receita Total</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold tabular-nums">{totalOrders}</p>
          <p className="text-xs text-muted-foreground">Vendas</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold tabular-nums">R$ {avgTicket.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Ticket Médio</p>
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex gap-2">
        {(["revenue", "quantity", "profit", "margin"] as SortBy[]).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium ${sortBy === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
          >
            {s === "revenue" ? "Receita" : s === "quantity" ? "Quantidade" : s === "profit" ? "Lucro" : "Margem"}
          </button>
        ))}
      </div>

      {/* Sales list */}
      <div className="space-y-2">
        {completedSales.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Nenhuma venda concluída para análise</p>
        ) : (
          completedSales.map((sale) => (
            <div key={sale.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <p className="font-medium text-sm">{sale.saleNumber}</p>
                <p className="text-xs text-muted-foreground">{sale.customerName || "Sem cliente"} · {new Date(sale.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
              <div className="text-right">
                <p className="font-bold tabular-nums text-green-600 flex items-center gap-1">
                  <TrendingUp size={14} /> R$ {sale.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
