import { useChargerStore } from "@/stores/chargerStore";
import { useAutomationStore } from "@/stores/automationStore";
import { useWebSocketStore } from "@/stores/websocketStore";
import { useAuditStore } from "@/stores/auditStore";
import { useUIStore } from "@/stores/uiStore";
import { randomPick, randomPickN, randomBetween, randomInt } from "@/utils/delays";
import type { AuditEvent } from "@/types/audit";
import type { WSMessage } from "@/types/websocket";

let _evtId = 100;
const eid = () => `sim-evt-${String(_evtId++).padStart(4, "0")}`;

const ONLINE_CHARGER_IDS = [
  "chg-001","chg-002","chg-004","chg-005","chg-006","chg-008",
  "chg-010","chg-012","chg-013","chg-014","chg-016","chg-018",
  "chg-019","chg-020","chg-021","chg-022","chg-023","chg-024",
  "chg-027","chg-028","chg-029","chg-030","chg-031","chg-033",
  "chg-034","chg-035",
];

class WebSocketSimulator {
  private intervals: ReturnType<typeof setInterval>[] = [];
  private paused = false;

  start() {
    // Telemetry updates every 3.5s — pick 4-6 random online chargers
    this.intervals.push(
      setInterval(() => {
        if (this.paused) return;
        this.pushTelemetryUpdates();
      }, 3500)
    );

    // Queue progression every 5s
    this.intervals.push(
      setInterval(() => {
        if (this.paused) return;
        this.advanceQueue();
      }, 5000)
    );

    // Heartbeat every 8s
    this.intervals.push(
      setInterval(() => {
        this.sendHeartbeat();
      }, 8000)
    );

    // Stale device check every 20s
    this.intervals.push(
      setInterval(() => {
        if (this.paused) return;
        this.checkStaleDevices();
      }, 20000)
    );

    // Audit event generation every 12s
    this.intervals.push(
      setInterval(() => {
        if (this.paused) return;
        this.generateAuditEvent();
      }, 12000)
    );

    // Disconnect simulation every 60s, 8% chance
    this.intervals.push(
      setInterval(() => {
        if (this.paused) return;
        if (Math.random() < 0.08) {
          this.simulateDisconnect();
        }
      }, 60000)
    );
  }

  stop() {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
  }

  pause() { this.paused = true; }
  resume() { this.paused = false; }

  private pushTelemetryUpdates() {
    const chargerStore = useChargerStore.getState();
    const wsStore = useWebSocketStore.getState();
    const targets = randomPickN(ONLINE_CHARGER_IDS, randomInt(3, 6));

    targets.forEach((id) => {
      const current = chargerStore.telemetry[id];
      if (!current) return;

      const voltDelta = (Math.random() - 0.5) * 4;
      const currDelta = (Math.random() - 0.5) * 2;
      const tempDelta = (Math.random() - 0.5) * 1;

      chargerStore.updateTelemetry(id, {
        timestamp: new Date(),
        voltage: Math.max(380, Math.min(420, current.voltage + voltDelta)),
        current: Math.max(0, Math.min(80, current.current + currDelta)),
        power: Math.max(0, current.power + (Math.random() - 0.5) * 3),
        temperature: Math.max(25, Math.min(75, current.temperature + tempDelta)),
        isStale: false,
        signalStrength: Math.min(100, Math.max(40, current.signalStrength + (Math.random() - 0.5) * 5)),
      });

      chargerStore.refreshTimestamp(id);
    });

    // Push WS event
    const msg: WSMessage = {
      id: eid(),
      type: "telemetry_update",
      timestamp: new Date(),
      payload: { chargerIds: targets, count: targets.length },
    };
    wsStore.pushEvent(msg);
  }

  private advanceQueue() {
    const autoStore = useAutomationStore.getState();
    const auditStore = useAuditStore.getState();
    const wsStore = useWebSocketStore.getState();

    autoStore.tickItems();

    const { isPaused, velocity } = autoStore;
    if (isPaused) return;

    const tickThreshold = velocity === "fast" ? 2 : velocity === "slow" ? 6 : 4;

    // Promote scanning → in-flight
    const readyToFlight = autoStore.scanningLane.filter(
      (i) => i.ticksInState >= tickThreshold
    );
    readyToFlight.slice(0, 1).forEach((item) => {
      autoStore.promoteToFlight(item.id);
      wsStore.pushEvent({
        id: eid(), type: "remediation_state_change", timestamp: new Date(),
        payload: { itemId: item.id, chargerId: item.chargerId, from: "scanning", to: "in-flight" },
      });
    });

    // Advance in-flight → complete or intervention
    const readyToComplete = autoStore.activeLane.filter(
      (i) => i.ticksInState >= tickThreshold * 2
    );
    readyToComplete.slice(0, 1).forEach((item) => {
      const success = item.retryCount < item.maxRetries && Math.random() > 0.25;
      autoStore.completeItem(item.id, success);

      const event: AuditEvent = {
        id: eid(),
        type: success ? "remediation_completed" : "remediation_failed",
        severity: success ? "info" : "high",
        message: success
          ? `Remediation completed for ${item.chargerName}`
          : `Remediation failed for ${item.chargerName} — promoting to intervention`,
        details: success
          ? `All parameters corrected. Device operational.`
          : `Attempt ${item.retryCount + 1}/${item.maxRetries} failed.`,
        chargerId: item.chargerId,
        chargerName: item.chargerName,
        userId: null, userName: null,
        timestamp: new Date(),
        metadata: { queueItemId: item.id, success },
      };
      auditStore.appendEvent(event);

      if (!success) {
        useUIStore.getState().pushNotification({
          title: "Remediation Failed",
          message: `${item.chargerName} needs human review`,
          severity: "high",
        });
      }
    });
  }

  private sendHeartbeat() {
    const wsStore = useWebSocketStore.getState();
    const latency = randomBetween(8, 45);
    wsStore.recordHeartbeat(latency);
    wsStore.pushEvent({
      id: eid(), type: "heartbeat", timestamp: new Date(),
      payload: { latencyMs: latency },
    });
  }

  private checkStaleDevices() {
    const chargerStore = useChargerStore.getState();
    const auditStore = useAuditStore.getState();
    const STALE_MS = 15 * 60 * 1000;

    Object.values(chargerStore.telemetry).forEach((t) => {
      const age = Date.now() - t.timestamp.getTime();
      if (age > STALE_MS && !t.isStale) {
        chargerStore.markStale(t.chargerId);
        const charger = chargerStore.chargers[t.chargerId];
        if (charger) {
          auditStore.appendEvent({
            id: eid(), type: "stale_telemetry", severity: "medium",
            message: `Telemetry stale for ${charger.manufacturer} ${charger.model} — ${Math.round(age / 60000)}m`,
            details: null,
            chargerId: t.chargerId,
            chargerName: `${charger.manufacturer} ${charger.model}`,
            userId: null, userName: null,
            timestamp: new Date(),
            metadata: { staleMinutes: Math.round(age / 60000) },
          });
        }
      }
    });
  }

  private generateAuditEvent() {
    const auditStore = useAuditStore.getState();
    const chargerIds = ONLINE_CHARGER_IDS;
    const chargerId = randomPick(chargerIds);
    const chargerStore = useChargerStore.getState();
    const charger = chargerStore.chargers[chargerId];
    if (!charger) return;

    const eventTypes: AuditEvent["type"][] = [
      "command_acknowledged", "config_changed", "alert_acknowledged",
    ];
    const type = randomPick(eventTypes);

    auditStore.appendEvent({
      id: eid(),
      type,
      severity: "info",
      message: `${type.replace(/_/g, " ")} — ${charger.manufacturer} ${charger.model}`,
      details: null,
      chargerId,
      chargerName: `${charger.manufacturer} ${charger.model}`,
      userId: null, userName: null,
      timestamp: new Date(),
      metadata: {},
    });
  }

  private simulateDisconnect() {
    const wsStore = useWebSocketStore.getState();
    const auditStore = useAuditStore.getState();
    const uiStore = useUIStore.getState();

    wsStore.setStatus("disconnected");
    uiStore.pushNotification({
      title: "WebSocket Disconnected",
      message: "Connection to OCPP server lost. Attempting reconnect…",
      severity: "critical",
    });
    auditStore.appendEvent({
      id: eid(), type: "ws_disconnect", severity: "high",
      message: "WebSocket connection lost",
      details: "Attempting automatic reconnection to wss://ocpp.quantev.io",
      chargerId: null, chargerName: null, userId: null, userName: null,
      timestamp: new Date(), metadata: {},
    });

    const reconnectDelay = randomBetween(2000, 6000);
    setTimeout(() => {
      wsStore.setStatus("reconnecting");
      wsStore.incrementReconnect();
      setTimeout(() => {
        wsStore.recordHeartbeat();
        auditStore.appendEvent({
          id: eid(), type: "ws_reconnect", severity: "info",
          message: "WebSocket connection restored",
          details: `Reconnected after ${Math.round(reconnectDelay / 1000)}s`,
          chargerId: null, chargerName: null, userId: null, userName: null,
          timestamp: new Date(), metadata: { delayMs: reconnectDelay },
        });
        uiStore.pushNotification({
          title: "WebSocket Restored",
          message: "Connection to OCPP server re-established",
          severity: "info",
        });
      }, randomBetween(1500, 3500));
    }, reconnectDelay);
  }
}

export const wsSimulator = new WebSocketSimulator();
