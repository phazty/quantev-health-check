export type UserRole = "super_admin" | "administrator" | "operator" | "auditor";

export type UserStatus = "active" | "inactive" | "pending" | "suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarInitials: string;
  avatarColor: string;
  department: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  assignedSites: string[];
}

export interface Invite {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: "pending" | "accepted" | "expired";
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  administrator: "Administrator",
  operator: "Operator",
  auditor: "Read-Only Auditor",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: "text-orange-500 bg-orange-500/10",
  administrator: "text-purple-400 bg-purple-400/10",
  operator: "text-blue-400 bg-blue-400/10",
  auditor: "text-slate-400 bg-slate-400/10",
};
