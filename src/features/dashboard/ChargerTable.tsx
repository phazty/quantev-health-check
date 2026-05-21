import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { useChargerStore } from "@/stores/chargerStore";
import { useUIStore } from "@/stores/uiStore";
import { LiveCell } from "@/components/primitives/LiveCell";
import { SeverityBadge } from "@/components/primitives/SeverityBadge";
import { StatusPulse } from "@/components/primitives/StatusPulse";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/cn";
import { formatRelativeTime, formatPower, formatTemperature } from "@/utils/formatters";
import { SEVERITY_ORDER, maxSeverity } from "@/utils/severity";
import { ExternalLink, ArrowUp, ArrowDown, ChevronsUpDown, Search, SlidersHorizontal } from "lucide-react";
import type { Severity, ChargerStatus } from "@/types/charger";

interface ChargerRow {
  id: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  firmwareVersion: string;
  ocppVersion: string;
  status: ChargerStatus;
  siteName: string;
  severity: Severity | null;
  driftCount: number;
  power: number;
  temperature: number;
  isStale: boolean;
  lastSeen: Date;
  loadSharingFault: boolean;
}

const columnHelper = createColumnHelper<ChargerRow>();

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (!sorted) return <ChevronsUpDown className="w-3 h-3 ml-1 opacity-40" />;
  if (sorted === "asc") return <ArrowUp className="w-3 h-3 ml-1 text-orange" />;
  return <ArrowDown className="w-3 h-3 ml-1 text-orange" />;
}

export function ChargerTable() {
  const chargers = useChargerStore((s) => s.chargers);
  const telemetry = useChargerStore((s) => s.telemetry);
  const sites = useChargerStore((s) => s.sites);
  const activeSiteFilter = useUIStore((s) => s.activeSiteFilter);
  const openWindow = useUIStore((s) => s.openWindow);

  const [sorting, setSorting] = useState<SortingState>([{ id: "severity", desc: false }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const rows = useMemo<ChargerRow[]>(() => {
    const all = Object.values(chargers);
    const scoped = activeSiteFilter ? all.filter((c) => c.siteId === activeSiteFilter) : all;

    return scoped.map((c) => {
      const t = telemetry[c.id];
      const driftParams = t?.configDrift?.filter((p) => p.drift) ?? [];
      const faultSeverities: Severity[] = [];
      if (c.loadSharingFault) faultSeverities.push("critical");
      if (c.status === "faulted") faultSeverities.push("high");
      if (c.status === "offline") faultSeverities.push("high");
      driftParams.forEach((p) => faultSeverities.push(p.severity));

      return {
        id: c.id,
        serialNumber: c.serialNumber,
        manufacturer: c.manufacturer,
        model: c.model,
        firmwareVersion: c.firmwareVersion,
        ocppVersion: c.ocppVersion,
        status: c.status,
        siteName: sites[c.siteId]?.name ?? c.siteId,
        severity: faultSeverities.length > 0 ? maxSeverity(faultSeverities) : null,
        driftCount: driftParams.length,
        power: t?.power ?? 0,
        temperature: t?.temperature ?? 0,
        isStale: t?.isStale ?? false,
        lastSeen: t?.timestamp ?? c.lastSeen,
        loadSharingFault: c.loadSharingFault,
      };
    });
  }, [chargers, telemetry, sites, activeSiteFilter]);

  const filteredRows = useMemo(() => {
    const q = globalFilter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.serialNumber.toLowerCase().includes(q) ||
        r.manufacturer.toLowerCase().includes(q) ||
        r.model.toLowerCase().includes(q) ||
        r.siteName.toLowerCase().includes(q)
    );
  }, [rows, globalFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("serialNumber", {
        header: "Serial",
        cell: (info) => (
          <span className="font-mono text-xs text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: "device",
        header: "Device",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-tight">
              {row.original.manufacturer} {row.original.model}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {row.original.firmwareVersion} · OCPP {row.original.ocppVersion}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const s = info.getValue();
          return (
            <Badge
              variant={
                s === "online"
                  ? "online"
                  : s === "faulted"
                  ? "faulted"
                  : s === "offline"
                  ? "offline"
                  : "unavailable"
              }
            >
              {s}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("severity", {
        header: "Severity",
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.severity != null ? SEVERITY_ORDER[rowA.original.severity] : 99;
          const b = rowB.original.severity != null ? SEVERITY_ORDER[rowB.original.severity] : 99;
          return a - b;
        },
        cell: (info) => {
          const sev = info.getValue();
          return sev ? (
            <SeverityBadge severity={sev} />
          ) : (
            <span className="text-xs text-green-500">Clean</span>
          );
        },
      }),
      columnHelper.accessor("power", {
        header: "Power",
        cell: (info) => <LiveCell value={info.getValue()} format={formatPower} />,
      }),
      columnHelper.accessor("temperature", {
        header: "Temp",
        cell: (info) => (
          <LiveCell value={info.getValue()} format={formatTemperature} threshold={0.3} />
        ),
      }),
      columnHelper.accessor("driftCount", {
        header: "Config Drift",
        cell: (info) => {
          const count = info.getValue();
          return count > 0 ? (
            <span className="text-xs text-amber-400 font-medium">
              {count} param{count > 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          );
        },
      }),
      columnHelper.accessor("lastSeen", {
        header: "Last Seen",
        sortingFn: (rowA, rowB) =>
          rowA.original.lastSeen.getTime() - rowB.original.lastSeen.getTime(),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <StatusPulse status={row.original.isStale ? "warning" : "connected"} size="sm" />
            <span
              className={cn(
                "text-xs",
                row.original.isStale ? "text-amber-400" : "text-muted-foreground"
              )}
            >
              {formatRelativeTime(row.original.lastSeen)}
            </span>
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 h-7 text-xs"
            onClick={() => openWindow(row.original.id)}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Inspect
          </Button>
        ),
      }),
    ],
    [openWindow]
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Filter devices…"
              className="h-7 pl-8 pr-3 text-xs rounded-md border border-input bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring w-52"
            />
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
            Filters
          </Button>
        </div>
        <span className="text-xs text-muted-foreground">
          {filteredRows.length} device{filteredRows.length !== 1 ? "s" : ""}
        </span>
      </div>

      <ScrollArea className="flex-1">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <tr className="border-b border-border/50">
              {table.getFlatHeaders().map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={cn(
                    "py-2.5 px-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap",
                    header.column.getCanSort() &&
                      "cursor-pointer select-none hover:text-foreground transition-colors"
                  )}
                >
                  <div className="flex items-center">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <SortIcon sorted={header.column.getIsSorted()} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={table.getFlatHeaders().length}
                  className="py-14 text-center text-sm text-muted-foreground"
                >
                  {globalFilter
                    ? `No devices match "${globalFilter}"`
                    : "No devices in this view"}
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-border/50 hover:bg-muted/30 transition-colors group",
                  row.original.loadSharingFault &&
                    "border-l-2 border-l-red-500 bg-red-500/[0.03]",
                  row.original.status === "faulted" &&
                    !row.original.loadSharingFault &&
                    "border-l-2 border-l-orange-500"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-2.5 px-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}
