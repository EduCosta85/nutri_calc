import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Users, Phone, Instagram } from "lucide-react";
import { useCustomers } from "../../hooks/useCustomers";

export function CustomerListPage() {
  const { customers, loading } = useCustomers();
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-muted-foreground">{customers.length} cadastrados</p>
        </div>
        <Link to="/clientes/novo" className="btn btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> Novo cliente
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9 w-full"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users size={48} className="mx-auto mb-3 opacity-50" />
          <p>Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((customer) => (
            <Link
              key={customer.id}
              to={`/clientes/${customer.id}`}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div>
                <p className="font-medium">{customer.name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  {customer.phone && <span className="flex items-center gap-1"><Phone size={12} /> {customer.phone}</span>}
                  {customer.instagram && <span className="flex items-center gap-1"><Instagram size={12} /> @{customer.instagram}</span>}
                </div>
              </div>
              {customer.notes && (
                <p className="text-xs text-muted-foreground max-w-48 truncate">{customer.notes}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
