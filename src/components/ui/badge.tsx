import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        critical: "border-red-500/30 bg-red-500/15 text-red-400",
        high: "border-orange-500/30 bg-orange-500/15 text-orange-400",
        medium: "border-amber-500/30 bg-amber-500/15 text-amber-400",
        low: "border-green-500/30 bg-green-500/15 text-green-400",
        info: "border-blue-500/30 bg-blue-500/15 text-blue-400",
        online: "border-green-500/30 bg-green-500/15 text-green-400",
        offline: "border-slate-500/30 bg-slate-500/15 text-slate-400",
        faulted: "border-red-500/30 bg-red-500/15 text-red-400",
        suspended: "border-amber-500/30 bg-amber-500/15 text-amber-400",
        unavailable: "border-slate-600/30 bg-slate-600/15 text-slate-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
