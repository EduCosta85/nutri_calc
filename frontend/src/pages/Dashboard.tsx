import { Link } from "react-router-dom";
import { Wheat, BookOpen, Plus, ArrowRight, GitCompareArrows } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";

export function DashboardPage() {
  const materials = useLiveQuery(() => db.rawMaterials.toArray()) ?? [];
  const recipes = useLiveQuery(() => db.recipes.toArray()) ?? [];

  const recentRecipes = [...recipes]
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
    .slice(0, 5);

  const allTags = [
    ...new Set([
      ...materials.flatMap((m) => m.tags ?? []),
      ...recipes.flatMap((r) => r.tags ?? []),
    ]),
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/materias-primas" className="card hover:border-primary transition-colors group">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Wheat size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{materials.length}</p>
              <p className="text-sm text-muted-foreground">Materias primas</p>
            </div>
          </div>
        </Link>
        <Link to="/receitas" className="card hover:border-primary transition-colors group">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-accent/10 text-accent">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{recipes.length}</p>
              <p className="text-sm text-muted-foreground">Receitas</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Link to="/materias-primas/novo" className="btn btn-primary text-sm">
          <Plus size={16} />
          Nova materia prima
        </Link>
        <Link to="/receitas/nova" className="btn btn-secondary text-sm">
          <Plus size={16} />
          Nova receita
        </Link>
        {recipes.length >= 2 && (
          <Link to="/comparar" className="btn btn-secondary text-sm">
            <GitCompareArrows size={16} />
            Comparar
          </Link>
        )}
      </div>

      {/* Recent recipes */}
      {recentRecipes.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Receitas recentes
            </h2>
            <Link to="/receitas" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentRecipes.map((r) => (
              <Link
                key={r.id}
                to={`/receitas/${r.id}`}
                className="flex items-center justify-between py-2 px-3 -mx-3 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  {r.photo ? (
                    <img src={r.photo} alt="" className="w-10 h-10 object-cover rounded-lg" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                      <BookOpen size={16} />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.ingredients.length} ingredientes · {r.yieldGrams}g
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tags overview */}
      {allTags.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Tags em uso
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {materials.length === 0 && recipes.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-muted-foreground mb-2">Bem-vindo ao NutriCalc!</p>
          <p className="text-sm text-muted-foreground">
            Comece cadastrando suas materias primas para calcular tabelas nutricionais.
          </p>
        </div>
      )}
    </div>
  );
}
