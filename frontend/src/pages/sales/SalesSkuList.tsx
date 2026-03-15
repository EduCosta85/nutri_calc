import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ShoppingBag, Tag, Eye, EyeOff, Trash2 } from "lucide-react";
import { useSalesSkus } from "../../hooks/useSalesSkus";

export function SalesSkuListPage() {
  const { skus, loading, update, remove } = useSalesSkus();
  const [showInactive, setShowInactive] = useState(false);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" /></div>;
  }

  const filtered = showInactive ? skus : skus.filter((s) => s.active);

  async function toggleActive(id: string, currentActive: boolean) {
    await update(id, { active: !currentActive });
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir SKU "${name}"?`)) return;
    await remove(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catálogo de Vendas</h1>
        <Link to="/vendas/sku/novo" className="btn btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> Novo SKU
        </Link>
      </div>

      <div className="flex gap-4">
        <Link to="/vendas/rapida" className="btn btn-secondary flex items-center gap-2">
          <ShoppingBag size={16} /> Nova Venda Rápida
        </Link>
        <Link to="/vendas/intencoes" className="btn btn-secondary flex items-center gap-2">
          <Tag size={16} /> Intenções de Venda
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowInactive(false)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium ${!showInactive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
        >
          Ativos ({skus.filter((s) => s.active).length})
        </button>
        <button
          onClick={() => setShowInactive(true)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium ${showInactive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
        >
          Todos ({skus.length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingBag size={48} className="mx-auto mb-3 opacity-50" />
          <p>Nenhum SKU {showInactive ? "cadastrado" : "ativo"}</p>
          <p className="text-xs mt-1">Crie SKUs para poder realizar vendas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((sku) => (
            <div key={sku.id} className={`bg-card border rounded-lg p-4 ${!sku.active ? "opacity-60 border-dashed border-border" : "border-border"}`}>
              <div className="flex items-start gap-3">
                <Link to={`/vendas/sku/${sku.id}`} className="shrink-0">
                  {sku.photoUri ? (
                    <img src={sku.photoUri} alt={sku.name} className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                      <ShoppingBag size={24} className="text-muted-foreground" />
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/vendas/sku/${sku.id}`}>
                    <p className="font-medium truncate hover:text-primary">{sku.name}</p>
                  </Link>
                  {sku.description && <p className="text-xs text-muted-foreground truncate">{sku.description}</p>}
                  <p className="text-lg font-bold text-primary mt-1">R$ {sku.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => sku.id && toggleActive(sku.id, sku.active)}
                    className="p-1.5 rounded hover:bg-secondary"
                    title={sku.active ? "Desativar" : "Ativar"}
                  >
                    {sku.active ? <Eye size={14} className="text-green-600" /> : <EyeOff size={14} className="text-muted-foreground" />}
                  </button>
                  <button
                    onClick={() => sku.id && handleDelete(sku.id, sku.name)}
                    className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
