import { useState } from "react";
import { protocolMappings } from "@/data/protocolMappings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/cn";
import { Search, Plus, Save, RotateCcw } from "lucide-react";
import type { MappingEntry, VendorScheme } from "@/types/protocol";

const VENDORS: VendorScheme[] = ["ABB", "ChargePoint", "EVBOX", "Blink", "Wallbox", "Delta", "Tritium", "BTC"];

export function ProtocolAdminPage() {
  const [mappings, setMappings] = useState<MappingEntry[]>(protocolMappings);
  const [search, setSearch] = useState("");
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());

  const filtered = mappings.filter(
    (m) =>
      m.quantevKey.toLowerCase().includes(search.toLowerCase()) ||
      m.ocppReference.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id: string, field: keyof MappingEntry | `vendor.${VendorScheme}`, value: string) => {
    setMappings((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        if (field.startsWith("vendor.")) {
          const vendor = field.split(".")[1] as VendorScheme;
          return { ...m, vendorMappings: { ...m.vendorMappings, [vendor]: value }, isDirty: true };
        }
        return { ...m, [field]: value, isDirty: true };
      })
    );
    setDirtyIds((prev) => new Set(prev).add(id));
  };

  const handleSave = () => {
    setMappings((prev) => prev.map((m) => ({ ...m, isDirty: false })));
    setDirtyIds(new Set());
  };

  const handleDiscard = () => {
    setMappings(protocolMappings);
    setDirtyIds(new Set());
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div>
          <h1 className="text-lg font-semibold">Protocol Translation Admin</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {mappings.length} parameter mappings · {dirtyIds.size > 0 ? (
              <span className="text-amber-400">{dirtyIds.size} unsaved change{dirtyIds.size > 1 ? "s" : ""}</span>
            ) : (
              <span className="text-green-400">All saved</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search mappings…"
              className="h-8 pl-8 w-52 text-xs"
            />
          </div>
          <Button variant="outline" size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Mapping
          </Button>
          {dirtyIds.size > 0 && (
            <>
              <Button variant="ghost" size="sm" onClick={handleDiscard}>
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Discard
              </Button>
              <Button variant="orange" size="sm" onClick={handleSave}>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save {dirtyIds.size} Change{dirtyIds.size > 1 ? "s" : ""}
              </Button>
            </>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="min-w-max">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
              <tr className="border-b border-border/50">
                <th className="py-2.5 px-3 text-left font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Quantev Key</th>
                <th className="py-2.5 px-3 text-left font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">OCPP Reference</th>
                <th className="py-2.5 px-3 text-left font-semibold text-muted-foreground uppercase tracking-wide">Category</th>
                <th className="py-2.5 px-3 text-left font-semibold text-muted-foreground uppercase tracking-wide">Default</th>
                {VENDORS.map((v) => (
                  <th key={v} className="py-2.5 px-3 text-left font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{v}</th>
                ))}
                <th className="py-2.5 px-3 text-left font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((mapping) => (
                <tr
                  key={mapping.id}
                  className={cn(
                    "border-b border-border/40 hover:bg-muted/20 transition-colors",
                    dirtyIds.has(mapping.id) && "bg-amber-500/5"
                  )}
                >
                  <td className="py-2 px-3 font-mono text-blue-400 font-medium whitespace-nowrap">{mapping.quantevKey}</td>
                  <td className="py-2 px-3 font-mono text-slate-400 whitespace-nowrap">{mapping.ocppReference}</td>
                  <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">{mapping.category}</td>
                  <td className="py-2 px-3 font-mono">{mapping.defaultValue}</td>
                  {VENDORS.map((vendor) => (
                    <td key={vendor} className="py-2 px-3">
                      <input
                        value={mapping.vendorMappings[vendor] ?? "—"}
                        onChange={(e) => handleEdit(mapping.id, `vendor.${vendor}` as `vendor.${VendorScheme}`, e.target.value)}
                        className="w-full bg-transparent text-xs rounded px-1 py-0.5 border border-transparent hover:border-border focus:border-ring focus:outline-none focus:bg-muted/50 font-mono"
                      />
                    </td>
                  ))}
                  <td className="py-2 px-3">
                    {dirtyIds.has(mapping.id) ? (
                      <Badge variant="medium">Modified</Badge>
                    ) : mapping.isRequired ? (
                      <Badge variant="info">Required</Badge>
                    ) : (
                      <span className="text-muted-foreground">Optional</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
}
