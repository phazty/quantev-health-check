import { useEffect, useRef, useState, memo } from "react";
import { cn } from "@/utils/cn";

interface LiveCellProps {
  value: number;
  format: (v: number) => string;
  threshold?: number;
  emptyDisplay?: string;
  className?: string;
}

export const LiveCell = memo(function LiveCell({
  value,
  format,
  threshold = 0.05,
  emptyDisplay = "—",
  className,
}: LiveCellProps) {
  const [isFlashing, setIsFlashing] = useState(false);
  const prevRef = useRef(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (Math.abs(prevRef.current - value) > threshold) {
      prevRef.current = value;
      setIsFlashing(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setIsFlashing(false), 700);
    }
    return () => clearTimeout(timerRef.current);
  }, [value, threshold]);

  if (value === 0) {
    return <span className={cn("text-muted-foreground text-xs", className)}>{emptyDisplay}</span>;
  }

  return (
    <span
      className={cn(
        "font-mono text-xs tabular-nums transition-colors duration-150",
        isFlashing ? "text-orange font-semibold" : "text-foreground",
        className
      )}
    >
      {format(value)}
    </span>
  );
});
