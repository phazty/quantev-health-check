import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { QueueItem, QueueItemStatus } from "@/types/remediation";

function minsAgo(n: number): Date {
  return new Date(Date.now() - n * 60 * 1000);
}

const initialScanning: QueueItem[] = [
  {
    id: "qi-001", chargerId: "chg-003", chargerName: "ABB Terra 184 #03",
    siteId: "site-atx", siteName: "Downtown Austin Hub",
    faultType: "Load Sharing Misconfiguration", severity: "critical",
    enqueuedAt: minsAgo(4), startedAt: minsAgo(3), completedAt: null,
    retryCount: 0, maxRetries: 3, assignedOperator: null,
    notes: "LoadSharingEnabled=false detected. MaxCircuitAmps under-configured.",
    status: "scanning", ticksInState: 2, commands: [],
  },
  {
    id: "qi-002", chargerId: "chg-007", chargerName: "EVBOX BusinessLine #07",
    siteId: "site-atx", siteName: "Downtown Austin Hub",
    faultType: "Load Sharing Misconfiguration", severity: "critical",
    enqueuedAt: minsAgo(9), startedAt: minsAgo(8), completedAt: null,
    retryCount: 0, maxRetries: 3, assignedOperator: null,
    notes: "Cluster load sharing conflict with chg-003.",
    status: "scanning", ticksInState: 1, commands: [],
  },
  {
    id: "qi-003", chargerId: "chg-012", chargerName: "ChargePoint CPF50 #12",
    siteId: "site-sfo", siteName: "Silicon Valley Campus",
    faultType: "Config Drift — Heartbeat Interval", severity: "medium",
    enqueuedAt: minsAgo(14), startedAt: minsAgo(13), completedAt: null,
    retryCount: 0, maxRetries: 3, assignedOperator: null,
    notes: "HeartbeatInterval=120 (target: 30). MeterValueSampleInterval=300 (target: 60).",
    status: "scanning", ticksInState: 3, commands: [],
  },
  {
    id: "qi-004", chargerId: "chg-018", chargerName: "Delta AC MAX #18",
    siteId: "site-ord", siteName: "Chicago O'Hare Express",
    faultType: "Phase Rotation Mismatch", severity: "high",
    enqueuedAt: minsAgo(7), startedAt: minsAgo(6), completedAt: null,
    retryCount: 0, maxRetries: 3, assignedOperator: null,
    notes: "PhaseRotation=RST (target: RTS). ConnectionTimeOut under-configured.",
    status: "scanning", ticksInState: 2, commands: [],
  },
];

const initialInFlight: QueueItem[] = [
  {
    id: "qi-005", chargerId: "chg-022", chargerName: "ABB Terra 54 #22",
    siteId: "site-mia", siteName: "Miami Beach Station",
    faultType: "Config Drift — Heartbeat Interval", severity: "medium",
    enqueuedAt: minsAgo(18), startedAt: minsAgo(10), completedAt: null,
    retryCount: 1, maxRetries: 3, assignedOperator: null,
    notes: "Retry 1/3. Previous attempt timed out at HeartbeatInterval write.",
    status: "in-flight", ticksInState: 4, commands: [],
  },
  {
    id: "qi-006", chargerId: "chg-028", chargerName: "ChargePoint CPF50 #28",
    siteId: "site-den", siteName: "Denver Mountain Gateway",
    faultType: "Config Drift — Meter Values", severity: "medium",
    enqueuedAt: minsAgo(15), startedAt: minsAgo(8), completedAt: null,
    retryCount: 0, maxRetries: 3, assignedOperator: null,
    notes: "MeterValueSampleInterval=300 (target: 60). Running SET_CONFIG.",
    status: "in-flight", ticksInState: 3, commands: [],
  },
];

const initialIntervention: QueueItem[] = [
  {
    id: "qi-007", chargerId: "chg-009", chargerName: "ABB Terra 54 #09",
    siteId: "site-sfo", siteName: "Silicon Valley Campus",
    faultType: "Load Sharing Misconfiguration", severity: "critical",
    enqueuedAt: minsAgo(50), startedAt: minsAgo(42), completedAt: null,
    retryCount: 3, maxRetries: 3, assignedOperator: "usr-003",
    notes: "3/3 retries exhausted. All SET_LOAD_SHARING commands timed out. Possible hardware fault.",
    status: "needs-human", ticksInState: 8, commands: [],
  },
  {
    id: "qi-008", chargerId: "chg-015", chargerName: "ABB Terra 184 #15",
    siteId: "site-ord", siteName: "Chicago O'Hare Express",
    faultType: "Load Sharing Misconfiguration", severity: "critical",
    enqueuedAt: minsAgo(80), startedAt: minsAgo(72), completedAt: null,
    retryCount: 3, maxRetries: 3, assignedOperator: null,
    notes: "3/3 retries failed. Jira ticket QNT-2847 created. Awaiting field technician.",
    status: "needs-human", ticksInState: 12, commands: [],
  },
];

export type QueueVelocity = "slow" | "normal" | "fast";

interface AutomationState {
  scanningLane: QueueItem[];
  activeLane: QueueItem[];
  interventionLane: QueueItem[];
  isPaused: boolean;
  velocity: QueueVelocity;

  enqueue: (item: QueueItem) => void;
  promoteToFlight: (itemId: string) => void;
  promoteToIntervention: (itemId: string) => void;
  completeItem: (itemId: string, success: boolean) => void;
  updateItemStatus: (itemId: string, status: QueueItemStatus) => void;
  tickItems: () => void;
  pauseQueue: () => void;
  resumeQueue: () => void;
  setVelocity: (v: QueueVelocity) => void;
  assignOperator: (itemId: string, operatorId: string) => void;
  retryItem: (itemId: string) => void;
  incrementRetry: (itemId: string) => void;
}

export const useAutomationStore = create<AutomationState>()(
  immer((set, get) => ({
    scanningLane: initialScanning,
    activeLane: initialInFlight,
    interventionLane: initialIntervention,
    isPaused: false,
    velocity: "normal",

    enqueue: (item) =>
      set((s) => {
        s.scanningLane.push(item);
      }),

    promoteToFlight: (itemId) =>
      set((s) => {
        const idx = s.scanningLane.findIndex((i) => i.id === itemId);
        if (idx === -1) return;
        const [item] = s.scanningLane.splice(idx, 1);
        item.status = "in-flight";
        item.startedAt = new Date();
        item.ticksInState = 0;
        s.activeLane.push(item);
      }),

    promoteToIntervention: (itemId) =>
      set((s) => {
        const inActive = s.activeLane.findIndex((i) => i.id === itemId);
        if (inActive !== -1) {
          const [item] = s.activeLane.splice(inActive, 1);
          item.status = "needs-human";
          item.ticksInState = 0;
          s.interventionLane.push(item);
          return;
        }
        const inScanning = s.scanningLane.findIndex((i) => i.id === itemId);
        if (inScanning !== -1) {
          const [item] = s.scanningLane.splice(inScanning, 1);
          item.status = "needs-human";
          item.ticksInState = 0;
          s.interventionLane.push(item);
        }
      }),

    completeItem: (itemId, success) =>
      set((s) => {
        const idx = s.activeLane.findIndex((i) => i.id === itemId);
        if (idx === -1) return;
        const item = s.activeLane[idx];
        item.status = success ? "success" : "failed";
        item.completedAt = new Date();
        if (!success) {
          s.activeLane.splice(idx, 1);
          item.status = "needs-human";
          item.ticksInState = 0;
          s.interventionLane.push(item);
        } else {
          s.activeLane.splice(idx, 1);
        }
      }),

    updateItemStatus: (itemId, status) =>
      set((s) => {
        const all = [...s.scanningLane, ...s.activeLane, ...s.interventionLane];
        const item = all.find((i) => i.id === itemId);
        if (item) item.status = status;
      }),

    tickItems: () =>
      set((s) => {
        if (s.isPaused) return;
        s.scanningLane.forEach((i) => { i.ticksInState += 1; });
        s.activeLane.forEach((i) => { i.ticksInState += 1; });
        s.interventionLane.forEach((i) => { i.ticksInState += 1; });
      }),

    pauseQueue: () => set((s) => { s.isPaused = true; }),
    resumeQueue: () => set((s) => { s.isPaused = false; }),
    setVelocity: (v) => set((s) => { s.velocity = v; }),

    assignOperator: (itemId, operatorId) =>
      set((s) => {
        const item = s.interventionLane.find((i) => i.id === itemId);
        if (item) item.assignedOperator = operatorId;
      }),

    retryItem: (itemId) =>
      set((s) => {
        const idx = s.interventionLane.findIndex((i) => i.id === itemId);
        if (idx === -1) return;
        const [item] = s.interventionLane.splice(idx, 1);
        item.status = "scanning";
        item.retryCount += 1;
        item.startedAt = new Date();
        item.ticksInState = 0;
        s.scanningLane.unshift(item);
      }),

    incrementRetry: (itemId) =>
      set((s) => {
        const item = [...s.scanningLane, ...s.activeLane].find((i) => i.id === itemId);
        if (item) item.retryCount += 1;
      }),
  }))
);
