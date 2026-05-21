import { useWebSocketStore } from "@/stores/websocketStore";
import { StatusPulse } from "./StatusPulse";
import { formatRelativeTime } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface WebSocketIndicatorProps {
  collapsed?: boolean;
  className?: string;
}

export function WebSocketIndicator({ collapsed, className }: WebSocketIndicatorProps) {
  const { status, lastHeartbeat, latencyMs, reconnectAttempts } = useWebSocketStore();

  const pulseStatus =
    status === "connected" ? "connected" :
    status === "reconnecting" ? "reconnecting" : "disconnected";

  const statusLabel =
    status === "connected" ? "Live" :
    status === "reconnecting" ? `Retry ${reconnectAttempts}` : "Offline";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("flex items-center gap-2 px-3 py-2 rounded cursor-default", className)}>
          <StatusPulse status={pulseStatus} size="sm" />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-slate-300 leading-none">{statusLabel}</span>
              <span className="text-[10px] text-slate-500 leading-none mt-0.5">{latencyMs}ms</span>
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">
        <div className="space-y-0.5">
          <p className="font-medium">OCPP WebSocket</p>
          <p className="text-slate-400">Status: {status}</p>
          <p className="text-slate-400">Latency: {latencyMs}ms</p>
          <p className="text-slate-400">Last beat: {formatRelativeTime(lastHeartbeat)}</p>
          {status === "reconnecting" && (
            <p className="text-amber-400">Reconnect attempt {reconnectAttempts}</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
