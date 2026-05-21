import { useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatRelativeTime, formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import { ROLE_LABELS, ROLE_COLORS } from "@/types/user";
import type { UserRole } from "@/types/user";
import { UserPlus, Shield, ChevronDown, Mail, Clock } from "lucide-react";

const ROLE_OPTIONS: UserRole[] = ["super_admin", "administrator", "operator", "auditor"];

const PERMISSIONS: {
  resource: string;
  super_admin: boolean;
  administrator: boolean;
  operator: boolean;
  auditor: boolean;
}[] = [
  { resource: "View Dashboard", super_admin: true, administrator: true, operator: true, auditor: true },
  { resource: "Run Remediation", super_admin: true, administrator: true, operator: true, auditor: false },
  { resource: "Pause Automation", super_admin: true, administrator: true, operator: false, auditor: false },
  { resource: "Edit Protocol Mappings", super_admin: true, administrator: true, operator: false, auditor: false },
  { resource: "Manage Users", super_admin: true, administrator: true, operator: false, auditor: false },
  { resource: "Create Tickets", super_admin: true, administrator: true, operator: true, auditor: false },
  { resource: "View Audit Logs", super_admin: true, administrator: true, operator: true, auditor: true },
  { resource: "Assign Operators", super_admin: true, administrator: true, operator: false, auditor: false },
  { resource: "Delete/Revoke Access", super_admin: true, administrator: false, operator: false, auditor: false },
  { resource: "System Configuration", super_admin: true, administrator: false, operator: false, auditor: false },
];

function InviteModal({
  open,
  invitedBy,
  onClose,
}: {
  open: boolean;
  invitedBy: string;
  onClose: () => void;
}) {
  const addInvite = useUserStore((s) => s.addInvite);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("operator");
  const [sent, setSent] = useState(false);

  function handleSubmit() {
    if (!email.trim()) return;
    addInvite({
      id: `inv-${Date.now()}`,
      email: email.trim(),
      role,
      invitedBy,
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "pending",
    });
    setSent(true);
  }

  function handleClose() {
    setEmail("");
    setRole("operator");
    setSent(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm">Invite sent</p>
              <p className="text-xs text-muted-foreground mt-1">{email} · expires in 7 days</p>
            </div>
            <Button size="sm" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-1">
              <div className="space-y-1.5">
                <Label className="text-xs">Email address</Label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@company.io"
                  className="w-full h-8 px-3 text-xs rounded-md border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="orange"
                size="sm"
                onClick={handleSubmit}
                disabled={!email.trim()}
              >
                Send Invite
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AccessControlPage() {
  const { team, currentUser, reassignRole, updateUserStatus, pendingInvites, removeInvite } =
    useUserStore();
  const canManage = currentUser.role === "super_admin" || currentUser.role === "administrator";
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  function handleRevoke(userId: string) {
    if (revokingId === userId) {
      updateUserStatus(userId, "suspended");
      setRevokingId(null);
    } else {
      setRevokingId(userId);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div>
          <h1 className="text-lg font-semibold">User & Access Control</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {team.length} members · {pendingInvites.length} pending invite
            {pendingInvites.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canManage && (
          <Button variant="orange" size="sm" onClick={() => setShowInviteModal(true)}>
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Invite User
          </Button>
        )}
      </div>

      <div className="flex flex-1 min-h-0 gap-0 divide-x divide-border/50">
        {/* User table + pending invites */}
        <div className="flex-1 flex flex-col min-w-0">
          <ScrollArea className="flex-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background/95 backdrop-blur-sm">
                <tr className="border-b border-border/50">
                  <th className="py-2.5 px-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    User
                  </th>
                  <th className="py-2.5 px-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Role
                  </th>
                  <th className="py-2.5 px-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Department
                  </th>
                  <th className="py-2.5 px-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Last Active
                  </th>
                  <th className="py-2.5 px-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  {canManage && (
                    <th className="py-2.5 px-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {team.map((user) => (
                  <tr
                    key={user.id}
                    className={cn(
                      "border-b border-border/40 hover:bg-muted/20 transition-colors",
                      user.id === currentUser.id && "bg-orange/5",
                      user.status === "suspended" && "opacity-50"
                    )}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: user.avatarColor }}
                        >
                          {user.avatarInitials}
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.name}
                            {user.id === currentUser.id && (
                              <span className="text-[10px] text-orange ml-1">(you)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {canManage && user.id !== currentUser.id ? (
                        <div className="relative inline-flex items-center">
                          <select
                            value={user.role}
                            onChange={(e) => reassignRole(user.id, e.target.value as UserRole)}
                            className={cn(
                              "appearance-none rounded px-2 py-0.5 text-xs font-medium border pr-6 bg-transparent cursor-pointer",
                              ROLE_COLORS[user.role]
                            )}
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r} value={r}>
                                {ROLE_LABELS[r]}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1 w-3 h-3 pointer-events-none opacity-60" />
                        </div>
                      ) : (
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded border",
                            ROLE_COLORS[user.role]
                          )}
                        >
                          {ROLE_LABELS[user.role]}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {user.department}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : "Never"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          user.status === "active"
                            ? "online"
                            : user.status === "suspended"
                            ? "offline"
                            : "medium"
                        }
                      >
                        {user.status}
                      </Badge>
                    </td>
                    {canManage && (
                      <td className="py-3 px-4">
                        {user.id !== currentUser.id && user.status !== "suspended" && (
                          <div className="flex items-center gap-1.5">
                            {revokingId === user.id ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  onClick={() => handleRevoke(user.id)}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs text-muted-foreground"
                                  onClick={() => setRevokingId(null)}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-muted-foreground hover:text-destructive"
                                onClick={() => handleRevoke(user.id)}
                              >
                                Revoke
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pending invites */}
            {pendingInvites.filter((i) => i.status === "pending").length > 0 && (
              <div className="px-4 py-3 border-t border-border/50">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Pending Invites
                </p>
                <div className="space-y-1.5">
                  {pendingInvites
                    .filter((i) => i.status === "pending")
                    .map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between rounded-md border border-border/50 bg-muted/20 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{inv.email}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {ROLE_LABELS[inv.role]} · invited by {inv.invitedBy} ·{" "}
                            <span className="text-amber-400">
                              expires {formatDate(inv.expiresAt)}
                            </span>
                          </p>
                        </div>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-muted-foreground hover:text-destructive"
                            onClick={() => removeInvite(inv.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Permissions matrix */}
        <div className="w-72 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Permissions Matrix</span>
            </div>
          </div>
          <ScrollArea className="flex-1 px-4 py-2">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-1.5 text-muted-foreground font-medium">Resource</th>
                  <th className="text-center py-1.5 text-muted-foreground">SA</th>
                  <th className="text-center py-1.5 text-muted-foreground">AD</th>
                  <th className="text-center py-1.5 text-muted-foreground">OP</th>
                  <th className="text-center py-1.5 text-muted-foreground">AU</th>
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((perm) => (
                  <tr key={perm.resource} className="border-t border-border/30">
                    <td className="py-1.5 text-muted-foreground leading-tight">{perm.resource}</td>
                    {(["super_admin", "administrator", "operator", "auditor"] as UserRole[]).map(
                      (role) => (
                        <td key={role} className="text-center py-1.5">
                          <span
                            className={cn(
                              "text-sm",
                              perm[role] ? "text-green-500" : "text-slate-600"
                            )}
                          >
                            {perm[role] ? "✓" : "·"}
                          </span>
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </div>

      <InviteModal
        open={showInviteModal}
        invitedBy={currentUser.name}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  );
}
