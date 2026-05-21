import { cn } from "@/utils/cn";

type PulseStatus = "connected" | "reconnecting" | "disconnected" | "active" | "idle" | "warning";

const STATUS_COLOR: Record<PulseStatus, { dot: string; ring: string; label: string }> = {
  connected: { dot: "bg-green-500", ring: "bg-green-500", label: "Connected" },
  reconnecting: { dot: "bg-amber-400", ring: "bg-amber-400", label: "Reconnecting" },
  disconnected: { dot: "bg-red-500", ring: "bg-red-500", label: "Disconnected" },
  active: { dot: "bg-orange-500", ring: "bg-orange-500", label: "Active" },
  idle: { dot: "bg-slate-400", ring: "bg-slate-400", label: "Idle" },
  warning: { dot: "bg-amber-400", ring: "bg-amber-400", label: "Warning" },
};

interface StatusPulseProps {
  status: PulseStatus;
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
  label?: string;
  className?: string;
  animate?: boolean;
}

export function StatusPulse({ status, size = "default", showLabel, label, className, animate = true }: StatusPulseProps) {
  const colors = STATUS_COLOR[status];
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : size === "lg" ? "w-3 h-3" : "w-2 h-2";
  const ringSize = size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4";

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="relative inline-flex">
        {animate && status !== "idle" && (
          <span
            className={cn(
              "absolute inline-flex rounded-full opacity-75",
              ringSize,
              colors.ring,
              "animate-pulse-ring"
            )}
          />
        )}
        <span className={cn("relative inline-flex rounded-full", dotSize, colors.dot)} />
      </span>
      {showLabel && (
        <span className="text-xs text-slate-400">{label ?? colors.label}</span>
      )}
    </span>
  );
}
