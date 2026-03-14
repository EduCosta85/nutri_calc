import type { TimestampFields } from "./common";

/** App settings — singleton document for global configuration */
export interface AppSettings extends TimestampFields {
  id?: string;
  companyLogoUri?: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  mercadopagoEnabled: boolean;
  mercadopagoAccessToken?: string;
  establishmentDocument?: string;
}

/** Default app settings */
export const DEFAULT_APP_SETTINGS: Omit<AppSettings, "id" | "createdAt" | "updatedAt"> = {
  primaryColor: "#3b82f6",
  secondaryColor: "#10b981",
  accentColor: "#f59e0b",
  mercadopagoEnabled: false,
};

export type AppSettingsInput = Omit<AppSettings, "id" | "createdAt" | "updatedAt">;
