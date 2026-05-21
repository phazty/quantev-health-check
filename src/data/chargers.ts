import type { Charger, TelemetrySnapshot, ConfigParameter, TelemetryError, OcppVersion, ChargerStatus } from "@/types/charger";

function minsAgo(n: number): Date {
  return new Date(Date.now() - n * 60 * 1000);
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function makeConnectors(count: number, powerKw: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    type: i === 0 ? ("CCS1" as const) : ("CHAdeMO" as const),
    status: (["Available", "Occupied", "Available"] as const)[i % 3],
    currentPower: Math.random() > 0.5 ? powerKw * (0.7 + Math.random() * 0.3) : 0,
    totalEnergy: 12 + Math.random() * 40,
    voltage: 400 + (Math.random() - 0.5) * 8,
    current: Math.random() > 0.5 ? 60 + Math.random() * 20 : 0,
    temperature: 38 + Math.random() * 18,
  }));
}

const loadSharingDrift: ConfigParameter[] = [
  {
    key: "LoadSharingEnabled",
    currentValue: "false",
    expectedValue: "true",
    drift: true,
    severity: "critical",
  },
  {
    key: "MaxCircuitAmps",
    currentValue: "32",
    expectedValue: "48",
    drift: true,
    severity: "high",
  },
];

const heartbeatDrift: ConfigParameter[] = [
  {
    key: "HeartbeatInterval",
    currentValue: "120",
    expectedValue: "30",
    drift: true,
    severity: "medium",
  },
  {
    key: "MeterValueSampleInterval",
    currentValue: "300",
    expectedValue: "60",
    drift: true,
    severity: "low",
  },
];

const authDrift: ConfigParameter[] = [
  {
    key: "AuthorizationCacheEnabled",
    currentValue: "false",
    expectedValue: "true",
    drift: true,
    severity: "medium",
  },
  {
    key: "LocalAuthorizeOffline",
    currentValue: "false",
    expectedValue: "true",
    drift: true,
    severity: "low",
  },
];

const phaseRotationDrift: ConfigParameter[] = [
  {
    key: "PhaseRotation",
    currentValue: "RST",
    expectedValue: "RTS",
    drift: true,
    severity: "high",
  },
  {
    key: "ConnectionTimeOut",
    currentValue: "20",
    expectedValue: "30",
    drift: true,
    severity: "low",
  },
];

const cleanConfig: ConfigParameter[] = [
  { key: "HeartbeatInterval", currentValue: "30", expectedValue: "30", drift: false, severity: "info" },
  { key: "MeterValueSampleInterval", currentValue: "60", expectedValue: "60", drift: false, severity: "info" },
  { key: "LoadSharingEnabled", currentValue: "true", expectedValue: "true", drift: false, severity: "info" },
  { key: "MaxCircuitAmps", currentValue: "48", expectedValue: "48", drift: false, severity: "info" },
];

interface ChargerDef {
  id: string;
  serial: string;
  siteId: string;
  manufacturer: string;
  model: string;
  firmware: string;
  ocpp: OcppVersion;
  status: ChargerStatus;
  lastSeenMins: number;
  loadSharingFault?: boolean;
  driftType?: "load-sharing" | "heartbeat" | "auth" | "phase" | "none";
  connectorCount?: number;
  powerKw?: number;
  installDaysAgo?: number;
  ipSuffix: number;
}

const defs: ChargerDef[] = [
  // Site ATX — Downtown Austin Hub
  { id: "chg-001", serial: "ABB-TX-00401", siteId: "site-atx", manufacturer: "ABB", model: "Terra 54", firmware: "3.8.2", ocpp: "1.6", status: "online", lastSeenMins: 1, driftType: "none", connectorCount: 2, powerKw: 54, installDaysAgo: 280, ipSuffix: 101 },
  { id: "chg-002", serial: "ABB-TX-00402", siteId: "site-atx", manufacturer: "ABB", model: "Terra 54", firmware: "3.8.2", ocpp: "1.6", status: "online", lastSeenMins: 2, driftType: "none", connectorCount: 2, powerKw: 54, installDaysAgo: 280, ipSuffix: 102 },
  { id: "chg-003", serial: "ABB-TX-00184", siteId: "site-atx", manufacturer: "ABB", model: "Terra 184", firmware: "4.1.0", ocpp: "1.6", status: "faulted", lastSeenMins: 3, loadSharingFault: true, driftType: "load-sharing", connectorCount: 2, powerKw: 184, installDaysAgo: 150, ipSuffix: 103 },
  { id: "chg-004", serial: "CPT-TX-25001", siteId: "site-atx", manufacturer: "ChargePoint", model: "CPF50", firmware: "6.2.1", ocpp: "1.6", status: "online", lastSeenMins: 1, driftType: "none", connectorCount: 2, powerKw: 50, installDaysAgo: 320, ipSuffix: 104 },
  { id: "chg-005", serial: "CPT-TX-25002", siteId: "site-atx", manufacturer: "ChargePoint", model: "CPF25", firmware: "6.2.1", ocpp: "1.6", status: "online", lastSeenMins: 2, driftType: "heartbeat", connectorCount: 2, powerKw: 25, installDaysAgo: 320, ipSuffix: 105 },
  { id: "chg-006", serial: "EVB-TX-30201", siteId: "site-atx", manufacturer: "EVBOX", model: "Elvi", firmware: "2.3.4", ocpp: "2.0.1", status: "online", lastSeenMins: 1, driftType: "none", connectorCount: 1, powerKw: 22, installDaysAgo: 90, ipSuffix: 106 },
  { id: "chg-007", serial: "EVB-TX-30202", siteId: "site-atx", manufacturer: "EVBOX", model: "BusinessLine", firmware: "2.3.4", ocpp: "2.0.1", status: "faulted", lastSeenMins: 4, loadSharingFault: true, driftType: "load-sharing", connectorCount: 2, powerKw: 44, installDaysAgo: 90, ipSuffix: 107 },
  { id: "chg-008", serial: "WBX-TX-50701", siteId: "site-atx", manufacturer: "Wallbox", model: "Pulsar Plus", firmware: "5.7.1", ocpp: "1.6", status: "online", lastSeenMins: 1, driftType: "none", connectorCount: 1, powerKw: 22, installDaysAgo: 120, ipSuffix: 108 },

  // Site SFO — Silicon Valley Campus
  { id: "chg-009", serial: "ABB-CA-00403", siteId: "site-sfo", manufacturer: "ABB", model: "Terra 54", firmware: "3.8.1", ocpp: "1.6", status: "faulted", lastSeenMins: 25, driftType: "load-sharing", loadSharingFault: true, connectorCount: 2, powerKw: 54, installDaysAgo: 400, ipSuffix: 109 },
  { id: "chg-010", serial: "BLK-CA-20001", siteId: "site-sfo", manufacturer: "Blink", model: "IQ 200", firmware: "5.1.3", ocpp: "1.6", status: "online", lastSeenMins: 2, driftType: "auth", connectorCount: 2, powerKw: 80, installDaysAgo: 200, ipSuffix: 110 },
  { id: "chg-011", serial: "DLT-CA-21001", siteId: "site-sfo", manufacturer: "Delta", model: "AC MAX", firmware: "2.1.0", ocpp: "2.0.1", status: "offline", lastSeenMins: 87, driftType: "none", connectorCount: 2, powerKw: 22, installDaysAgo: 60, ipSuffix: 111 },
  { id: "chg-012", serial: "CPT-CA-25003", siteId: "site-sfo", manufacturer: "ChargePoint", model: "CPF50", firmware: "6.0.1", ocpp: "1.6", status: "online", lastSeenMins: 2, driftType: "heartbeat", connectorCount: 2, powerKw: 50, installDaysAgo: 260, ipSuffix: 112 },
  { id: "chg-013", serial: "TRT-CA-75001", siteId: "site-sfo", manufacturer: "Tritium", model: "RTM75", firmware: "1.9.2", ocpp: "1.6", status: "online", lastSeenMins: 1, driftType: "none", connectorCount: 2, powerKw: 75, installDaysAgo: 180, ipSuffix: 113 },
  { id: "chg-014", serial: "EVB-CA-30203", siteId: "site-sfo", manufacturer: "EVBOX", model: "Elvi", firmware: "2.2.0", ocpp: "2.0.1", status: "online", lastSeenMins: 3, driftType: "none", connectorCount: 1, powerKw: 22, installDaysAgo: 45, ipSuffix: 114 },

  // Site ORD — Chicago O'Hare Express
  { id: "chg-015", serial: "ABB-IL-00185", siteId: "site-ord", manufacturer: "ABB", model: "Terra 184", firmware: "3.8.2", ocpp: "1.6", status: "faulted", lastSeenMins: 12, driftType: "load-sharing", loadSharingFault: true, connectorCount: 2, powerKw: 184, installDaysAgo: 300, ipSuffix: 115 },
  { id: "chg-016", serial: "CPT-IL-25004", siteId: "site-ord", manufacturer: "ChargePoint", model: "CPF50", firmware: "6.2.1", ocpp: "1.6", status: "online", lastSeenMins: 1, driftType: "none", connectorCount: 2, powerKw: 50, installDaysAgo: 350, ipSuffix: 116 },
  { id: "chg-017", serial: "BLK-IL-10001", siteId: "site-ord", manufacturer: "Blink", model: "IQ 100", firmware: "5.0.0", ocpp: "1.6", status: "suspended", lastSeenMins: 6, driftType: "auth", connectorCount: 1, powerKw: 40, installDaysAgo: 480, ipSuffix: 117 },
  { id: "chg-018", serial: "DLT-IL-21002", siteId: "site-ord", manufacturer: "Delta", model: "AC MAX", firmware: "2.1.0", ocpp: "2.0.1", status: "online", lastSeenMins: 2, driftType: "phase", connectorCount: 2, powerKw: 22, installDaysAgo: 55, ipSuffix: 118 },
  { id: "chg-019", serial: "WBX-IL-60001", siteId: "site-ord", manufacturer: "Wallbox", model: "Pulsar Plus", firmware: "6.0.0", ocpp: "1.6", status: "online", lastSeenMins: 1, driftType: "none", connectorCount: 1, powerKw: 22, installDaysAgo: 95, ipSuffix: 119 },
  { id: "chg-020", serial: "BTC-IL-60001", siteId: "site-ord", manufacturer: "BTC Power", model: "60kW DC", firmware: "3.2.1", ocpp: "1.6", status: "online", lastSeenMins: 22, driftType: "heartbeat", connectorCount: 2, powerKw: 60, installDaysAgo: 200, ipSuffix: 120 },
  { id: "chg-021", serial: "EVB-IL-30204", siteId: "site-ord", manufacturer: "EVBOX", model: "BusinessLine", firmware: "2.3.4", ocpp: "2.0.1", status: "online", lastSeenMins: 2, driftType: "none", connectorCount: 2, powerKw: 44, installDaysAgo: 75, ipSuffix: 121 },

  // Site MIA — Miami Beach Station
  { id: "chg-022", serial: "ABB-FL-00404", siteId: "site-mia", manufacturer: "ABB", model: "Terra 54", firmware: "4.1.0", ocpp: "1.6", status: "online", lastSeenMins: 2, driftType: "heartbeat", connectorCount: 2, powerKw: 54, installDaysAgo: 130, ipSuffix: 122 },
  { id: "chg-023", serial: "CPT-FL-25005", siteId: "site-mia", manufacturer: "ChargePoint", model: "CPF25", firmware: "6.2.1", ocpp: "1.6", status: "online", lastSeenMins: 1, driftType: "none", connectorCount: 2, powerKw: 25, installDaysAgo: 130, ipSuffix: 123 },
  { id: "chg-024", serial: "WBX-FL-50702", siteId: "site-mia", manufacturer: "Wallbox", model: "Pulsar Plus", firmware: "5.7.1", ocpp: "1.6", status: "online", lastSeenMins: 18, driftType: "auth", connectorCount: 1, powerKw: 22, installDaysAgo: 85, ipSuffix: 124 },
  { id: "chg-025", serial: "BLK-FL-20002", siteId: "site-mia", manufacturer: "Blink", model: "IQ 200", firmware: "5.1.3", ocpp: "1.6", status: "faulted", lastSeenMins: 5, driftType: "load-sharing", loadSharingFault: true, connectorCount: 2, powerKw: 80, installDaysAgo: 170, ipSuffix: 125 },
  { id: "chg-026", serial: "DLT-FL-21003", siteId: "site-mia", manufacturer: "Delta", model: "AC MAX", firmware: "2.0.0", ocpp: "2.0.1", status: "offline", lastSeenMins: 340, driftType: "none", connectorCount: 2, powerKw: 22, installDaysAgo: 35, ipSuffix: 126 },

  // Site DEN — Denver Mountain Gateway
  { id: "chg-027", serial: "ABB-CO-00186", siteId: "site-den", manufacturer: "ABB", model: "Terra 184", firmware: "4.1.0", ocpp: "1.6", status: "online", lastSeenMins: 1, driftType: "none", connectorCount: 2, powerKw: 184, installDaysAgo: 160, ipSuffix: 127 },
  { id: "chg-028", serial: "CPT-CO-25006", siteId: "site-den", manufacturer: "ChargePoint", model: "CPF50", firmware: "6.2.1", ocpp: "1.6", status: "online", lastSeenMins: 2, driftType: "heartbeat", connectorCount: 2, powerKw: 50, installDaysAgo: 160, ipSuffix: 128 },
  { id: "chg-029", serial: "EVB-CO-30205", siteId: "site-den", manufacturer: "EVBOX", model: "Elvi", firmware: "2.3.4", ocpp: "2.0.1", status: "online", lastSeenMins: 1, driftType: "phase", connectorCount: 1, powerKw: 22, installDaysAgo: 50, ipSuffix: 129 },
  { id: "chg-030", serial: "TRT-CO-75002", siteId: "site-den", manufacturer: "Tritium", model: "RTM75", firmware: "1.9.2", ocpp: "1.6", status: "online", lastSeenMins: 2, driftType: "none", connectorCount: 2, powerKw: 75, installDaysAgo: 190, ipSuffix: 130 },
  { id: "chg-031", serial: "WBX-CO-50703", siteId: "site-den", manufacturer: "Wallbox", model: "Pulsar Plus", firmware: "5.7.1", ocpp: "1.6", status: "online", lastSeenMins: 1, driftType: "none", connectorCount: 1, powerKw: 22, installDaysAgo: 110, ipSuffix: 131 },
  { id: "chg-032", serial: "BTC-CO-60002", siteId: "site-den", manufacturer: "BTC Power", model: "60kW DC", firmware: "3.2.1", ocpp: "1.6", status: "unavailable", lastSeenMins: 3, driftType: "none", connectorCount: 2, powerKw: 60, installDaysAgo: 210, ipSuffix: 132 },

  // Site SEA — Seattle Tech Park
  { id: "chg-033", serial: "ABB-WA-00405", siteId: "site-sea", manufacturer: "ABB", model: "Terra 54", firmware: "4.1.0", ocpp: "1.6", status: "online", lastSeenMins: 1, driftType: "none", connectorCount: 2, powerKw: 54, installDaysAgo: 140, ipSuffix: 133 },
  { id: "chg-034", serial: "CPT-WA-25007", siteId: "site-sea", manufacturer: "ChargePoint", model: "CPF50", firmware: "6.2.1", ocpp: "1.6", status: "online", lastSeenMins: 16, driftType: "auth", connectorCount: 2, powerKw: 50, installDaysAgo: 140, ipSuffix: 134 },
  { id: "chg-035", serial: "EVB-WA-30206", siteId: "site-sea", manufacturer: "EVBOX", model: "BusinessLine", firmware: "2.3.4", ocpp: "2.0.1", status: "online", lastSeenMins: 2, driftType: "none", connectorCount: 2, powerKw: 44, installDaysAgo: 70, ipSuffix: 135 },
];

function getDriftConfig(type: ChargerDef["driftType"]): ConfigParameter[] {
  switch (type) {
    case "load-sharing": return loadSharingDrift;
    case "heartbeat": return heartbeatDrift;
    case "auth": return authDrift;
    case "phase": return phaseRotationDrift;
    default: return cleanConfig;
  }
}

function buildCharger(d: ChargerDef): Charger {
  return {
    id: d.id,
    serialNumber: d.serial,
    siteId: d.siteId,
    manufacturer: d.manufacturer,
    model: d.model,
    firmwareVersion: d.firmware,
    ocppVersion: d.ocpp,
    status: d.status,
    connectors: makeConnectors(d.connectorCount ?? 2, d.powerKw ?? 50),
    lastSeen: minsAgo(d.lastSeenMins),
    installDate: daysAgo(d.installDaysAgo ?? 180),
    ipAddress: `10.48.${d.ipSuffix < 120 ? "1" : d.ipSuffix < 130 ? "2" : "3"}.${d.ipSuffix}`,
    tags: [
      d.manufacturer,
      d.ocpp === "2.0.1" ? "OCPP 2.0.1" : "OCPP 1.6",
      ...(d.loadSharingFault ? ["load-sharing-fault"] : []),
      ...(d.driftType && d.driftType !== "none" ? ["config-drift"] : []),
    ],
    loadSharingEnabled: !d.loadSharingFault,
    loadSharingFault: d.loadSharingFault ?? false,
  };
}

export function generateInitialTelemetry(charger: Charger): TelemetrySnapshot {
  const def = defs.find((d) => d.id === charger.id)!;
  const configDrift = getDriftConfig(def.driftType);
  const isStale = def.lastSeenMins > 15;

  const errors: TelemetryError[] = [];
  if (charger.loadSharingFault) {
    errors.push({
      code: "EVS-4201",
      description: "Load sharing configuration mismatch detected",
      severity: "critical",
      timestamp: minsAgo(def.lastSeenMins + 2),
    });
  }
  if (charger.status === "faulted") {
    errors.push({
      code: "EVS-3101",
      description: "Connector fault — EVSE suspended",
      severity: "high",
      timestamp: minsAgo(def.lastSeenMins),
    });
  }

  return {
    chargerId: charger.id,
    timestamp: minsAgo(def.lastSeenMins),
    voltage: 400 + (Math.random() - 0.5) * 8,
    current: charger.status === "online" ? 48 + (Math.random() - 0.5) * 10 : 0,
    power: charger.status === "online" ? (def.powerKw ?? 50) * (0.6 + Math.random() * 0.35) : 0,
    temperature: 38 + Math.random() * 18,
    errors,
    configDrift,
    isStale,
    signalStrength: isStale ? 30 + Math.random() * 20 : 75 + Math.random() * 25,
  };
}

export const chargers: Charger[] = defs.map(buildCharger);
