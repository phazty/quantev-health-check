import { cn } from "@/utils/cn";
import { SEVERITY_BG, SEVERITY_LABEL, SEVERITY_DOT } from "@/utils/severity";
import type { Severity } from "@/types/charger";

interface SeverityBadgeProps {
  severity: Severity;
  showDot?: boolean;
  className?: string;
  size?: "sm" | "default";
}

export function SeverityBadge({ severity, showDot = true, className, size = "default" }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border font-medium",
        size === "sm" ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-xs",
        SEVERITY_BG[severity],
        className
      )}
    >
      {showDot && (
        <span className={cn("rounded-full flex-shrink-0", size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5", SEVERITY_DOT[severity])} />
      )}
      {SEVERITY_LABEL[severity]}
    </span>
  );
}
