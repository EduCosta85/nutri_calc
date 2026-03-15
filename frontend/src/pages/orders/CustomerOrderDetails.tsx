import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Package, Truck, DollarSign, CheckCircle, XCircle,
  CreditCard, Copy, Share2, Loader2,
} from "lucide-react";
import { useCustomerOrders } from "../../hooks/useCustomerOrders";
import { useStockLots } from "../../hooks/useStockLots";
import { useAppSettings } from "../../hooks/useAppSettings";
import { createPixPayment, checkPaymentStatus, copyPixCode, sharePixCode, getStatusLabel as getPixStatusLabel } from "../../services/mercadopago";
import type { CustomerOrder } from "../../types/orders";
import type { StockLot } from "../../types/inventory";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  INTENTION: { label: "Pendente", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" },
  SEPARATING: { label: "Separando", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  READY_DELIVERY: { label: "Pronto Entrega", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
  AWAITING_PAYMENT: { label: "Ag. Pagamento", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
  COMPLETED: { label: "Concluído", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
  CANCELLED: { label: "Cancelado", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
};

export function CustomerOrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getById, update, updateStatus } = useCustomerOrders();
  const { lots } = useStockLots();
  const { settings } = useAppSettings();

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [generatingPix, setGeneratingPix] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [copied, setCopied] = useState(false);

  const lotsByItem = new Map<string, StockLot[]>();
  for (const lot of lots) {
    const arr = lotsByItem.get(lot.itemId) ?? [];
    arr.push(lot);
    lotsByItem.set(lot.itemId, arr);
  }

  useEffect(() => {
    if (orderId) {
      getById(orderId).then((o) => { setOrder(o); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [orderId, getById]);

  async function reload() {
    if (orderId) {
      const o = await getById(orderId);
      setOrder(o);
    }
  }

  // Separate order — advance to READY_DELIVERY
  async function handleSeparate() {
    if (!orderId || !order) return;
    setProcessing(true);
    try {
      await updateStatus(orderId, "READY_DELIVERY");
      await reload();
    } finally {
      setProcessing(false);
    }
  }

  // Mark as delivered — advance to AWAITING_PAYMENT
  async function handleDeliver() {
    if (!orderId) return;
    setProcessing(true);
    try {
      await updateStatus(orderId, "AWAITING_PAYMENT");
      await reload();
    } finally {
      setProcessing(false);
    }
  }

  // Mark as paid — advance to COMPLETED
  async function handleMarkPaid() {
    if (!orderId) return;
    setProcessing(true);
    try {
      await update(orderId, { status: "COMPLETED", paymentDate: new Date().toISOString() });
      await reload();
    } finally {
      setProcessing(false);
    }
  }

  // Cancel order
  async function handleCancel() {
    if (!orderId || !confirm("Cancelar este pedido?")) return;
    setProcessing(true);
    try {
      await updateStatus(orderId, "CANCELLED");
      await reload();
    } finally {
      setProcessing(false);
    }
  }

  // Generate PIX payment
  async function handleGeneratePix() {
    if (!orderId || !order) return;
    if (!settings.mercadopagoEnabled || !settings.mercadopagoAccessToken) {
      alert("Mercado Pago não configurado. Vá em Configurações → Pagamentos.");
      return;
    }
    setGeneratingPix(true);
    try {
      const result = await createPixPayment(
        order.orderNumber,
        orderId,
        order.customerName,
        order.totalAmount + order.deliveryFee,
        settings.mercadopagoAccessToken,
      );
      const payment = result.transactions.payments[0];
      await update(orderId, {
        mercadopagoPaymentId: result.id,
        pixQrCodeBase64: payment?.payment_method?.qr_code_base64,
        pixQrCode: payment?.payment_method?.qr_code,
        paymentMethod: "pix",
      });
      await reload();
    } catch (e) {
      alert("Erro ao gerar PIX. Verifique configurações.");
      console.error(e);
    } finally {
      setGeneratingPix(false);
    }
  }

  // Check PIX payment status
  async function handleCheckPayment() {
    if (!order?.mercadopagoPaymentId || !settings.mercadopagoAccessToken) return;
    setCheckingPayment(true);
    try {
      const result = await checkPaymentStatus(order.mercadopagoPaymentId, settings.mercadopagoAccessToken);
      const paid = result.transactions.payments.some((p) => p.status === "processed");
      if (paid) {
        await handleMarkPaid();
        alert("Pagamento confirmado!");
      } else {
        alert(`Status: ${getPixStatusLabel(result.status)}`);
      }
    } catch (e) {
      alert("Erro ao verificar pagamento.");
      console.error(e);
    } finally {
      setCheckingPayment(false);
    }
  }

  async function handleCopyPix() {
    if (!order?.pixQrCode) return;
    const ok = await copyPixCode(order.pixQrCode);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  async function handleSharePix() {
    if (!order?.pixQrCode) return;
    await sharePixCode(order.pixQrCode, `Pedido ${order.orderNumber} - ${order.customerName}`);
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" /></div>;
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16} /> Voltar</button>
        <p className="text-center py-12 text-muted-foreground">Pedido não encontrado</p>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS.INTENTION;
  const isActive = !["COMPLETED", "CANCELLED"].includes(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
            <span className="text-sm text-muted-foreground">{order.customerName}</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Subtotal</p>
          <p className="text-xl font-bold tabular-nums">R$ {order.totalAmount.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Taxa Entrega</p>
          <p className="text-xl font-bold tabular-nums">R$ {order.deliveryFee.toFixed(2)}</p>
        </div>
      </div>

      {order.notes && (
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Observações</p>
          <p className="text-sm">{order.notes}</p>
        </div>
      )}

      {/* PIX Section */}
      {order.pixQrCode && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h3 className="font-medium flex items-center gap-2"><CreditCard size={16} className="text-primary" /> Pagamento PIX</h3>
          {order.pixQrCodeBase64 && (
            <div className="flex justify-center">
              <img src={`data:image/png;base64,${order.pixQrCodeBase64}`} alt="QR Code PIX" className="w-48 h-48" />
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={handleCopyPix} className="btn btn-secondary text-xs flex-1 flex items-center justify-center gap-1">
              <Copy size={14} /> {copied ? "Copiado!" : "Copiar Código"}
            </button>
            <button onClick={handleSharePix} className="btn btn-secondary text-xs flex-1 flex items-center justify-center gap-1">
              <Share2 size={14} /> Compartilhar
            </button>
          </div>
          <button onClick={handleCheckPayment} disabled={checkingPayment} className="btn btn-primary text-xs w-full flex items-center justify-center gap-1">
            {checkingPayment ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
            {checkingPayment ? "Verificando..." : "Verificar Pagamento"}
          </button>
        </div>
      )}

      {/* Actions */}
      {isActive && (
        <div className="flex flex-wrap gap-2">
          {order.status === "INTENTION" && (
            <button onClick={handleSeparate} disabled={processing} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
              <Package size={16} /> {processing ? "Processando..." : "Separar Pedido"}
            </button>
          )}
          {order.status === "READY_DELIVERY" && (
            <button onClick={handleDeliver} disabled={processing} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
              <Truck size={16} /> {processing ? "Processando..." : "Marcar Entregue"}
            </button>
          )}
          {order.status === "AWAITING_PAYMENT" && (
            <>
              {settings.mercadopagoEnabled && !order.pixQrCode && (
                <button onClick={handleGeneratePix} disabled={generatingPix} className="btn btn-secondary flex-1 flex items-center justify-center gap-2">
                  <CreditCard size={16} /> {generatingPix ? "Gerando..." : "Gerar PIX"}
                </button>
              )}
              <button onClick={handleMarkPaid} disabled={processing} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                <CheckCircle size={16} /> {processing ? "Processando..." : "Marcar Pago"}
              </button>
            </>
          )}
          <button onClick={handleCancel} disabled={processing} className="btn btn-secondary flex items-center gap-2 text-red-600">
            <XCircle size={16} /> Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
