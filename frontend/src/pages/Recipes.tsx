import { Link, useNavigate } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2, Copy } from "lucide-react";
import { useRecipes } from "../hooks/useRecipes";

export function RecipesPage() {
  const { recipes, remove, add } = useRecipes();
  const navigate = useNavigate();

  async function handleDelete(id: string | number, name: string) {
    if (window.confirm(`Excluir "${name}"?`)) {
      await remove(String(id));
    }
  }

  async function handleDuplicate(id: string | number) {
    const original = recipes.find((r) => String(r.id) === String(id));
    if (!original) return;
    const { id: _id, ...rest } = original;
    const newId = await add({ ...rest, name: `${rest.name} (copia)` });
    navigate(`/receitas/${newId}/editar`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Receitas</h1>
        <Link to="/receitas/nova" className="btn btn-primary">
          <Plus size={16} />
          Nova
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-muted-foreground mb-4">Nenhuma receita cadastrada.</p>
          <Link to="/receitas/nova" className="btn btn-primary">
            <Plus size={16} />
            Criar primeira
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recipes.map((r) => (
            <div key={r.id} className="card !p-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold truncate">{r.name}</h2>
                  {(r.tags ?? []).map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{t}</span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {r.ingredients.length} ingrediente{r.ingredients.length !== 1 && "s"} · Rende {r.yieldGrams}g
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  to={`/receitas/${r.id}`}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  title="Ver detalhes"
                >
                  <Eye size={18} />
                </Link>
                <Link
                  to={`/receitas/${r.id}/editar`}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  title="Editar"
                >
                  <Pencil size={18} />
                </Link>
                <button
                  onClick={() => handleDuplicate(r.id!)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  title="Duplicar"
                >
                  <Copy size={18} />
                </button>
                <button
                  onClick={() => handleDelete(r.id!, r.name)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-destructive"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
