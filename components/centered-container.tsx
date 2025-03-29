import type React from "react"
import { cn } from "@/lib/utils"

interface CenteredContainerProps {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
}

export function CenteredContainer({ children, className, as: Component = "div" }: CenteredContainerProps) {
  return (
    <Component className={cn("w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8", className)}>{children}</Component>
  )
}

