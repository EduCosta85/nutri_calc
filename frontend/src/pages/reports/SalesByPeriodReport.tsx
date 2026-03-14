import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { useQuickSales } from "../../hooks/useQuickSales";

type Period = "day" | "week" | "month";

function getDateKey(date: Date, period: Period): string {
  if (period === "day") return date.toISOString().slice(0, 10);
  if (period === "week") {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 7);
}

function formatDateKey(key: string, period: Period): string {
  if (period === "day") return new Date(key + "T00:00:00").toLocaleDateString("pt-BR");
  if (period === "week") return `Sem. ${new Date(key + "T00:00:00").toLocaleDateString("pt-BR")}`;
  const [year, month] = key.split("-");
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[parseInt(month) - 1]} ${year}`;
}

export function SalesByPeriodReportPage() {
  const navigate = useNavigate();
  const { sales } = useQuickSales();
  const [period, setPeriod] = useState<Period>("day");

  const completedSales = sales.filter((s) => s.status === "COMPLETED");

  const grouped = useMemo(() => {
    const groups = new Map<string, { count: number; revenue: number }>();

    for (const sale of completedSales) {
      const key = getDateKey(new Date(sale.createdAt), period);
      const existing = groups.get(key) ?? { count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += sale.totalAmount;
      groups.set(key, existing);
    }

    return [...groups.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, period === "day" ? 30 : period === "week" ? 12 : 12);
  }, [completedSales, period]);

  const maxRevenue = Math.max(...grouped.map(([, g]) => g.revenue), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/relatorios")} className="p-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Vendas por Período</h1>
      </div>

      {/* Period selector */}
      <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
        {([["day", "Diário"], ["week", "Semanal"], ["month", "Mensal"]] as [Period, string][]).map(([p, label]) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${period === p ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart-like bars */}
      {grouped.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar size={48} className="mx-auto mb-3 opacity-50" />
          <p>Nenhuma venda no período</p>
        </div>
      ) : (
        <div className="space-y-2">
          {grouped.map(([key, data]) => (
            <div key={key} className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{formatDateKey(key, period)}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-green-600 tabular-nums">R$ {data.revenue.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground ml-2">({data.count} vendas)</span>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ticket médio: R$ {(data.revenue / data.count).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
