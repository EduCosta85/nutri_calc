import type { ProductionOrderStatus, ProductionOrderPhase, TimestampFields } from "./common";

/** Production order — tracks manufacturing from recipe */
export interface ProductionOrder extends TimestampFields {
  id?: string;
  orderNumber: string;
  productId: string;
  targetQuantity: number;
  actualQuantity?: number;
  status: ProductionOrderStatus;
  timerStartedAt?: string | null;
  timerPausedAt?: string | null;
  totalPausedSeconds: number;
  completedAt?: string | null;
}

/** Planned ingredient for a production order */
export interface ProductionOrderIngredient extends TimestampFields {
  id?: string;
  productionOrderId: string;
  ingredientId: string;
  plannedQuantity: number;
  actualQuantity?: number;
  returnedQuantity: number;
  lossQuantity: number;
}

/** Tracks which stock lots were used for each ingredient */
export interface ProductionOrderLotUsage {
  id?: string;
  productionOrderIngredientId: string;
  stockLotId: string;
  quantity: number;
  createdAt: string;
}

/** Time tracking by production phase */
export interface ProductionOrderTimeTracking {
  id?: string;
  productionOrderId: string;
  phase: ProductionOrderPhase;
  startedAt: string;
  endedAt?: string | null;
  pausedSeconds: number;
  createdAt: string;
}

/** Output lot created from production */
export interface ProductionOrderOutput {
  id?: string;
  productionOrderId: string;
  stockLotId: string;
  quantity: number;
  createdAt: string;
}

/** Input types */
export type ProductionOrderInput = Omit<
  ProductionOrder,
  | "id"
  | "orderNumber"
  | "status"
  | "timerStartedAt"
  | "timerPausedAt"
  | "totalPausedSeconds"
  | "createdAt"
  | "updatedAt"
  | "completedAt"
  | "actualQuantity"
>;

export type ProductionOrderIngredientInput = Omit<
  ProductionOrderIngredient,
  "id" | "createdAt" | "updatedAt" | "actualQuantity" | "returnedQuantity" | "lossQuantity"
>;

export type ProductionOrderLotUsageInput = Omit<ProductionOrderLotUsage, "id" | "createdAt">;
export type ProductionOrderTimeTrackingInput = Omit<ProductionOrderTimeTracking, "id" | "createdAt">;
export type ProductionOrderOutputInput = Omit<ProductionOrderOutput, "id" | "createdAt">;
