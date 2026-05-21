import { cn } from "@/utils/cn";
import { StatusPulse } from "./StatusPulse";
import type { Severity } from "@/types/charger";
import { SEVERITY_BG } from "@/utils/severity";

interface TelemetryCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  severity?: Severity;
  trend?: "up" | "down" | "stable";
  isLive?: boolean;
  className?: string;
  onClick?: () => void;
}

const TREND_ICON: Record<string, string> = {
  up: "↑",
  down: "↓",
  stable: "→",
};

const TREND_COLOR: Record<string, string> = {
  up: "text-red-400",
  down: "text-green-400",
  stable: "text-slate-400",
};

export function TelemetryCard({
  title,
  value,
  unit,
  subtitle,
  severity,
  trend,
  isLive,
  className,
  onClick,
}: TelemetryCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-card p-4 flex flex-col gap-2 transition-colors",
        severity && severity !== "info" && SEVERITY_BG[severity],
        onClick && "cursor-pointer hover:bg-accent/50",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</span>
        <div className="flex items-center gap-1.5">
          {isLive && <StatusPulse status="active" size="sm" />}
          {trend && (
            <span className={cn("text-xs font-medium", TREND_COLOR[trend])}>
              {TREND_ICON[trend]}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold tabular-nums tracking-tight">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

interface ScorecardProps {
  label: string;
  value: number | string;
  change?: number;
  severity?: Severity;
  isLive?: boolean;
  description?: string;
}

export function ScorecardMetric({ label, value, change, severity, isLive, description }: ScorecardProps) {
  const isAlert = severity === "critical" || severity === "high";

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 p-4 rounded-lg border bg-card",
        isAlert && "border-orange/30 bg-orange/5"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{label}</span>
        {isLive && <StatusPulse status="active" size="sm" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "text-3xl font-bold tabular-nums",
            isAlert ? "text-orange" : "text-foreground"
          )}
        >
          {value}
        </span>
        {change !== undefined && (
          <span className={cn("text-sm font-medium", change > 0 ? "text-red-400" : "text-green-400")}>
            {change > 0 ? `+${change}` : change}
          </span>
        )}
      </div>
      {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
    </div>
  );
}
