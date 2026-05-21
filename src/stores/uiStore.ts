import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type Theme = "light" | "dark";

export interface FloatingWindow {
  id: string;
  chargerId: string;
  position: { x: number; y: number };
  zIndex: number;
  isMinimized: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  timestamp: Date;
  read: boolean;
}

interface UIState {
  theme: Theme;
  sidebarCollapsed: boolean;
  activeSiteFilter: string | null;
  openWindows: FloatingWindow[];
  notifications: Notification[];
  windowZCounter: number;

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setActiveSiteFilter: (siteId: string | null) => void;
  openWindow: (chargerId: string) => void;
  closeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  updateWindowPosition: (windowId: string, pos: { x: number; y: number }) => void;
  toggleMinimize: (windowId: string) => void;
  pushNotification: (n: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

let _notifId = 1;

export const useUIStore = create<UIState>()(
  persist(
    immer((set, get) => ({
      theme: "dark",
      sidebarCollapsed: false,
      activeSiteFilter: null,
      openWindows: [],
      notifications: [],
      windowZCounter: 10,

      setTheme: (theme) => set((s) => { s.theme = theme; }),
      toggleTheme: () => set((s) => { s.theme = s.theme === "dark" ? "light" : "dark"; }),
      toggleSidebar: () => set((s) => { s.sidebarCollapsed = !s.sidebarCollapsed; }),
      setActiveSiteFilter: (siteId) => set((s) => { s.activeSiteFilter = siteId; }),

      openWindow: (chargerId) =>
        set((s) => {
          const existing = s.openWindows.find((w) => w.chargerId === chargerId);
          if (existing) {
            s.windowZCounter += 1;
            existing.zIndex = s.windowZCounter;
            existing.isMinimized = false;
            return;
          }
          s.windowZCounter += 1;
          const offset = s.openWindows.length * 30;
          s.openWindows.push({
            id: `win-${Date.now()}`,
            chargerId,
            position: { x: 200 + offset, y: 100 + offset },
            zIndex: s.windowZCounter,
            isMinimized: false,
          });
        }),

      closeWindow: (windowId) =>
        set((s) => {
          s.openWindows = s.openWindows.filter((w) => w.id !== windowId);
        }),

      focusWindow: (windowId) =>
        set((s) => {
          const w = s.openWindows.find((w) => w.id === windowId);
          if (w) {
            s.windowZCounter += 1;
            w.zIndex = s.windowZCounter;
          }
        }),

      updateWindowPosition: (windowId, pos) =>
        set((s) => {
          const w = s.openWindows.find((w) => w.id === windowId);
          if (w) w.position = pos;
        }),

      toggleMinimize: (windowId) =>
        set((s) => {
          const w = s.openWindows.find((w) => w.id === windowId);
          if (w) w.isMinimized = !w.isMinimized;
        }),

      pushNotification: (n) =>
        set((s) => {
          s.notifications.unshift({
            ...n,
            id: `notif-${_notifId++}`,
            timestamp: new Date(),
            read: false,
          });
          if (s.notifications.length > 50) {
            s.notifications = s.notifications.slice(0, 50);
          }
        }),

      markNotificationRead: (id) =>
        set((s) => {
          const n = s.notifications.find((n) => n.id === id);
          if (n) n.read = true;
        }),

      clearNotifications: () =>
        set((s) => {
          s.notifications = s.notifications.map((n) => ({ ...n, read: true }));
        }),
    })),
    {
      name: "quantev-ui-state",
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
