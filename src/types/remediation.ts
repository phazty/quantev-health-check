import type { Severity } from "./charger";

export type RemediationStatus =
  | "idle"
  | "queued"
  | "scanning"
  | "in-flight"
  | "success"
  | "partial-success"
  | "failed"
  | "needs-human"
  | "locked"
  | "retry-exhausted";

export type QueueItemStatus =
  | "scanning"
  | "in-flight"
  | "success"
  | "failed"
  | "needs-human"
  | "locked";

export type CommandType =
  | "SET_CONFIG"
  | "RESET_CHARGER"
  | "UNLOCK_CONNECTOR"
  | "TRIGGER_MESSAGE"
  | "CHANGE_AVAILABILITY"
  | "UPDATE_FIRMWARE"
  | "GET_CONFIGURATION"
  | "SET_LOAD_SHARING"
  | "CLEAR_CACHE";

export type CommandStatus = "pending" | "executing" | "acknowledged" | "failed" | "timeout";

export interface CommandExecution {
  id: string;
  type: CommandType;
  chargerId: string;
  payload: Record<string, unknown>;
  status: CommandStatus;
  sentAt: Date;
  acknowledgedAt: Date | null;
  error: string | null;
  retryCount: number;
}

export interface QueueItem {
  id: string;
  chargerId: string;
  chargerName: string;
  siteId: string;
  siteName: string;
  faultType: string;
  severity: Severity;
  enqueuedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  retryCount: number;
  maxRetries: number;
  assignedOperator: string | null;
  notes: string;
  status: QueueItemStatus;
  ticksInState: number;
  commands: CommandExecution[];
}

export interface RemediationRecord {
  chargerId: string;
  status: RemediationStatus;
  attempt: number;
  maxAttempts: number;
  lastAttemptAt: Date | null;
  nextRetryAt: Date | null;
  successRate: number;
}
