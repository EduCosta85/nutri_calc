import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, Tag } from "lucide-react";
import { useSalesIntentions } from "../../hooks/useSalesIntentions";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Aberta", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
  CLOSED: { label: "Fechada", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" },
  PROCESSING: { label: "Processando", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  COMPLETED: { label: "Concluída", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
};

export function SalesIntentionListPage() {
  const { intentions, loading, add } = useSalesIntentions();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function handleCreate() {
    if (!name.trim()) return;
    await add({ name: name.trim(), description: description || undefined, openedAt: new Date().toISOString() });
    setShowForm(false);
    setName("");
    setDescription("");
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Intenções de Venda</h1>
        <button onClick={() => setShowForm(true)} className="btn btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> Nova Intenção
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input w-full" placeholder="Nome (ex: Encomendas Páscoa)" />
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="input w-full" placeholder="Descrição (opcional)" />
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!name.trim()} className="btn btn-primary text-sm">Criar</button>
            <button onClick={() => setShowForm(false)} className="btn btn-secondary text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {intentions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Tag size={48} className="mx-auto mb-3 opacity-50" />
          <p>Nenhuma intenção de venda</p>
        </div>
      ) : (
        <div className="space-y-2">
          {intentions.map((intention) => (
            <Link
              key={intention.id}
              to={`/vendas/intencoes/${intention.id}`}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div>
                <p className="font-medium">{intention.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <Calendar size={12} />
                  <span>Aberta em {new Date(intention.openedAt).toLocaleDateString("pt-BR")}</span>
                  {intention.description && <span>· {intention.description}</span>}
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_LABELS[intention.status]?.color ?? ""}`}>
                {STATUS_LABELS[intention.status]?.label ?? intention.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
