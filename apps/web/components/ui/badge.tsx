import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-indigo-600 text-white shadow-sm",
        secondary:
          "border-transparent bg-zinc-800 text-zinc-300",
        destructive:
          "border-transparent bg-red-600 text-white shadow-sm",
        outline: "text-zinc-100 border-zinc-700",
        // Hybrid style trading variants - 15% opacity backgrounds
        bullish:
          "border-transparent bg-emerald-500/15 text-emerald-400",
        bearish:
          "border-transparent bg-red-500/15 text-red-400",
        neutral:
          "border-transparent bg-zinc-800/50 text-zinc-400",
        pending:
          "border-transparent bg-amber-500/15 text-amber-400",
        filled:
          "border-transparent bg-indigo-500/15 text-indigo-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
