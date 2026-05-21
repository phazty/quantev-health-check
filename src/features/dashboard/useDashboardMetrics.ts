import { useMemo } from "react";
import { useChargerStore } from "@/stores/chargerStore";
import { useAutomationStore } from "@/stores/automationStore";
import { useUIStore } from "@/stores/uiStore";

export interface DashboardMetrics {
  total: number;
  online: number;
  exceptions: number;
  stale: number;
  inRemediation: number;
  failedFixes: number;
  successRate: number;
}

export function useDashboardMetrics(): DashboardMetrics {
  const chargers = useChargerStore((s) => s.chargers);
  const telemetry = useChargerStore((s) => s.telemetry);
  const activeLane = useAutomationStore((s) => s.activeLane);
  const interventionLane = useAutomationStore((s) => s.interventionLane);
  const activeSiteFilter = useUIStore((s) => s.activeSiteFilter);

  return useMemo(() => {
    const all = Object.values(chargers);
    const filtered = activeSiteFilter ? all.filter((c) => c.siteId === activeSiteFilter) : all;

    const exceptions = filtered.filter(
      (c) =>
        c.loadSharingFault ||
        c.status === "faulted" ||
        c.status === "offline" ||
        (telemetry[c.id]?.configDrift?.some((p) => p.drift) ?? false)
    );

    return {
      total: filtered.length,
      online: filtered.filter((c) => c.status === "online").length,
      exceptions: exceptions.length,
      stale: filtered.filter((c) => telemetry[c.id]?.isStale).length,
      inRemediation: activeLane.filter((i) => !activeSiteFilter || i.siteId === activeSiteFilter)
        .length,
      failedFixes: interventionLane.filter(
        (i) => !activeSiteFilter || i.siteId === activeSiteFilter
      ).length,
      successRate: 82,
    };
  }, [chargers, telemetry, activeLane, interventionLane, activeSiteFilter]);
}
