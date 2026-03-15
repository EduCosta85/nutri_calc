import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Plus, Lock, Unlock, CheckCircle, Trash2,
  ShoppingCart, Users, DollarSign, Package,
} from "lucide-react";
import { useSalesIntentions } from "../../hooks/useSalesIntentions";
import { useCustomerOrders } from "../../hooks/useCustomerOrders";
import { useSalesSkus } from "../../hooks/useSalesSkus";
import { useCustomers } from "../../hooks/useCustomers";
import type { SalesIntention } from "../../types/orders";
import type { SalesIntentionStatus } from "../../types/common";

const STATUS_LABELS: Record<SalesIntentionStatus, { label: string; color: string }> = {
  OPEN: { label: "Aberta", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
  CLOSED: { label: "Fechada", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" },
  PROCESSING: { label: "Processando", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  COMPLETED: { label: "Concluída", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
};

export function SalesIntentionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, updateStatus, remove } = useSalesIntentions();
  const { orders, loading: ordersLoading, add: addOrder } = useCustomerOrders(id);
  const { skus: _skus } = useSalesSkus();
  const { customers } = useCustomers();

  const [intention, setIntention] = useState<SalesIntention | null>(null);
  const [loading, setLoading] = useState(true);

  // New order form
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderCustomerName, setOrderCustomerName] = useState("");
  const [orderCustomerPhone, setOrderCustomerPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    if (id) {
      getById(id).then((data) => {
        setIntention(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id, getById]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const uniqueCustomers = new Set(orders.map((o) => o.customerName)).size;

  async function handleStatusChange(newStatus: SalesIntentionStatus) {
    if (!id) return;
    await updateStatus(id, newStatus);
    const updated = await getById(id);
    setIntention(updated);
  }

  async function handleDelete() {
    if (!id || !confirm("Tem certeza que deseja excluir esta intenção e todos os pedidos?")) return;
    await remove(id);
    navigate("/vendas/intencoes");
  }

  async function handleCreateOrder() {
    if (!id || !orderCustomerName.trim()) return;
    setSavingOrder(true);
    try {
      await addOrder({
        salesIntentionId: id,
        customerName: orderCustomerName.trim(),
        customerPhone: orderCustomerPhone || undefined,
        totalAmount: 0,
        deliveryFee: 0,
        paidInAdvance: false,
        notes: orderNotes || undefined,
      });
      setShowOrderForm(false);
      setOrderCustomerName("");
      setOrderCustomerPhone("");
      setOrderNotes("");
    } finally {
      setSavingOrder(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" /></div>;
  }

  if (!intention) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate("/vendas/intencoes")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Voltar
        </button>
        <p className="text-center py-12 text-muted-foreground">Intenção não encontrada</p>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[intention.status];
  const isOpen = intention.status === "OPEN";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/vendas/intencoes")} className="p-2 rounded-lg hover:bg-secondary">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{intention.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              {intention.description && (
                <span className="text-sm text-muted-foreground">{intention.description}</span>
              )}
            </div>
          </div>
        </div>
        <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg">
          <Trash2 size={18} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <ShoppingCart size={20} className="mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold tabular-nums">{orders.length}</p>
          <p className="text-xs text-muted-foreground">Pedidos</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Users size={20} className="mx-auto text-blue-500 mb-1" />
          <p className="text-2xl font-bold tabular-nums">{uniqueCustomers}</p>
          <p className="text-xs text-muted-foreground">Clientes</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <DollarSign size={20} className="mx-auto text-green-600 mb-1" />
          <p className="text-2xl font-bold tabular-nums text-green-600">R$ {totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Receita Total</p>
        </div>
      </div>

      {/* Status actions */}
      <div className="flex flex-wrap gap-2">
        {isOpen && (
          <>
            <button onClick={() => setShowOrderForm(true)} className="btn btn-primary text-sm flex items-center gap-2">
              <Plus size={16} /> Novo Pedido
            </button>
            <button onClick={() => handleStatusChange("CLOSED")} className="btn btn-secondary text-sm flex items-center gap-2">
              <Lock size={16} /> Fechar Intenção
            </button>
          </>
        )}
        {intention.status === "CLOSED" && (
          <>
            <button onClick={() => handleStatusChange("OPEN")} className="btn btn-secondary text-sm flex items-center gap-2">
              <Unlock size={16} /> Reabrir
            </button>
            <button onClick={() => handleStatusChange("PROCESSING")} className="btn btn-primary text-sm flex items-center gap-2">
              <Package size={16} /> Processar Pedidos
            </button>
          </>
        )}
        {intention.status === "PROCESSING" && (
          <button onClick={() => handleStatusChange("COMPLETED")} className="btn btn-primary text-sm flex items-center gap-2">
            <CheckCircle size={16} /> Concluir
          </button>
        )}
      </div>

      {/* New order form */}
      {showOrderForm && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h3 className="font-medium">Novo Pedido</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Nome do cliente *</label>
              <input
                type="text"
                value={orderCustomerName}
                onChange={(e) => setOrderCustomerName(e.target.value)}
                className="input w-full text-sm"
                placeholder="Nome"
                list="customer-suggestions"
              />
              <datalist id="customer-suggestions">
                {customers.map((c) => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Telefone</label>
              <input type="tel" value={orderCustomerPhone} onChange={(e) => setOrderCustomerPhone(e.target.value)} className="input w-full text-sm" placeholder="(00) 00000-0000" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-0.5">Observações</label>
            <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} className="input w-full text-sm" rows={2} placeholder="Itens, quantidades..." />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreateOrder} disabled={savingOrder || !orderCustomerName.trim()} className="btn btn-primary text-sm">
              {savingOrder ? "Criando..." : "Criar Pedido"}
            </button>
            <button onClick={() => setShowOrderForm(false)} className="btn btn-secondary text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {/* Orders list */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Pedidos ({orders.length})
        </h2>
        {ordersLoading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-card border border-border rounded-lg">
            <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum pedido nesta intenção</p>
            {isOpen && <p className="text-xs mt-1">Clique em "Novo Pedido" para adicionar</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{order.orderNumber}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      order.status === "COMPLETED" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" :
                      order.status === "CANCELLED" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" :
                      "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.customerName}</p>
                  {order.notes && <p className="text-xs text-muted-foreground mt-0.5">{order.notes}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold tabular-nums">R$ {order.totalAmount.toFixed(2)}</p>
                  {order.deliveryFee > 0 && (
                    <p className="text-xs text-muted-foreground">+ R$ {order.deliveryFee.toFixed(2)} entrega</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
