"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "1x1" | "2x1" | "2x2" | "1x2"
  children: React.ReactNode
}

const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, size = "1x1", children, ...props }, ref) => {
    const getSizeClasses = () => {
      switch (size) {
        case "1x1":
          return "col-span-1 row-span-1"
        case "2x1":
          return "col-span-2 row-span-1"
        case "2x2":
          return "col-span-2 row-span-2"
        case "1x2":
          return "col-span-1 row-span-2"
        default:
          return "col-span-1 row-span-1"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-gray-200 bg-white p-6 shadow-lg/10 transition-all hover:shadow-lg/20 animate-in fade-in-0 slide-in-from-bottom-5 duration-300",
          getSizeClasses(),
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
BentoCard.displayName = "BentoCard"

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
BentoGrid.displayName = "BentoGrid"

export { BentoCard, BentoGrid }
