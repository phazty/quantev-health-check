import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { AuditEvent, CommandLog } from "@/types/audit";
import type { Severity } from "@/types/charger";
import { seedAuditEvents, seedCommandLogs } from "@/data/auditLogs";

const MAX_EVENTS = 1000;
const MAX_LOGS = 500;

interface AuditState {
  events: AuditEvent[];
  commandLogs: CommandLog[];
  severityFilter: Severity | "all";
  chargerFilter: string | null;

  appendEvent: (event: AuditEvent) => void;
  appendCommandLog: (log: CommandLog) => void;
  setSeverityFilter: (filter: Severity | "all") => void;
  setChargerFilter: (chargerId: string | null) => void;

  filteredEvents: () => AuditEvent[];
}

export const useAuditStore = create<AuditState>()(
  immer((set, get) => ({
    events: [...seedAuditEvents],
    commandLogs: [...seedCommandLogs],
    severityFilter: "all",
    chargerFilter: null,

    appendEvent: (event) =>
      set((s) => {
        s.events.unshift(event);
        if (s.events.length > MAX_EVENTS) {
          s.events = s.events.slice(0, MAX_EVENTS);
        }
      }),

    appendCommandLog: (log) =>
      set((s) => {
        s.commandLogs.unshift(log);
        if (s.commandLogs.length > MAX_LOGS) {
          s.commandLogs = s.commandLogs.slice(0, MAX_LOGS);
        }
      }),

    setSeverityFilter: (filter) => set((s) => { s.severityFilter = filter; }),
    setChargerFilter: (id) => set((s) => { s.chargerFilter = id; }),

    filteredEvents: () => {
      const { events, severityFilter, chargerFilter } = get();
      return events.filter((e) => {
        if (severityFilter !== "all" && e.severity !== severityFilter) return false;
        if (chargerFilter && e.chargerId !== chargerFilter) return false;
        return true;
      });
    },
  }))
);
