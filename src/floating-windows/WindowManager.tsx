import { useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useUIStore } from "@/stores/uiStore";
import { DiagnosticWindow } from "./DiagnosticWindow";

export function WindowManager() {
  const openWindows = useUIStore((s) => s.openWindows);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[30]">
      <AnimatePresence>
        {openWindows.map((win) => (
          <DiagnosticWindow key={win.id} win={win} constraintsRef={containerRef} />
        ))}
      </AnimatePresence>
    </div>
  );
}
