export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type ChargerStatus = "online" | "offline" | "faulted" | "suspended" | "unavailable";

export type ConnectorType = "CCS1" | "CCS2" | "CHAdeMO" | "J1772" | "Tesla";

export type ConnectorStatus =
  | "Available"
  | "Occupied"
  | "Reserved"
  | "Faulted"
  | "Unavailable"
  | "SuspendedEV"
  | "SuspendedEVSE"
  | "Finishing";

export type OcppVersion = "1.6" | "2.0.1";

export interface Connector {
  id: number;
  type: ConnectorType;
  status: ConnectorStatus;
  currentPower: number;
  totalEnergy: number;
  voltage: number;
  current: number;
  temperature: number;
}

export interface ConfigParameter {
  key: string;
  currentValue: string;
  expectedValue: string;
  drift: boolean;
  severity: Severity;
}

export interface TelemetryError {
  code: string;
  description: string;
  severity: Severity;
  timestamp: Date;
}

export interface Charger {
  id: string;
  serialNumber: string;
  siteId: string;
  manufacturer: string;
  model: string;
  firmwareVersion: string;
  ocppVersion: OcppVersion;
  status: ChargerStatus;
  connectors: Connector[];
  lastSeen: Date;
  installDate: Date;
  ipAddress: string;
  tags: string[];
  loadSharingEnabled: boolean;
  loadSharingFault: boolean;
}

export interface TelemetrySnapshot {
  chargerId: string;
  timestamp: Date;
  voltage: number;
  current: number;
  power: number;
  temperature: number;
  errors: TelemetryError[];
  configDrift: ConfigParameter[];
  isStale: boolean;
  signalStrength: number;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  timezone: string;
  chargerCount: number;
  onlineCount: number;
  operator: string;
  coordinates: { lat: number; lng: number };
}
