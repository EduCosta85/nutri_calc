/** Common types shared across all modules */

export type ItemType = "raw_material" | "product" | "packaging";

export interface UnitOfMeasure {
  abbreviation: string;
  name: string;
}

/** Default units of measure */
export const UNITS: readonly UnitOfMeasure[] = [
  { abbreviation: "g", name: "Grama" },
  { abbreviation: "kg", name: "Quilograma" },
  { abbreviation: "ml", name: "Mililitro" },
  { abbreviation: "L", name: "Litro" },
  { abbreviation: "un", name: "Unidade" },
] as const;

/** Production order status workflow: NEW -> SEPARATING -> PRODUCING -> FINISHING -> COMPLETED (or CANCELLED) */
export type ProductionOrderStatus =
  | "NEW"
  | "SEPARATING"
  | "PRODUCING"
  | "FINISHING"
  | "COMPLETED"
  | "CANCELLED";

export type ProductionOrderPhase = "NEW" | "SEPARATING" | "PRODUCING" | "FINISHING";

/** Quick sale status */
export type SaleStatus = "PENDING" | "COMPLETED" | "CANCELLED";

/** Sales intention status workflow: OPEN -> CLOSED -> PROCESSING -> COMPLETED */
export type SalesIntentionStatus = "OPEN" | "CLOSED" | "PROCESSING" | "COMPLETED";

/** Customer order status workflow */
export type CustomerOrderStatus =
  | "INTENTION"
  | "SEPARATING"
  | "READY_DELIVERY"
  | "AWAITING_PAYMENT"
  | "COMPLETED"
  | "CANCELLED";

/** Stock disposition when cancelling */
export type StockDisposition = "RETURN" | "LOSS" | "NOT_SEPARATED";

/** Delivery type for customer orders */
export type DeliveryType = "DELIVERY" | "PICKUP_POINT" | "PICKUP_LOCAL";

/** Firestore timestamp fields shared across entities */
export interface TimestampFields {
  createdAt: string;
  updatedAt: string;
}
