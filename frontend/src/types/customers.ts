import type { TimestampFields } from "./common";

/** Customer — registry for order tracking */
export interface Customer extends TimestampFields {
  id?: string;
  name: string;
  phone?: string;
  address?: string;
  instagram?: string;
  notes?: string;
}

/** Customer delivery address with fee */
export interface CustomerAddress extends TimestampFields {
  id?: string;
  customerId: string;
  address: string;
  deliveryFee: number;
  isDefault: boolean;
}

/** Pickup point — location for customer order pickup */
export interface PickupPoint extends TimestampFields {
  id?: string;
  name: string;
  address: string;
  active: boolean;
}

/** Input types */
export type CustomerInput = Omit<Customer, "id" | "createdAt" | "updatedAt">;
export type CustomerAddressInput = Omit<CustomerAddress, "id" | "createdAt" | "updatedAt">;
export type PickupPointInput = Omit<PickupPoint, "id" | "createdAt" | "updatedAt">;
