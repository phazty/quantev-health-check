import { simulateApiCall, sleep, jitter } from "@/utils/delays";
import { useAutomationStore } from "@/stores/automationStore";
import { useAuditStore } from "@/stores/auditStore";
import { useChargerStore } from "@/stores/chargerStore";
import { useUIStore } from "@/stores/uiStore";
import type { QueueItem } from "@/types/remediation";

let _cmdId = 200;
const cmdId = () => `cmd-${String(_cmdId++).padStart(4, "0")}`;

export const remediationService = {
  async enqueueCharger(chargerId: string, faultType: string): Promise<string> {
    const charger = useChargerStore.getState().chargers[chargerId];
    if (!charger) throw new Error(`Charger ${chargerId} not found`);

    const sites = useChargerStore.getState().sites;
    const site = sites[charger.siteId];

    const item: QueueItem = {
      id: `qi-${Date.now()}`,
      chargerId,
      chargerName: `${charger.manufacturer} ${charger.model}`,
      siteId: charger.siteId,
      siteName: site?.name ?? charger.siteId,
      faultType,
      severity: charger.loadSharingFault ? "critical" : "medium",
      enqueuedAt: new Date(),
      startedAt: null,
      completedAt: null,
      retryCount: 0,
      maxRetries: 3,
      assignedOperator: null,
      notes: `Auto-queued: ${faultType}`,
      status: "scanning",
      ticksInState: 0,
      commands: [],
    };

    await simulateApiCall(() => {
      useAutomationStore.getState().enqueue(item);
    }, 300);

    useAuditStore.getState().appendEvent({
      id: cmdId(),
      type: "remediation_started",
      severity: "info",
      message: `Remediation queued for ${item.chargerName}`,
      details: `Fault: ${faultType}`,
      chargerId,
      chargerName: item.chargerName,
      userId: "usr-002",
      userName: "Marcus Chen",
      timestamp: new Date(),
      metadata: { queueItemId: item.id },
    });

    return item.id;
  },

  async executeCommand(
    chargerId: string,
    commandType: string,
    payload: Record<string, unknown>
  ): Promise<{ success: boolean; latencyMs: number }> {
    const charger = useChargerStore.getState().chargers[chargerId];
    const id = cmdId();
    const start = Date.now();

    const latency = jitter(600, 0.5);
    await sleep(latency);

    const success = Math.random() > 0.15;
    const latencyMs = Date.now() - start;

    useAuditStore.getState().appendCommandLog({
      id,
      chargerId,
      chargerName: charger ? `${charger.manufacturer} ${charger.model}` : chargerId,
      command: commandType,
      payload: JSON.stringify(payload),
      status: success ? "success" : "failed",
      durationMs: latencyMs,
      timestamp: new Date(),
      operator: "Marcus Chen",
    });

    return { success, latencyMs };
  },

  async createTicket(
    itemId: string,
    system: "Jira" | "Salesforce"
  ): Promise<{ ticketId: string; url: string }> {
    await sleep(jitter(1200, 0.3));

    const autoStore = useAutomationStore.getState();
    const item = autoStore.interventionLane.find((i) => i.id === itemId);
    if (!item) throw new Error("Queue item not found");

    const prefix = system === "Jira" ? "QNT" : "CASE";
    const num = 2848 + Math.floor(Math.random() * 100);
    const ticketId = `${prefix}-${num}`;

    useAuditStore.getState().appendEvent({
      id: cmdId(),
      type: "ticket_created",
      severity: "info",
      message: `${system} ticket ${ticketId} created for ${item.chargerName}`,
      details: `Priority P1. Fault: ${item.faultType}`,
      chargerId: item.chargerId,
      chargerName: item.chargerName,
      userId: "usr-002",
      userName: "Marcus Chen",
      timestamp: new Date(),
      metadata: { ticketId, system },
    });

    useUIStore.getState().pushNotification({
      title: `${system} Ticket Created`,
      message: `${ticketId} — ${item.chargerName}`,
      severity: "info",
    });

    return { ticketId, url: `https://quantev.atlassian.net/browse/${ticketId}` };
  },
};
