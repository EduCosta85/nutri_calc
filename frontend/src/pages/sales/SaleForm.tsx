import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle } from "lucide-react";
import { useSalesSkus } from "../../hooks/useSalesSkus";
import { useQuickSales } from "../../hooks/useQuickSales";
import { useCustomers } from "../../hooks/useCustomers";
import { calcCartTotal } from "../../services/sales-sku";

interface CartItem {
  skuId: string;
  name: string;
  price: number;
  quantity: number;
}

export function SaleFormPage() {
  const navigate = useNavigate();
  const { skus } = useSalesSkus();
  const { add: addSale } = useQuickSales();
  const { customers, add: addCustomer } = useCustomers();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [processing, setProcessing] = useState(false);

  const activeSkus = skus.filter((s) => s.active);
  const filteredSkus = productSearch
    ? activeSkus.filter((s) => s.name.toLowerCase().includes(productSearch.toLowerCase()))
    : activeSkus;

  const filteredCustomers = customerSearch.length >= 2
    ? customers.filter((c) => c.name.toLowerCase().includes(customerSearch.toLowerCase())).slice(0, 5)
    : [];

  function addToCart(sku: typeof skus[0]) {
    setCart((prev) => {
      const existing = prev.find((item) => item.skuId === sku.id);
      if (existing) {
        return prev.map((item) => item.skuId === sku.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { skuId: sku.id!, name: sku.name, price: sku.price, quantity: 1 }];
    });
  }

  function updateQuantity(skuId: string, delta: number) {
    setCart((prev) => prev
      .map((item) => item.skuId === skuId ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0));
  }

  function removeFromCart(skuId: string) {
    setCart((prev) => prev.filter((item) => item.skuId !== skuId));
  }

  const cartTotal = calcCartTotal(cart);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  async function handleCheckout() {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      // Auto-create customer if name provided and not found
      if (customerName.trim()) {
        const exists = customers.find(
          (c) => c.name.toLowerCase() === customerName.trim().toLowerCase(),
        );
        if (!exists) {
          await addCustomer({ name: customerName.trim() });
        }
      }

      await addSale({
        customerName: customerName || undefined,
        totalAmount: cartTotal,
        paid: false,
        delivered: false,
      });
      navigate("/vendas/rapida");
    } catch (error) {
      alert("Erro ao criar venda");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/vendas/rapida")} className="p-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Nova Venda</h1>
      </div>

      {/* Customer */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-sm">Cliente</h3>
        <div className="relative">
          <input
            type="text"
            value={customerName}
            onChange={(e) => { setCustomerName(e.target.value); setCustomerSearch(e.target.value); }}
            className="input w-full"
            placeholder="Nome do cliente (opcional)"
          />
          {filteredCustomers.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-lg mt-1 shadow-lg z-10">
              {filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setCustomerName(c.name); setCustomerSearch(""); }}
                  className="w-full text-left px-3 py-2 hover:bg-secondary text-sm"
                >
                  {c.name} {c.phone && <span className="text-muted-foreground">· {c.phone}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          className="input pl-9 w-full"
          placeholder="Buscar produto..."
        />
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredSkus.map((sku) => (
          <button
            key={sku.id}
            onClick={() => addToCart(sku)}
            className="bg-card border border-border rounded-lg p-3 text-left hover:shadow-sm transition-shadow"
          >
            {sku.photoUri ? (
              <img src={sku.photoUri} alt={sku.name} className="w-full h-20 rounded-md object-cover mb-2" />
            ) : (
              <div className="w-full h-20 rounded-md bg-secondary flex items-center justify-center mb-2">
                <ShoppingCart size={24} className="text-muted-foreground" />
              </div>
            )}
            <p className="font-medium text-sm truncate">{sku.name}</p>
            <p className="text-primary font-bold">R$ {sku.price.toFixed(2)}</p>
          </button>
        ))}
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-secondary/50 border-b border-border">
            <h3 className="font-medium text-sm">Carrinho ({itemCount} itens)</h3>
          </div>
          <div className="divide-y divide-border">
            {cart.map((item) => (
              <div key={item.skuId} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">R$ {item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-secondary rounded-md">
                    <button onClick={() => updateQuantity(item.skuId, -1)} className="p-1.5 hover:bg-secondary/80"><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.skuId, 1)} className="p-1.5 hover:bg-secondary/80"><Plus size={14} /></button>
                  </div>
                  <span className="font-bold text-sm w-20 text-right tabular-nums text-green-600">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button onClick={() => removeFromCart(item.skuId)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-bold text-green-600 tabular-nums">R$ {cartTotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Checkout */}
      <button
        onClick={handleCheckout}
        disabled={processing || cart.length === 0}
        className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 text-lg disabled:opacity-50"
      >
        <CheckCircle size={20} />
        {processing ? "Processando..." : "Criar Pedido"}
      </button>
    </div>
  );
}
