import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Factory, Play, Pause, CheckCircle, XCircle } from "lucide-react";
import { useProductionOrders } from "../../hooks/useProductionOrders";
import { formatTime, getElapsedSeconds, isTimerRunning } from "../../services/production-timer";
import type { ProductionOrderStatus } from "../../types/common";

const STATUS_LABELS: Record<ProductionOrderStatus, { label: string; color: string }> = {
  NEW: { label: "Nova", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  SEPARATING: { label: "Separando", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" },
  PRODUCING: { label: "Produzindo", color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300" },
  FINISHING: { label: "Finalizando", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
  COMPLETED: { label: "Concluída", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
  CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
};

export function ProductionOrderListPage() {
  const [filter, setFilter] = useState<ProductionOrderStatus | "ALL">("ALL");
  const { orders, loading } = useProductionOrders(filter === "ALL" ? undefined : filter);

  const activeOrders = orders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status));
  const displayOrders = filter === "ALL" ? orders : orders;

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
        <div>
          <h1 className="text-2xl font-bold">Produção</h1>
          <p className="text-sm text-muted-foreground">{activeOrders.length} ordens ativas</p>
        </div>
        <Link to="/producao/nova" className="btn btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> Nova OP
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${filter === "ALL" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
        >
          Todas
        </button>
        {(Object.keys(STATUS_LABELS) as ProductionOrderStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${filter === status ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
          >
            {STATUS_LABELS[status].label}
          </button>
        ))}
      </div>

      {/* Order list */}
      {displayOrders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Factory size={48} className="mx-auto mb-3 opacity-50" />
          <p>Nenhuma ordem de produção</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayOrders.map((order) => {
            const statusInfo = STATUS_LABELS[order.status];
            const running = isTimerRunning(order);
            const elapsed = getElapsedSeconds(order);

            return (
              <Link
                key={order.id}
                to={`/producao/${order.id}`}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${running ? "animate-pulse bg-orange-100 dark:bg-orange-950" : "bg-secondary"}`}>
                    {running ? <Play size={16} className="text-orange-600" /> : order.status === "COMPLETED" ? <CheckCircle size={16} className="text-green-600" /> : order.status === "CANCELLED" ? <XCircle size={16} className="text-red-600" /> : <Pause size={16} className="text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      Qtd: {order.targetQuantity}
                      {order.actualQuantity ? ` → ${order.actualQuantity}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {elapsed > 0 && (
                    <span className="text-sm font-mono tabular-nums text-muted-foreground">
                      {formatTime(elapsed)}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
