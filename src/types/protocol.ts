export type VendorScheme =
  | "ABB"
  | "ChargePoint"
  | "EVBOX"
  | "Blink"
  | "Wallbox"
  | "Delta"
  | "Tritium"
  | "BTC"
  | "Generic";

export type DataType = "integer" | "string" | "boolean" | "decimal" | "CSL";

export interface MappingEntry {
  id: string;
  quantevKey: string;
  ocppReference: string;
  vendorMappings: Partial<Record<VendorScheme, string>>;
  dataType: DataType;
  unit: string | null;
  defaultValue: string;
  description: string;
  isRequired: boolean;
  isDirty: boolean;
  lastModifiedAt: Date | null;
  lastModifiedBy: string | null;
  category: string;
}
