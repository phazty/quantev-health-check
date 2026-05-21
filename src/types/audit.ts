import type { Severity } from "./charger";

export type AuditEventType =
  | "remediation_started"
  | "remediation_completed"
  | "remediation_failed"
  | "remediation_partial"
  | "command_sent"
  | "command_acknowledged"
  | "command_timeout"
  | "config_changed"
  | "alert_acknowledged"
  | "user_login"
  | "user_logout"
  | "role_changed"
  | "charger_offline"
  | "charger_online"
  | "ws_disconnect"
  | "ws_reconnect"
  | "stale_telemetry"
  | "fault_detected"
  | "ticket_created"
  | "operator_assigned"
  | "retry_exhausted"
  | "lock_conflict";

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  severity: Severity;
  message: string;
  details: string | null;
  chargerId: string | null;
  chargerName: string | null;
  userId: string | null;
  userName: string | null;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

export interface CommandLog {
  id: string;
  chargerId: string;
  chargerName: string;
  command: string;
  payload: string;
  status: "success" | "failed" | "timeout";
  durationMs: number;
  timestamp: Date;
  operator: string | null;
}
