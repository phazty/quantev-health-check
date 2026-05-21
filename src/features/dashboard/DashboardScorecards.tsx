import { cn } from "@/utils/cn";
import { AnimatedCounter } from "@/components/primitives/AnimatedCounter";
import { useDashboardMetrics } from "./useDashboardMetrics";
import { TrendingUp, AlertTriangle, Zap, Clock } from "lucide-react";

interface ScorecardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  valueClassName?: string;
  description?: string;
  formatFn?: (v: number) => string;
}

function Scorecard({ label, value, icon: Icon, valueClassName, description, formatFn }: ScorecardProps) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className={cn("text-2xl font-bold tabular-nums leading-none", valueClassName)}>
        <AnimatedCounter value={value} formatFn={formatFn} />
      </div>
      {description && (
        <p className="text-[11px] text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}

export function DashboardScorecards() {
  const metrics = useDashboardMetrics();

  return (
    <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-border/50">
      <Scorecard
        label="Active Exceptions"
        value={metrics.exceptions}
        icon={AlertTriangle}
        valueClassName={metrics.exceptions > 0 ? "text-red-400" : "text-foreground"}
        description={`of ${metrics.total} devices`}
      />
      <Scorecard
        label="In Remediation"
        value={metrics.inRemediation}
        icon={Zap}
        valueClassName={metrics.inRemediation > 0 ? "text-orange" : "text-foreground"}
        description="auto-fixing now"
      />
      <Scorecard
        label="Failed Auto-Fixes"
        value={metrics.failedFixes}
        icon={AlertTriangle}
        valueClassName={metrics.failedFixes > 0 ? "text-red-400" : "text-green-400"}
        description="need human review"
      />
      <Scorecard
        label="Stale Telemetry"
        value={metrics.stale}
        icon={Clock}
        valueClassName={metrics.stale > 2 ? "text-amber-400" : "text-foreground"}
        description={`${metrics.online} online`}
      />
      <Scorecard
        label="Success Rate"
        value={metrics.successRate}
        icon={TrendingUp}
        valueClassName="text-green-400"
        formatFn={(v) => `${v}%`}
        description="last 24 hours"
      />
    </div>
  );
}
