import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { WSConnectionStatus, WSMessage } from "@/types/websocket";

const MAX_BUFFER = 200;

interface WebSocketState {
  status: WSConnectionStatus;
  lastHeartbeat: Date;
  reconnectAttempts: number;
  eventBuffer: WSMessage[];
  latencyMs: number;

  setStatus: (status: WSConnectionStatus) => void;
  recordHeartbeat: (latencyMs?: number) => void;
  incrementReconnect: () => void;
  resetReconnect: () => void;
  pushEvent: (event: WSMessage) => void;
}

export const useWebSocketStore = create<WebSocketState>()(
  immer((set) => ({
    status: "connected",
    lastHeartbeat: new Date(),
    reconnectAttempts: 0,
    eventBuffer: [],
    latencyMs: 12,

    setStatus: (status) =>
      set((s) => {
        s.status = status;
      }),

    recordHeartbeat: (latencyMs) =>
      set((s) => {
        s.lastHeartbeat = new Date();
        if (latencyMs !== undefined) s.latencyMs = latencyMs;
        s.reconnectAttempts = 0;
        s.status = "connected";
      }),

    incrementReconnect: () =>
      set((s) => {
        s.reconnectAttempts += 1;
        s.status = "reconnecting";
      }),

    resetReconnect: () =>
      set((s) => {
        s.reconnectAttempts = 0;
      }),

    pushEvent: (event) =>
      set((s) => {
        s.eventBuffer.unshift(event);
        if (s.eventBuffer.length > MAX_BUFFER) {
          s.eventBuffer = s.eventBuffer.slice(0, MAX_BUFFER);
        }
      }),
  }))
);
