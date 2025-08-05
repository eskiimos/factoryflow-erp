"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { 
  Layout, 
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/context/language-context"
import { WORK_TYPES_TABLE_PRESETS } from "@/hooks/use-work-types-table-columns"
import { TableColumn } from "@/components/table-column-settings"

interface WorkTypesTablePresetsProps {
  columns: TableColumn[]
  onApplyPreset: (presetId: string) => void
  className?: string
}

export function WorkTypesTablePresets({ 
  columns, 
  onApplyPreset, 
  className 
}: WorkTypesTablePresetsProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  // Определяем текущий пресет
  const getCurrentPreset = () => {
    const visibleColumns = columns.filter(col => col.visible).map(col => col.id)
    
    for (const [presetId, preset] of Object.entries(WORK_TYPES_TABLE_PRESETS)) {
      if (JSON.stringify(preset.columns.sort()) === JSON.stringify(visibleColumns.sort())) {
        return presetId
      }
    }
    return null
  }

  const currentPreset = getCurrentPreset()

  const handlePresetClick = (presetId: string) => {
    onApplyPreset(presetId)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 gap-2 text-sm",
            className
          )}
        >
          <Layout className="h-4 w-4" />
          Пресеты
          {currentPreset && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {WORK_TYPES_TABLE_PRESETS[currentPreset as keyof typeof WORK_TYPES_TABLE_PRESETS].name}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <div className="space-y-2">
          <div className="pb-2 mb-2 border-b">
            <h4 className="font-medium text-sm">Пресеты отображения</h4>
            <p className="text-xs text-gray-600">Выберите набор столбцов</p>
          </div>
          
          {Object.entries(WORK_TYPES_TABLE_PRESETS).map(([presetId, preset]) => (
            <Button
              key={presetId}
              variant={currentPreset === presetId ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start gap-2 h-auto py-2"
              onClick={() => handlePresetClick(presetId)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {currentPreset === presetId && (
                    <Check className="h-4 w-4" />
                  )}
                  <div className="text-left">
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-gray-500">
                      {preset.columns.length} столбцов
                    </div>
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
