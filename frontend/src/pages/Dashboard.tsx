import { Link } from "react-router-dom";
import {
  Wheat, BookOpen, Plus, ArrowRight, GitCompareArrows,
  Package, Factory, Users,
  AlertTriangle, Clock,
} from "lucide-react";
import { useRecipes } from "../hooks/useRecipes";
import { useRawMaterials } from "../hooks/useRawMaterials";
import { useInventoryItems } from "../hooks/useInventoryItems";
import { useStockLots } from "../hooks/useStockLots";
import { useProductionOrders } from "../hooks/useProductionOrders";
import { useQuickSales } from "../hooks/useQuickSales";
import { useCustomers } from "../hooks/useCustomers";
import { detectLowStock, detectExpiringLots } from "../services/stock-alerts";

export function DashboardPage() {
  const { recipes } = useRecipes();
  const { materials } = useRawMaterials();
  const { items: inventoryItems } = useInventoryItems();
  const { lots } = useStockLots();
  const { orders: productionOrders } = useProductionOrders();
  const { sales } = useQuickSales();
  const { customers } = useCustomers();

  // Calculate stats
  const lotsByItem = new Map<string, typeof lots>();
  for (const lot of lots) {
    const existing = lotsByItem.get(lot.itemId) ?? [];
    existing.push(lot);
    lotsByItem.set(lot.itemId, existing);
  }

  const lowStockAlerts = detectLowStock(inventoryItems, lotsByItem);
  const expiryAlerts = detectExpiringLots(inventoryItems, lotsByItem);
  const activeOrders = productionOrders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status));
  const completedSales = sales.filter((s) => s.status === "COMPLETED");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const monthRevenue = completedSales
    .filter((s) => new Date(s.createdAt) >= startOfMonth)
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const weekRevenue = completedSales
    .filter((s) => new Date(s.createdAt) >= startOfWeek)
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const recentRecipes = [...recipes].slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Revenue cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card">
          <p className="text-xs text-muted-foreground">Receita Semanal</p>
          <p className="text-xl font-bold text-green-600 tabular-nums">R$ {weekRevenue.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-muted-foreground">Receita Mensal</p>
          <p className="text-xl font-bold text-green-600 tabular-nums">R$ {monthRevenue.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-muted-foreground">Vendas Concluídas</p>
          <p className="text-xl font-bold tabular-nums">{completedSales.length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-muted-foreground">Ticket Médio</p>
          <p className="text-xl font-bold tabular-nums">
            R$ {completedSales.length > 0 ? (monthRevenue / completedSales.filter((s) => new Date(s.createdAt) >= startOfMonth).length || 0).toFixed(2) : "0.00"}
          </p>
        </div>
      </div>

      {/* Module stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Link to="/materias-primas" className="card hover:border-primary transition-colors text-center">
          <Wheat size={20} className="mx-auto text-primary mb-1" />
          <p className="text-lg font-bold">{materials.length}</p>
          <p className="text-xs text-muted-foreground">Matérias Primas</p>
        </Link>
        <Link to="/receitas" className="card hover:border-primary transition-colors text-center">
          <BookOpen size={20} className="mx-auto text-accent mb-1" />
          <p className="text-lg font-bold">{recipes.length}</p>
          <p className="text-xs text-muted-foreground">Receitas</p>
        </Link>
        <Link to="/estoque" className="card hover:border-primary transition-colors text-center">
          <Package size={20} className="mx-auto text-blue-500 mb-1" />
          <p className="text-lg font-bold">{inventoryItems.length}</p>
          <p className="text-xs text-muted-foreground">Itens Estoque</p>
        </Link>
        <Link to="/producao" className="card hover:border-primary transition-colors text-center">
          <Factory size={20} className="mx-auto text-orange-500 mb-1" />
          <p className="text-lg font-bold">{activeOrders.length}</p>
          <p className="text-xs text-muted-foreground">OPs Ativas</p>
        </Link>
        <Link to="/clientes" className="card hover:border-primary transition-colors text-center">
          <Users size={20} className="mx-auto text-purple-500 mb-1" />
          <p className="text-lg font-bold">{customers.length}</p>
          <p className="text-xs text-muted-foreground">Clientes</p>
        </Link>
      </div>

      {/* Alerts */}
      {(lowStockAlerts.length > 0 || expiryAlerts.length > 0) && (
        <div className="card">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Alertas
          </h2>
          <div className="space-y-2">
            {lowStockAlerts.slice(0, 3).map((alert) => (
              <div key={alert.item.id} className="flex items-center gap-2 text-sm">
                <AlertTriangle size={14} className="text-yellow-600 shrink-0" />
                <span><strong>{alert.item.name}</strong>: {alert.currentStock.toFixed(0)} / {alert.threshold}</span>
              </div>
            ))}
            {expiryAlerts.slice(0, 3).map((alert) => (
              <div key={alert.lot.id} className="flex items-center gap-2 text-sm">
                <Clock size={14} className="text-red-600 shrink-0" />
                <span><strong>{alert.item.name}</strong>: vence em {alert.daysUntilExpiry}d</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Link to="/materias-primas/novo" className="btn btn-primary text-sm"><Plus size={16} /> Matéria prima</Link>
        <Link to="/receitas/nova" className="btn btn-secondary text-sm"><Plus size={16} /> Receita</Link>
        <Link to="/estoque/novo" className="btn btn-secondary text-sm"><Plus size={16} /> Item estoque</Link>
        <Link to="/producao/nova" className="btn btn-secondary text-sm"><Plus size={16} /> OP</Link>
        <Link to="/clientes/novo" className="btn btn-secondary text-sm"><Plus size={16} /> Cliente</Link>
        {recipes.length >= 2 && (
          <Link to="/comparar" className="btn btn-secondary text-sm"><GitCompareArrows size={16} /> Comparar</Link>
        )}
      </div>

      {/* Recent recipes */}
      {recentRecipes.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Receitas recentes</h2>
            <Link to="/receitas" className="text-xs text-primary hover:underline inline-flex items-center gap-1">Ver todas <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-2">
            {recentRecipes.map((r) => (
              <Link key={r.id} to={`/receitas/${r.id}`} className="flex items-center justify-between py-2 px-3 -mx-3 rounded-lg hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                  {r.photo ? (
                    <img src={r.photo} alt="" className="w-10 h-10 object-cover rounded-lg" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground"><BookOpen size={16} /></div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.ingredients.length} ingredientes · {r.yieldGrams}g</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {materials.length === 0 && recipes.length === 0 && inventoryItems.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-muted-foreground mb-2">Bem-vindo ao NutriCalc!</p>
          <p className="text-sm text-muted-foreground">
            Comece cadastrando suas matérias primas para calcular tabelas nutricionais,
            ou vá direto para o Estoque para gerenciar seu inventário completo.
          </p>
        </div>
      )}
    </div>
  );
}
