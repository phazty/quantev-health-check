import { formatDistanceToNow, format, differenceInMinutes } from "date-fns";

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatTimestamp(date: Date): string {
  return format(date, "MMM d, HH:mm:ss");
}

export function formatDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}

export function formatTime(date: Date): string {
  return format(date, "HH:mm:ss");
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

export function formatPower(kw: number): string {
  if (kw >= 1000) return `${(kw / 1000).toFixed(1)} MW`;
  return `${kw.toFixed(1)} kW`;
}

export function formatEnergy(kwh: number): string {
  return `${kwh.toFixed(2)} kWh`;
}

export function formatVoltage(v: number): string {
  return `${v.toFixed(1)} V`;
}

export function formatCurrent(a: number): string {
  return `${a.toFixed(1)} A`;
}

export function formatTemperature(c: number): string {
  return `${c.toFixed(1)}°C`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function isStaleTimestamp(date: Date, thresholdMinutes = 5): boolean {
  return differenceInMinutes(new Date(), date) > thresholdMinutes;
}

export function staleness(date: Date): "fresh" | "aging" | "stale" | "critical" {
  const mins = differenceInMinutes(new Date(), date);
  if (mins < 5) return "fresh";
  if (mins < 15) return "aging";
  if (mins < 60) return "stale";
  return "critical";
}
