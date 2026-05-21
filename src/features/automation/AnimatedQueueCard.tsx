import { motion } from "framer-motion";
import { SeverityBadge } from "@/components/primitives/SeverityBadge";
import { StatusPulse } from "@/components/primitives/StatusPulse";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/utils/cn";
import { formatRelativeTime } from "@/utils/formatters";
import { Clock, Users, RotateCcw, Ticket } from "lucide-react";
import type { QueueItem } from "@/types/remediation";

interface AnimatedQueueCardProps {
  item: QueueItem;
  lane: "scanning" | "active" | "intervention";
  onTicket?: (item: QueueItem) => void;
  onAssign?: (item: QueueItem) => void;
  onRetry?: (itemId: string) => void;
}

export function AnimatedQueueCard({
  item,
  lane,
  onTicket,
  onAssign,
  onRetry,
}: AnimatedQueueCardProps) {
  const borderColor =
    item.severity === "critical"
      ? "border-red-500/40"
      : item.severity === "high"
      ? "border-orange-500/40"
      : "border-border";

  const bgColor =
    item.severity === "critical"
      ? "bg-red-500/[0.04]"
      : item.severity === "high"
      ? "bg-orange-500/[0.04]"
      : "";

  const progress = lane === "active" ? Math.min(90, (item.ticksInState / 8) * 100) : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn("rounded-lg border p-3 space-y-2.5", borderColor, bgColor)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate leading-tight">{item.chargerName}</p>
          <p className="text-[11px] text-muted-foreground truncate">{item.siteName}</p>
        </div>
        <SeverityBadge severity={item.severity} size="sm" />
      </div>

      <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{item.faultType}</p>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatRelativeTime(item.enqueuedAt)}</span>
        </div>
        {item.retryCount > 0 && (
          <span className="text-amber-400 font-medium">
            Retry {item.retryCount}/{item.maxRetries}
          </span>
        )}
      </div>

      {lane === "scanning" && (
        <div className="flex items-center gap-1.5 pt-0.5">
          <StatusPulse status="active" size="sm" animate />
          <span className="text-xs text-muted-foreground">Scanning configuration…</span>
        </div>
      )}

      {lane === "active" && progress !== null && (
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <StatusPulse status="active" size="sm" animate />
              <span className="text-xs text-muted-foreground">Executing commands…</span>
            </div>
            <span className="text-[11px] text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      )}

      {lane === "intervention" && (
        <div className="space-y-2 pt-0.5">
          {item.assignedOperator && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <Users className="w-3 h-3 text-green-400" />
              <span className="text-green-400">Operator assigned</span>
            </div>
          )}
          <div className="flex gap-1.5">
            <Button
              variant="orange-outline"
              size="sm"
              className="flex-1 h-6 text-[10px] gap-1"
              onClick={() => onRetry?.(item.id)}
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-6 text-[10px] gap-1"
              onClick={() => onAssign?.(item)}
            >
              <Users className="w-3 h-3" />
              Assign
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-6 text-[10px] gap-1"
              onClick={() => onTicket?.(item)}
            >
              <Ticket className="w-3 h-3" />
              Ticket
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
