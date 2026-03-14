import { NavLink, Outlet } from "react-router-dom";
import {
  Wheat, BookOpen, Settings, Moon, Sun,
  Package, Factory, ShoppingCart, Users, BarChart3, Home,
} from "lucide-react";
import { useDarkMode } from "../hooks/useDarkMode";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/estoque", label: "Estoque", icon: Package },
  { to: "/producao", label: "Produção", icon: Factory },
  { to: "/vendas", label: "Vendas", icon: ShoppingCart },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/materias-primas", label: "Matérias Primas", icon: Wheat },
  { to: "/receitas", label: "Receitas", icon: BookOpen },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/configuracoes", label: "Config", icon: Settings },
] as const;

export function Layout() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <NavLink to="/" className="text-xl font-bold text-primary tracking-tight shrink-0">
            NutriCalc
          </NavLink>
          <div className="flex items-center gap-1 overflow-x-auto">
            <nav className="flex gap-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`
                  }
                >
                  <Icon size={16} />
                  <span className="hidden lg:inline">{label}</span>
                </NavLink>
              ))}
            </nav>
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ml-1 shrink-0"
              title={isDark ? "Modo claro" : "Modo escuro"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
