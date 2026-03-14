import type {
  SalesIntentionStatus,
  CustomerOrderStatus,
  DeliveryType,
  StockDisposition,
  TimestampFields,
} from "./common";

/** Sales intention — period for collecting customer orders */
export interface SalesIntention extends TimestampFields {
  id?: string;
  name: string;
  description?: string;
  status: SalesIntentionStatus;
  openedAt: string;
  closedAt?: string | null;
}

/** Customer order within a sales intention */
export interface CustomerOrder extends TimestampFields {
  id?: string;
  salesIntentionId: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  totalAmount: number;
  deliveryFee: number;
  deliveryType?: DeliveryType;
  customerAddressId?: string;
  pickupPointId?: string;
  status: CustomerOrderStatus;
  paidInAdvance: boolean;
  paymentDate?: string | null;
  deliveryDate?: string | null;
  notes?: string;
  /** Mercado Pago payment fields */
  mercadopagoPaymentId?: string;
  pixQrCodeBase64?: string;
  pixQrCode?: string;
  paymentMethod?: string;
}

/** Item in a customer order */
export interface CustomerOrderItem {
  id?: string;
  customerOrderId: string;
  salesSkuId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
}

/** Stock movement for customer order separation */
export interface CustomerOrderStockMovement {
  id?: string;
  customerOrderItemId: string;
  stockLotId: string;
  quantity: number;
  createdAt: string;
}

/** Cancellation record for a customer order */
export interface CustomerOrderCancellation {
  id?: string;
  customerOrderId: string;
  reason: string;
  stockDisposition: StockDisposition;
  cancelledAt: string;
  cancelledBy?: string;
  notes?: string;
  createdAt: string;
}

/** Aggregation of all orders in a sales intention */
export interface SalesIntentionAggregation {
  intentionId: string;
  totalOrders: number;
  totalRevenue: number;
  skuRequirements: Array<{
    skuId: string;
    skuName: string;
    totalQuantity: number;
    componentRequirements: Array<{
      itemId: string;
      itemName: string;
      requiredQuantity: number;
      availableStock: number;
      deficit: number;
    }>;
  }>;
}

/** Input types */
export type SalesIntentionInput = Omit<
  SalesIntention,
  "id" | "status" | "createdAt" | "updatedAt"
>;

export type CustomerOrderInput = Omit<
  CustomerOrder,
  "id" | "orderNumber" | "status" | "createdAt" | "updatedAt"
>;

export type CustomerOrderItemInput = Omit<CustomerOrderItem, "id" | "createdAt">;

export type CustomerOrderStockMovementInput = Omit<
  CustomerOrderStockMovement,
  "id" | "createdAt"
>;

export type CustomerOrderCancellationInput = Omit<
  CustomerOrderCancellation,
  "id" | "cancelledAt" | "createdAt"
>;
