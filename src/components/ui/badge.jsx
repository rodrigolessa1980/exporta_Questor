import * as React from "react"
import { cn } from "../../lib/utils"

const badgeVariants = {
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  },
  size: {
    default: "h-6 px-2.5 py-0.5 text-xs",
    sm: "h-5 px-1.5 py-0 text-xs",
    lg: "h-7 px-3 py-1 text-sm",
  },
}

const Badge = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      badgeVariants.variant[variant],
      badgeVariants.size[size],
      className
    )}
    {...props}
  />
))
Badge.displayName = "Badge"

export { Badge, badgeVariants }
