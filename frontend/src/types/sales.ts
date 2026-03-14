import type { SaleStatus, TimestampFields } from "./common";

/** Sales SKU — a sellable item with price */
export interface SalesSku extends TimestampFields {
  id?: string;
  name: string;
  description?: string;
  price: number;
  active: boolean;
  photoUri?: string | null;
}

/** SKU composition — which inventory items make up this SKU */
export interface SalesSkuComponent {
  id?: string;
  salesSkuId: string;
  inventoryItemId: string;
  quantity: number;
  createdAt: string;
}

/** Quick sale — direct sales without intention */
export interface QuickSale extends TimestampFields {
  id?: string;
  saleNumber: string;
  customerName?: string;
  totalAmount: number;
  status: SaleStatus;
  paid: boolean;
  paidAt?: string | null;
  delivered: boolean;
  deliveredAt?: string | null;
  completedAt?: string | null;
}

/** Item in a quick sale */
export interface QuickSaleItem {
  id?: string;
  saleId: string;
  salesSkuId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
}

/** Stock movement linked to a sale item */
export interface SaleStockMovement {
  id?: string;
  saleItemId: string;
  stockLotId: string;
  quantity: number;
  createdAt: string;
}

/** SKU availability info — calculated from component stock levels */
export interface SalesSkuAvailability {
  skuId: string;
  available: boolean;
  maxQuantity: number;
  componentAvailability: Array<{
    itemId: string;
    itemName: string;
    requiredPerSku: number;
    availableStock: number;
    maxSkuQuantity: number;
  }>;
}

/** Cart item for quick sales */
export interface CartItem {
  skuId: string;
  skuName: string;
  price: number;
  quantity: number;
  components: Array<{
    inventoryItemId: string;
    quantity: number;
  }>;
}

/** Input types */
export type SalesSkuInput = Omit<SalesSku, "id" | "createdAt" | "updatedAt">;
export type SalesSkuComponentInput = Omit<SalesSkuComponent, "id" | "createdAt">;
export type QuickSaleInput = Omit<
  QuickSale,
  "id" | "saleNumber" | "status" | "createdAt" | "updatedAt" | "completedAt"
>;
export type QuickSaleItemInput = Omit<QuickSaleItem, "id" | "createdAt">;
export type SaleStockMovementInput = Omit<SaleStockMovement, "id" | "createdAt">;
