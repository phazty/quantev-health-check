import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number;
  formatFn?: (v: number) => string;
}

export function AnimatedCounter({ value, className, duration = 500, formatFn }: AnimatedCounterProps) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = value;

    if (from === to) return;

    const start = performance.now();

    function frame(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(from + (to - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const text = formatFn ? formatFn(displayed) : String(displayed);
  return <span className={cn("tabular-nums", className)}>{text}</span>;
}
