import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Zap,
  Network,
  Shield,
  Activity,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  description: string;
  path: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Network Health",
    description: "Live telemetry exceptions and device status",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "automation",
    label: "Automation Pipeline",
    description: "Active remediation queue and command orchestration",
    path: "/automation",
    icon: Zap,
  },
  {
    id: "protocol",
    label: "Protocol Admin",
    description: "OCPP parameter mapping management",
    path: "/protocol",
    icon: Network,
  },
  {
    id: "access",
    label: "Access Control",
    description: "User roles, permissions, and audit trail",
    path: "/access",
    icon: Shield,
  },
  {
    id: "observability",
    label: "Observability",
    description: "Event stream, command logs, and timeline",
    path: "/observability",
    icon: Activity,
  },
];
