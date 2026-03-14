/** Mercado Pago PIX integration — adapted for web */

const MERCADOPAGO_API_BASE = "https://api.mercadopago.com";

export interface PixOrderRequest {
  type: "online";
  external_reference: string;
  transactions: {
    payments: Array<{
      amount: string;
      payment_method: { id: "pix"; type: "bank_transfer" };
    }>;
  };
  payer: { email: string; entity_type: "individual" };
  total_amount: string;
  description: string;
}

export interface PixOrderResponse {
  id: string;
  status: "action_required" | "processed" | "cancelled";
  status_detail: string;
  external_reference: string;
  total_amount: string;
  created_date: string;
  transactions: {
    payments: Array<{
      id: string;
      status: "action_required" | "processed" | "cancelled";
      payment_method: {
        id: string;
        type: string;
        qr_code_base64?: string;
        qr_code?: string;
      };
    }>;
  };
}

/** Validate if the Access Token works */
export async function validateAccessToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${MERCADOPAGO_API_BASE}/v1/payment_methods`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** Create PIX payment via Mercado Pago Orders API */
export async function createPixPayment(
  orderNumber: string,
  orderId: string,
  customerName: string,
  totalAmount: number,
  accessToken: string,
): Promise<PixOrderResponse> {
  const orderData: PixOrderRequest = {
    type: "online",
    external_reference: orderNumber,
    transactions: {
      payments: [{ amount: totalAmount.toFixed(2), payment_method: { id: "pix", type: "bank_transfer" } }],
    },
    payer: { email: `customer+${orderId}@nutrical.app`, entity_type: "individual" },
    total_amount: totalAmount.toFixed(2),
    description: `Pedido ${orderNumber} - ${customerName}`,
  };

  const response = await fetch(`${MERCADOPAGO_API_BASE}/v1/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": `order-${orderId}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Erro ao criar pagamento: ${errorData.message || response.statusText}`);
  }

  return response.json();
}

/** Check payment status */
export async function checkPaymentStatus(mpOrderId: string, accessToken: string): Promise<PixOrderResponse> {
  const response = await fetch(`${MERCADOPAGO_API_BASE}/v1/orders/${mpOrderId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Erro ao consultar pagamento: ${errorData.message || response.statusText}`);
  }

  return response.json();
}

/** Format payment status for display */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    action_required: "Aguardando Pagamento",
    processed: "Pago",
    cancelled: "Cancelado",
  };
  return labels[status] || status;
}

/** Get status color for display */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    action_required: "text-yellow-600",
    processed: "text-green-600",
    cancelled: "text-gray-500",
  };
  return colors[status] || "text-gray-500";
}

/** Copy PIX code to clipboard (Web API) */
export async function copyPixCode(pixCode: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(pixCode);
    return true;
  } catch {
    return false;
  }
}

/** Share PIX code via Web Share API (if available) */
export async function sharePixCode(pixCode: string, description: string): Promise<boolean> {
  if (!navigator.share) return false;
  try {
    await navigator.share({ title: "Pagamento PIX", text: `${description}\n\nCódigo PIX:\n${pixCode}` });
    return true;
  } catch {
    return false;
  }
}
