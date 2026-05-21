import { simulateApiCall } from "@/utils/delays";
import { useChargerStore } from "@/stores/chargerStore";
import { useAuditStore } from "@/stores/auditStore";
import type { Charger, TelemetrySnapshot } from "@/types/charger";

export const chargerService = {
  async getChargers(): Promise<Charger[]> {
    return simulateApiCall(() => Object.values(useChargerStore.getState().chargers), 400);
  },

  async getCharger(id: string): Promise<Charger | undefined> {
    return simulateApiCall(() => useChargerStore.getState().chargers[id], 200);
  },

  async getTelemetry(id: string): Promise<TelemetrySnapshot | undefined> {
    return simulateApiCall(() => useChargerStore.getState().telemetry[id], 150);
  },

  async forceRefreshTelemetry(id: string): Promise<void> {
    await simulateApiCall(() => {
      useChargerStore.getState().refreshTimestamp(id);
    }, 800);
    const charger = useChargerStore.getState().chargers[id];
    useAuditStore.getState().appendEvent({
      id: `svc-${Date.now()}`,
      type: "command_sent",
      severity: "info",
      message: `Manual telemetry refresh for ${charger?.manufacturer} ${charger?.model}`,
      details: null,
      chargerId: id,
      chargerName: charger ? `${charger.manufacturer} ${charger.model}` : id,
      userId: "usr-002",
      userName: "Marcus Chen",
      timestamp: new Date(),
      metadata: { action: "force_refresh" },
    });
  },
};
