import { useState } from "react";
import { useAuditStore } from "@/stores/auditStore";
import { SeverityBadge } from "@/components/primitives/SeverityBadge";
import { StatusPulse } from "@/components/primitives/StatusPulse";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/cn";
import { formatTimestamp, formatDuration } from "@/utils/formatters";
import type { Severity } from "@/types/charger";
import { Activity, Filter, Terminal, Search, ChevronDown, ChevronUp } from "lucide-react";

const SEVERITY_FILTERS: { label: string; value: Severity | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Info", value: "info" },
];

const EVENT_TYPE_ICON: Record<string, string> = {
  remediation_started: "▶",
  remediation_completed: "✓",
  remediation_failed: "✗",
  command_sent: "→",
  command_acknowledged: "←",
  command_timeout: "⏱",
  charger_offline: "⊘",
  charger_online: "⊕",
  ws_disconnect: "⚡",
  ws_reconnect: "⚡",
  user_login: "◉",
  fault_detected: "⚠",
  ticket_created: "✦",
  stale_telemetry: "⧗",
  retry_exhausted: "⛔",
  config_changed: "✎",
  operator_assigned: "◈",
  alert_acknowledged: "✓",
};

export function ObservabilityPage() {
  const { severityFilter, setSeverityFilter, commandLogs } = useAuditStore();
  const filteredEvents = useAuditStore((s) => s.filteredEvents());
  const [searchText, setSearchText] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const visibleEvents = searchText.trim()
    ? filteredEvents.filter((e) => {
        const q = searchText.toLowerCase();
        return (
          e.message.toLowerCase().includes(q) ||
          (e.chargerName?.toLowerCase().includes(q) ?? false) ||
          (e.details?.toLowerCase().includes(q) ?? false)
        );
      })
    : filteredEvents;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-semibold">Observability & Audit Center</h1>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <StatusPulse status="active" size="sm" animate />
              <span>{visibleEvents.length} events · live stream</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search events…"
              className="h-7 pl-8 pr-3 text-xs rounded-md border border-input bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring w-44"
            />
          </div>
          {/* Severity filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            {SEVERITY_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setSeverityFilter(f.value)}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                  severityFilter === f.value
                    ? "bg-orange text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 divide-x divide-border/50">
        {/* Event stream */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50">
            <Activity className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Event Stream
            </span>
            {searchText && (
              <span className="text-xs text-muted-foreground ml-auto">
                {visibleEvents.length} match{visibleEvents.length !== 1 ? "es" : ""}
              </span>
            )}
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border/30">
              {visibleEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-sm text-muted-foreground">No events match the current filters</p>
                </div>
              ) : (
                visibleEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors",
                      event.severity === "critical" && "border-l-2 border-l-red-500",
                      event.severity === "high" && "border-l-2 border-l-orange-500"
                    )}
                  >
                    <span className="text-sm leading-none mt-0.5 w-5 text-center flex-shrink-0 opacity-60 font-mono">
                      {EVENT_TYPE_ICON[event.type] ?? "·"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium">{event.message}</span>
                        <SeverityBadge severity={event.severity} size="sm" />
                      </div>
                      {event.details && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {event.details}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                        <span className="font-mono">{formatTimestamp(event.timestamp)}</span>
                        {event.chargerName && <span>· {event.chargerName}</span>}
                        {event.userName && <span>· {event.userName}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Command log */}
        <div className="w-80 flex flex-col flex-shrink-0">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50">
            <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Command Log
            </span>
            <span className="ml-auto text-[10px] text-muted-foreground">{commandLogs.length}</span>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {commandLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <button
                    key={log.id}
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className={cn(
                      "w-full rounded border p-2.5 text-xs font-mono text-left transition-colors",
                      log.status === "success"
                        ? "border-green-500/20 bg-green-500/5 hover:bg-green-500/10"
                        : log.status === "failed"
                        ? "border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                        : "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          "font-semibold",
                          log.status === "success"
                            ? "text-green-400"
                            : log.status === "failed"
                            ? "text-red-400"
                            : "text-amber-400"
                        )}
                      >
                        {log.command}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDuration(log.durationMs)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground truncate text-[11px]">{log.chargerName}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatTimestamp(log.timestamp)} · {log.operator}
                    </p>
                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-border/40">
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">
                          Payload
                        </p>
                        <pre className="text-[10px] text-foreground/80 whitespace-pre-wrap break-all leading-relaxed">
                          {log.payload}
                        </pre>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
