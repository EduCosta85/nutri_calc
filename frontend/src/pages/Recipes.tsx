import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2, Copy, GitCompare } from "lucide-react";
import { useRecipes } from "../hooks/useRecipes";

export function RecipesPage() {
  const { recipes, remove, add } = useRecipes();
  const navigate = useNavigate();
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string | number>>(new Set());

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

  function toggleCompareSelection(id: string | number) {
    setSelectedForCompare((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 2) return prev; // Máximo 2 selecionadas
        next.add(id);
      }
      return next;
    });
  }

  function handleCompare() {
    const ids = Array.from(selectedForCompare);
    if (ids.length === 2) {
      navigate(`/receitas/comparar/${ids[0]}/${ids[1]}`);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Receitas</h1>
        <div className="flex items-center gap-2">
          {selectedForCompare.size === 2 && (
            <button onClick={handleCompare} className="btn btn-secondary">
              <GitCompare size={16} />
              Comparar ({selectedForCompare.size})
            </button>
          )}
          <Link to="/receitas/nova" className="btn btn-primary">
            <Plus size={16} />
            Nova
          </Link>
        </div>
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
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <input
                  type="checkbox"
                  checked={selectedForCompare.has(r.id!)}
                  onChange={() => toggleCompareSelection(r.id!)}
                  className="w-4 h-4 rounded border-border"
                  title="Selecionar para comparar"
                />
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
