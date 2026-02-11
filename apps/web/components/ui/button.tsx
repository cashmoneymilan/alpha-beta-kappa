import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Hybrid style: indigo primary with medium rounding
        default:
          "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-500 active:bg-red-700",
        outline:
          "border border-zinc-700 bg-transparent shadow-sm hover:bg-zinc-800 hover:text-zinc-100",
        secondary:
          "bg-zinc-800 text-zinc-100 shadow-sm hover:bg-zinc-700",
        ghost: "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100",
        link: "text-indigo-400 underline-offset-4 hover:underline",
        // Trading-specific variants - Hybrid style
        buy: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700",
        sell: "bg-red-600 text-white shadow-sm hover:bg-red-500 active:bg-red-700",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
