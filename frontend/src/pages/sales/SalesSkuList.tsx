import { Link } from "react-router-dom";
import { Plus, ShoppingBag, Tag } from "lucide-react";
import { useSalesSkus } from "../../hooks/useSalesSkus";

export function SalesSkuListPage() {
  const { skus, loading } = useSalesSkus();

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" /></div>;
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

      {skus.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingBag size={48} className="mx-auto mb-3 opacity-50" />
          <p>Nenhum SKU cadastrado</p>
          <p className="text-xs mt-1">Crie SKUs para poder realizar vendas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skus.map((sku) => (
            <Link
              key={sku.id}
              to={`/vendas/sku/${sku.id}`}
              className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3">
                {sku.photoUri ? (
                  <img src={sku.photoUri} alt={sku.name} className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                    <ShoppingBag size={24} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{sku.name}</p>
                  {sku.description && <p className="text-xs text-muted-foreground truncate">{sku.description}</p>}
                  <p className="text-lg font-bold text-primary mt-1">R$ {sku.price.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${sku.active ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"}`}>
                    {sku.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
