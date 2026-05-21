import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { remediationService } from "@/services/remediationService";
import { CheckCircle, Loader2 } from "lucide-react";
import type { QueueItem } from "@/types/remediation";

interface TicketModalProps {
  open: boolean;
  item: QueueItem | null;
  onClose: () => void;
}

type TicketSystem = "Jira" | "Salesforce";
type Priority = "P1" | "P2" | "P3";

export function TicketModal({ open, item, onClose }: TicketModalProps) {
  const [system, setSystem] = useState<TicketSystem>("Jira");
  const [priority, setPriority] = useState<Priority>("P1");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ ticketId: string } | null>(null);

  useEffect(() => {
    if (open) {
      setResult(null);
      setIsLoading(false);
      setPriority(
        item?.severity === "critical" ? "P1" : item?.severity === "high" ? "P2" : "P3"
      );
    }
  }, [open, item]);

  async function handleSubmit() {
    if (!item) return;
    setIsLoading(true);
    try {
      const res = await remediationService.createTicket(item.id, system);
      setResult(res);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm">{result.ticketId} created</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ticket assigned to field operations queue in {system}.
              </p>
            </div>
            <Button size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-1">
              {item && (
                <div className="rounded-md bg-muted/50 px-3 py-2 text-xs">
                  <p className="font-medium">{item.chargerName}</p>
                  <p className="text-muted-foreground mt-0.5">{item.faultType}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">System</Label>
                  <Select value={system} onValueChange={(v) => setSystem(v as TicketSystem)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Jira">Jira</SelectItem>
                      <SelectItem value="Salesforce">Salesforce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P1">P1 — Critical</SelectItem>
                      <SelectItem value="P2">P2 — High</SelectItem>
                      <SelectItem value="P3">P3 — Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button variant="orange" size="sm" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create Ticket"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
