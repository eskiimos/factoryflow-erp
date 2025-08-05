"use client"

import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface InfoIconProps {
  content: string
  className?: string
}

export function InfoIcon({ content, className = "" }: InfoIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors ${className}`}>
          <Info className="h-3 w-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  )
}
