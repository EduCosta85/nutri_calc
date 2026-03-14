import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserX } from "lucide-react";
import { useCustomers } from "../../hooks/useCustomers";
import { useQuickSales } from "../../hooks/useQuickSales";

export function InactiveCustomersReportPage() {
  const navigate = useNavigate();
  const { customers } = useCustomers();
  const { sales } = useQuickSales();
  const [daysThreshold, setDaysThreshold] = useState(30);

  const inactiveCustomers = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysThreshold);

    // Build map of last purchase date per customer name
    const lastPurchase = new Map<string, Date>();
    for (const sale of sales) {
      if (sale.status !== "COMPLETED" || !sale.customerName) continue;
      const saleDate = new Date(sale.createdAt);
      const existing = lastPurchase.get(sale.customerName);
      if (!existing || saleDate > existing) {
        lastPurchase.set(sale.customerName, saleDate);
      }
    }

    return customers.filter((c) => {
      const last = lastPurchase.get(c.name);
      if (!last) return true; // Never purchased
      return last < cutoff;
    }).map((c) => ({
      ...c,
      lastPurchase: lastPurchase.get(c.name) ?? null,
      daysSincePurchase: lastPurchase.has(c.name)
        ? Math.floor((Date.now() - lastPurchase.get(c.name)!.getTime()) / (1000 * 60 * 60 * 24))
        : null,
    }));
  }, [customers, sales, daysThreshold]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/relatorios")} className="p-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Clientes Inativos</h1>
      </div>

      {/* Threshold config */}
      <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
        <label className="text-sm font-medium whitespace-nowrap">Sem compras há</label>
        <input
          type="number"
          value={daysThreshold}
          onChange={(e) => setDaysThreshold(Number(e.target.value))}
          className="input w-20 text-center"
          min={1}
        />
        <span className="text-sm text-muted-foreground">dias</span>
        <span className="ml-auto text-sm font-bold text-red-600">{inactiveCustomers.length} inativos</span>
      </div>

      {/* List */}
      {inactiveCustomers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <UserX size={48} className="mx-auto mb-3 opacity-50" />
          <p>Todos os clientes estão ativos!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {inactiveCustomers.map((customer) => (
            <div key={customer.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {customer.phone || "Sem telefone"}
                  {customer.instagram && ` · @${customer.instagram}`}
                </p>
              </div>
              <div className="text-right">
                {customer.lastPurchase ? (
                  <>
                    <p className="text-sm font-medium text-red-600">{customer.daysSincePurchase} dias</p>
                    <p className="text-xs text-muted-foreground">
                      Última: {customer.lastPurchase.toLocaleDateString("pt-BR")}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Nunca comprou</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
