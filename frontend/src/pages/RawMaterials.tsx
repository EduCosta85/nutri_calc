import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useRawMaterials } from "../hooks/useRawMaterials";

export function RawMaterialsPage() {
  const { materials, remove } = useRawMaterials();

  async function handleDelete(id: number, name: string) {
    if (window.confirm(`Excluir "${name}"?`)) {
      await remove(id);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Materias Primas</h1>
        <Link to="/materias-primas/novo" className="btn btn-primary">
          <Plus size={16} />
          Nova
        </Link>
      </div>

      {materials.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-muted-foreground mb-4">Nenhuma materia prima cadastrada.</p>
          <Link to="/materias-primas/novo" className="btn btn-primary">
            <Plus size={16} />
            Cadastrar primeira
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map((m) => (
            <div
              key={m.id}
              className="card !p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold truncate">{m.name}</h2>
                  {(m.tags ?? []).map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{t}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-sm text-muted-foreground">
                  <span>{m.caloriesPer100g} kcal</span>
                  <span>{m.proteinPer100g}g prot</span>
                  <span>{m.carbsPer100g}g carb</span>
                  <span>{m.totalFatPer100g}g gord</span>
                  <span>{m.sodiumPer100g}mg sodio</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  to={`/materias-primas/${m.id}`}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  title="Editar"
                >
                  <Pencil size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(m.id!, m.name)}
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
