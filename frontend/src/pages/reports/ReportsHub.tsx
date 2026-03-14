import { Link } from "react-router-dom";
import { BarChart3, Star, DollarSign, UserX, ShoppingBag } from "lucide-react";

const REPORTS = [
  { to: "/relatorios/vendas-periodo", label: "Vendas por Período", description: "Análise diária, semanal e mensal", icon: BarChart3 },
  { to: "/relatorios/top-produtos", label: "Top Produtos", description: "Produtos mais vendidos", icon: Star },
  { to: "/relatorios/financeiro", label: "Relatório Financeiro", description: "Receita, custo, lucro e margem", icon: DollarSign },
  { to: "/relatorios/clientes-inativos", label: "Clientes Inativos", description: "Sem compras no período", icon: UserX },
  { to: "/relatorios/balanco-compras", label: "Balanço de Compras", description: "Análise de compras", icon: ShoppingBag },
];

export function ReportsHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Análises e métricas do negócio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORTS.map(({ to, label, description, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-start gap-4 p-5 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon size={24} className="text-primary" />
            </div>
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
