import { useChargerStore } from "@/stores/chargerStore";
import { useUIStore } from "@/stores/uiStore";
import { DashboardScorecards } from "@/features/dashboard/DashboardScorecards";
import { ChargerTable } from "@/features/dashboard/ChargerTable";
import { StatusPulse } from "@/components/primitives/StatusPulse";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { RefreshCw } from "lucide-react";

function SiteSelector() {
  const sites = useChargerStore((s) => s.sites);
  const activeSiteFilter = useUIStore((s) => s.activeSiteFilter);
  const setActiveSiteFilter = useUIStore((s) => s.setActiveSiteFilter);

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => setActiveSiteFilter(null)}
        className={cn(
          "flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors text-left",
          activeSiteFilter === null
            ? "bg-orange/10 text-orange border border-orange/20"
            : "text-slate-400 hover:bg-muted hover:text-foreground"
        )}
      >
        <span className="font-medium">All Sites</span>
        <Badge variant="secondary" className="text-xs">
          {Object.keys(sites).length}
        </Badge>
      </button>
      {Object.values(sites).map((site) => (
        <button
          key={site.id}
          onClick={() => setActiveSiteFilter(site.id)}
          className={cn(
            "flex flex-col px-3 py-2.5 rounded-md text-sm transition-colors text-left",
            activeSiteFilter === site.id
              ? "bg-orange/10 text-orange border border-orange/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-muted hover:text-foreground"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <span className="font-medium truncate">{site.name}</span>
            <span className="text-xs text-muted-foreground flex-shrink-0 ml-1">
              {site.onlineCount}/{site.chargerCount}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {site.city}, {site.state}
          </span>
        </button>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const sites = useChargerStore((s) => s.sites);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div>
          <h1 className="text-lg font-semibold">Network Health Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live telemetry exceptions across {Object.keys(sites).length} sites
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPulse status="active" size="sm" showLabel label="Live" />
          <Button variant="outline" size="sm">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh All
          </Button>
        </div>
      </div>

      <DashboardScorecards />

      <div className="flex flex-1 min-h-0 divide-x divide-border/50">
        <div className="w-52 flex-shrink-0 py-3 px-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-2">
            Sites
          </p>
          <SiteSelector />
        </div>
        <ChargerTable />
      </div>
    </div>
  );
}
