import { NavLink, Outlet } from "react-router-dom";
import { Wheat, BookOpen, Settings, Moon, Sun } from "lucide-react";
import { useDarkMode } from "../hooks/useDarkMode";

const NAV_ITEMS = [
  { to: "/materias-primas", label: "Matérias Primas", icon: Wheat },
  { to: "/receitas", label: "Receitas", icon: BookOpen },
  { to: "/configuracoes", label: "Config", icon: Settings },
] as const;

export function Layout() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm no-print">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <NavLink to="/" className="text-xl font-bold text-primary tracking-tight">
            NutriCalc
          </NavLink>
          <div className="flex items-center gap-1">
            <nav className="flex gap-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{label}</span>
                </NavLink>
              ))}
            </nav>
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ml-1"
              title={isDark ? "Modo claro" : "Modo escuro"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
