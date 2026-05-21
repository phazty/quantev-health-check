import { Outlet, useLocation } from "react-router-dom";
import { useWebSocketStore } from "@/stores/websocketStore";
import { cn } from "@/utils/cn";
import { WifiOff, RotateCcw } from "lucide-react";

function DisconnectBanner() {
  const status = useWebSocketStore((s) => s.status);
  const reconnectAttempts = useWebSocketStore((s) => s.reconnectAttempts);

  if (status === "connected") return null;

  return (
    <div
      role="status"
      aria-live="assertive"
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-xs font-medium flex-shrink-0",
        status === "disconnected"
          ? "bg-red-500/15 border-b border-red-500/30 text-red-400"
          : "bg-amber-500/15 border-b border-amber-500/30 text-amber-400"
      )}
    >
      {status === "disconnected" ? (
        <WifiOff className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      ) : (
        <RotateCcw className="w-3.5 h-3.5 flex-shrink-0 animate-spin" aria-hidden="true" />
      )}
      <span>
        {status === "disconnected"
          ? "WebSocket connection lost — live updates paused"
          : `Reconnecting to OCPP server… attempt ${reconnectAttempts}`}
      </span>
    </div>
  );
}

export function WorkspaceArea() {
  const location = useLocation();

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-canvas dark:bg-slate-950">
      <DisconnectBanner />
      <main
        key={location.pathname}
        className="flex-1 overflow-hidden animate-fade-in"
      >
        <Outlet />
      </main>
    </div>
  );
}
