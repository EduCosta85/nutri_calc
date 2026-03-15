import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Wheat, BookOpen, Settings, Moon, Sun, Menu, X,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar — always visible on desktop, toggleable on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-56 bg-card border-r border-border z-30 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
          <NavLink
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="text-lg font-bold text-primary tracking-tight"
          >
            NutriCalc
          </NavLink>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border shrink-0">
          <button
            onClick={toggle}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDark ? "Modo claro" : "Modo escuro"}</span>
          </button>
        </div>
      </aside>

      {/* Main content — full width */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar — mobile only (hamburger) */}
        <header className="sticky top-0 z-10 bg-card border-b border-border shadow-sm lg:hidden no-print">
          <div className="flex items-center h-14 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-secondary"
            >
              <Menu size={20} />
            </button>
            <NavLink to="/" className="ml-3 text-lg font-bold text-primary tracking-tight">
              NutriCalc
            </NavLink>
          </div>
        </header>

        {/* Page content — full width, proper scrolling */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
