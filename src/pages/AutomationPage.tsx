import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAutomationStore } from "@/stores/automationStore";
import { AnimatedQueueCard } from "@/features/automation/AnimatedQueueCard";
import { TicketModal } from "@/features/automation/TicketModal";
import { AssignModal } from "@/features/automation/AssignModal";
import { StatusPulse } from "@/components/primitives/StatusPulse";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/cn";
import { Pause, Play, Zap, AlertTriangle, Activity } from "lucide-react";
import type { QueueItem } from "@/types/remediation";

function PipelineLane({
  title,
  icon: Icon,
  items,
  lane,
  accentClass,
  onTicket,
  onAssign,
  onRetry,
}: {
  title: string;
  icon: React.ElementType;
  items: QueueItem[];
  lane: "scanning" | "active" | "intervention";
  accentClass: string;
  onTicket?: (item: QueueItem) => void;
  onAssign?: (item: QueueItem) => void;
  onRetry?: (itemId: string) => void;
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0 rounded-lg border bg-card">
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b border-border/50 rounded-t-lg",
          accentClass
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <span className="text-xs font-medium bg-background/40 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">No items in queue</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <AnimatedQueueCard
                  key={item.id}
                  item={item}
                  lane={lane}
                  onTicket={onTicket}
                  onAssign={onAssign}
                  onRetry={onRetry}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function AutomationPage() {
  const {
    scanningLane,
    activeLane,
    interventionLane,
    isPaused,
    velocity,
    pauseQueue,
    resumeQueue,
    setVelocity,
    retryItem,
  } = useAutomationStore();

  const [ticketItem, setTicketItem] = useState<QueueItem | null>(null);
  const [assignItem, setAssignItem] = useState<QueueItem | null>(null);

  const totalItems = scanningLane.length + activeLane.length + interventionLane.length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div>
          <h1 className="text-lg font-semibold">Automation Pipeline</h1>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <span>{totalItems} items</span>
            <span>·</span>
            {isPaused ? (
              <span className="text-amber-400">Queue paused</span>
            ) : (
              <span className="flex items-center gap-1">
                <StatusPulse status="active" size="sm" animate />
                <span className="text-green-400">Running</span>
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 border border-border rounded-md p-0.5">
            {(["slow", "normal", "fast"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVelocity(v)}
                className={cn(
                  "px-2.5 py-1 text-xs rounded transition-colors capitalize",
                  velocity === v
                    ? "bg-orange text-white font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <Button
            variant={isPaused ? "orange" : "outline"}
            size="sm"
            onClick={isPaused ? resumeQueue : pauseQueue}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 mr-1.5" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 mr-1.5" />
                Pause
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 gap-4 p-6">
        <PipelineLane
          title="Network Scanning"
          icon={Activity}
          items={scanningLane}
          lane="scanning"
          accentClass="bg-blue-500/5 text-blue-400"
        />
        <PipelineLane
          title="Active Remediation"
          icon={Zap}
          items={activeLane}
          lane="active"
          accentClass="bg-orange/5 text-orange"
          onRetry={retryItem}
        />
        <PipelineLane
          title="Human Intervention"
          icon={AlertTriangle}
          items={interventionLane}
          lane="intervention"
          accentClass="bg-red-500/5 text-red-400"
          onTicket={setTicketItem}
          onAssign={setAssignItem}
          onRetry={retryItem}
        />
      </div>

      <TicketModal
        open={ticketItem !== null}
        item={ticketItem}
        onClose={() => setTicketItem(null)}
      />
      <AssignModal
        open={assignItem !== null}
        item={assignItem}
        onClose={() => setAssignItem(null)}
      />
    </div>
  );
}
