export type WSConnectionStatus = "connected" | "reconnecting" | "disconnected";

export type WSEventType =
  | "telemetry_update"
  | "queue_update"
  | "heartbeat"
  | "stale_device"
  | "alert"
  | "reconnect"
  | "disconnect"
  | "command_ack"
  | "remediation_state_change";

export interface WSMessage {
  id: string;
  type: WSEventType;
  timestamp: Date;
  payload: Record<string, unknown>;
}
