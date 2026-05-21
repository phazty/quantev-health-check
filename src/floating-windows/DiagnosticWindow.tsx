import { useMotionValue, motion, AnimatePresence } from "framer-motion";
import type { MutableRefObject } from "react";
import { useChargerStore } from "@/stores/chargerStore";
import { useUIStore, type FloatingWindow } from "@/stores/uiStore";
import { LiveCell } from "@/components/primitives/LiveCell";
import { SeverityBadge } from "@/components/primitives/SeverityBadge";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/cn";
import {
  formatPower,
  formatVoltage,
  formatCurrent,
  formatTemperature,
} from "@/utils/formatters";
import { X, Minus, ChevronUp, GripHorizontal } from "lucide-react";

const CONNECTOR_STATUS_COLOR: Record<string, string> = {
  Available: "text-green-400",
  Occupied: "text-orange",
  Reserved: "text-blue-400",
  Faulted: "text-red-400",
  Unavailable: "text-slate-500",
  SuspendedEV: "text-amber-400",
  SuspendedEVSE: "text-amber-400",
  Finishing: "text-blue-300",
};

function MetricCell({
  label,
  value,
  format,
  threshold,
}: {
  label: string;
  value: number;
  format: (v: number) => string;
  threshold?: number;
}) {
  return (
    <div className="rounded bg-muted/30 px-2.5 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </p>
      <LiveCell value={value} format={format} threshold={threshold} className="text-sm" />
    </div>
  );
}

function Section({
  label,
  badge,
  children,
}: {
  label: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center">
        {label}
        {badge}
      </p>
      {children}
    </div>
  );
}

export interface DiagnosticWindowProps {
  win: FloatingWindow;
  constraintsRef: MutableRefObject<HTMLDivElement | null>;
}

export function DiagnosticWindow({ win, constraintsRef }: DiagnosticWindowProps) {
  const charger = useChargerStore((s) => s.chargers[win.chargerId]);
  const telemetry = useChargerStore((s) => s.telemetry[win.chargerId]);
  const sites = useChargerStore((s) => s.sites);
  const { closeWindow, focusWindow, toggleMinimize, updateWindowPosition } = useUIStore();

  const x = useMotionValue(win.position.x);
  const y = useMotionValue(win.position.y);

  if (!charger || !telemetry) return null;

  const site = sites[charger.siteId];
  const driftParams = telemetry.configDrift.filter((p) => p.drift);

  const statusVariant =
    charger.status === "online"
      ? "online"
      : charger.status === "faulted"
      ? "faulted"
      : charger.status === "offline"
      ? "offline"
      : ("unavailable" as const);

  return (
    <motion.div
      className="absolute w-80 rounded-lg border bg-card shadow-2xl shadow-black/50 pointer-events-auto overflow-hidden"
      style={{ x, y, zIndex: win.zIndex }}
      drag
      dragMomentum={false}
      dragElastic={0}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dragConstraints={constraintsRef as any}
      onDragEnd={() => updateWindowPosition(win.id, { x: x.get(), y: y.get() })}
      onMouseDown={() => focusWindow(win.id)}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
    >
      {/* Title bar — always visible */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-navy-lighter/80 border-b border-border/50 cursor-grab active:cursor-grabbing select-none">
        <GripHorizontal className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold truncate">
              {charger.manufacturer} {charger.model}
            </span>
            <Badge variant={statusVariant} className="text-[9px] px-1.5 py-0 h-4 flex-shrink-0">
              {charger.status}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {charger.serialNumber} · {site?.city ?? charger.siteId}
          </p>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            aria-label={win.isMinimized ? "Restore window" : "Minimize window"}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => toggleMinimize(win.id)}
            className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          >
            {win.isMinimized ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
          </button>
          <button
            aria-label="Close diagnostic window"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => closeWindow(win.id)}
            className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-white/10 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Body — collapses when minimized */}
      <AnimatePresence initial={false}>
        {!win.isMinimized && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 38 }}
            className="overflow-hidden"
          >
            <ScrollArea className="max-h-[420px]">
              <div className="p-3 space-y-3.5">
                {/* Live telemetry */}
                <Section label="Live Telemetry">
                  <div className="grid grid-cols-2 gap-2">
                    <MetricCell label="Voltage" value={telemetry.voltage} format={formatVoltage} />
                    <MetricCell label="Current" value={telemetry.current} format={formatCurrent} />
                    <MetricCell label="Power" value={telemetry.power} format={formatPower} />
                    <MetricCell
                      label="Temperature"
                      value={telemetry.temperature}
                      format={formatTemperature}
                      threshold={0.3}
                    />
                  </div>
                </Section>

                {/* Connectors */}
                <Section label={`Connectors (${charger.connectors.length})`}>
                  <div className="space-y-1">
                    {charger.connectors.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between rounded bg-muted/30 px-2.5 py-1.5 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-muted-foreground w-4 flex-shrink-0">
                            #{c.id}
                          </span>
                          <span className="text-muted-foreground truncate">{c.type}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={cn(
                              "font-medium text-[11px]",
                              CONNECTOR_STATUS_COLOR[c.status] ?? "text-muted-foreground"
                            )}
                          >
                            {c.status}
                          </span>
                          {c.currentPower > 0 && (
                            <span className="font-mono text-[11px] text-orange">
                              {formatPower(c.currentPower)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Config drift */}
                {driftParams.length > 0 && (
                  <Section
                    label="Config Drift"
                    badge={
                      <span className="text-amber-400 ml-1.5">({driftParams.length})</span>
                    }
                  >
                    <div className="space-y-1.5">
                      {driftParams.map((p) => (
                        <div
                          key={p.key}
                          className="rounded bg-amber-500/5 border border-amber-500/20 px-2.5 py-1.5"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-mono font-medium truncate">
                              {p.key}
                            </span>
                            <SeverityBadge severity={p.severity} size="sm" showDot={false} />
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono">
                            <span className="text-red-400 bg-red-500/10 rounded px-1 py-0.5">
                              {p.currentValue}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className="text-green-400 bg-green-500/10 rounded px-1 py-0.5">
                              {p.expectedValue}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Active errors */}
                {telemetry.errors.length > 0 && (
                  <Section
                    label="Active Errors"
                    badge={
                      <span className="text-red-400 ml-1.5">({telemetry.errors.length})</span>
                    }
                  >
                    <div className="space-y-1.5">
                      {telemetry.errors.map((err, i) => (
                        <div
                          key={i}
                          className="rounded bg-red-500/5 border border-red-500/15 px-2.5 py-1.5 flex items-start gap-2"
                        >
                          <SeverityBadge
                            severity={err.severity}
                            size="sm"
                            showDot={false}
                            className="flex-shrink-0 mt-0.5"
                          />
                          <div className="min-w-0">
                            <p className="text-[11px] font-mono text-red-300 leading-tight">
                              {err.code}
                            </p>
                            <p className="text-[10px] text-muted-foreground leading-snug">
                              {err.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* All clear */}
                {driftParams.length === 0 && telemetry.errors.length === 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-green-500 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    No active faults or config drift
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
