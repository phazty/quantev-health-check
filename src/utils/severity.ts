import type { Severity } from "@/types/charger";

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};

export const SEVERITY_BG: Record<Severity, string> = {
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  low: "bg-green-500/15 text-green-400 border-green-500/30",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

export const SEVERITY_DOT: Record<Severity, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-400",
  low: "bg-green-500",
  info: "bg-blue-400",
};

export const SEVERITY_ROW_HIGHLIGHT: Record<Severity, string> = {
  critical: "border-l-2 border-l-red-500 bg-red-500/5",
  high: "border-l-2 border-l-orange-500 bg-orange-500/5",
  medium: "border-l-2 border-l-amber-400",
  low: "",
  info: "",
};

export const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

export function maxSeverity(severities: Severity[]): Severity {
  if (severities.length === 0) return "info";
  return severities.reduce((max, s) => (SEVERITY_ORDER[s] < SEVERITY_ORDER[max] ? s : max));
}
