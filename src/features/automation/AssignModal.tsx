import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { useUserStore } from "@/stores/userStore";
import { useAutomationStore } from "@/stores/automationStore";
import { CheckCircle } from "lucide-react";
import type { QueueItem } from "@/types/remediation";

interface AssignModalProps {
  open: boolean;
  item: QueueItem | null;
  onClose: () => void;
}

export function AssignModal({ open, item, onClose }: AssignModalProps) {
  const team = useUserStore((s) => s.team);
  const assignOperator = useAutomationStore((s) => s.assignOperator);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const operators = team.filter((u) =>
    ["operator", "administrator", "super_admin"].includes(u.role)
  );

  function handleConfirm() {
    if (!item || !selectedId) return;
    assignOperator(item.id, selectedId);
    setSelectedId(null);
    onClose();
  }

  function handleClose() {
    setSelectedId(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Operator</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {item && (
            <div className="rounded-md bg-muted/50 px-3 py-2 text-xs">
              <p className="font-medium">{item.chargerName}</p>
              <p className="text-muted-foreground mt-0.5">{item.siteName}</p>
            </div>
          )}
          <div className="space-y-1">
            {operators.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedId(user.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left",
                  selectedId === user.id
                    ? "bg-orange/10 border border-orange/30 text-foreground"
                    : "hover:bg-muted border border-transparent"
                )}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.avatarInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium leading-tight truncate">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground">{user.department}</p>
                </div>
                {selectedId === user.id && (
                  <CheckCircle className="w-4 h-4 text-orange flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="orange" size="sm" onClick={handleConfirm} disabled={!selectedId}>
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
