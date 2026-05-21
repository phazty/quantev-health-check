import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Charger, TelemetrySnapshot, ChargerStatus } from "@/types/charger";
import { chargers as seedChargers, generateInitialTelemetry } from "@/data/chargers";
import { sites as seedSites } from "@/data/sites";
import type { Site } from "@/types/charger";

interface ChargerState {
  chargers: Record<string, Charger>;
  telemetry: Record<string, TelemetrySnapshot>;
  sites: Record<string, Site>;

  updateTelemetry: (chargerId: string, patch: Partial<TelemetrySnapshot>) => void;
  markStale: (chargerId: string) => void;
  setChargerStatus: (chargerId: string, status: ChargerStatus) => void;
  refreshTimestamp: (chargerId: string) => void;
}

export const useChargerStore = create<ChargerState>()(
  immer((set) => ({
    chargers: Object.fromEntries(seedChargers.map((c) => [c.id, c])),
    telemetry: Object.fromEntries(
      seedChargers.map((c) => [c.id, generateInitialTelemetry(c)])
    ),
    sites: Object.fromEntries(seedSites.map((s) => [s.id, s])),

    updateTelemetry: (chargerId, patch) =>
      set((state) => {
        const t = state.telemetry[chargerId];
        if (t) Object.assign(t, patch);
      }),

    markStale: (chargerId) =>
      set((state) => {
        const t = state.telemetry[chargerId];
        if (t) t.isStale = true;
      }),

    setChargerStatus: (chargerId, status) =>
      set((state) => {
        const c = state.chargers[chargerId];
        if (c) c.status = status;
      }),

    refreshTimestamp: (chargerId) =>
      set((state) => {
        const t = state.telemetry[chargerId];
        if (t) {
          t.timestamp = new Date();
          t.isStale = false;
        }
        const c = state.chargers[chargerId];
        if (c) c.lastSeen = new Date();
      }),
  }))
);
