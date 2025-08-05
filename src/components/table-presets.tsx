"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { 
  Layout, 
  Eye, 
  BarChart3, 
  FileText, 
  Settings,
  ChevronDown
} from "lucide-react"
import { TableColumn } from "./table-column-settings"
import { MATERIALS_TABLE_PRESETS } from "@/hooks/use-materials-table-columns"

export type TablePreset = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  columns: string[] // IDs столбцов, которые должны быть видимы
}

// Предустановленные конфигурации столбцов - конвертируем из нового формата
export const TABLE_PRESETS: TablePreset[] = Object.entries(MATERIALS_TABLE_PRESETS).map(([id, preset]) => ({
  id,
  name: preset.name,
  description: `${preset.columns.length} столбцов`,
  icon: id === 'default' ? <Layout className="h-4 w-4" /> :
        id === 'minimal' ? <Eye className="h-4 w-4" /> :
        id === 'detailed' ? <FileText className="h-4 w-4" /> :
        id === 'inventory' ? <BarChart3 className="h-4 w-4" /> :
        <Settings className="h-4 w-4" />,
  columns: preset.columns
}));

interface TablePresetsProps {
  columns: TableColumn[]
  onApplyPreset: (presetId: string) => void
  className?: string
}

export function TablePresets({ 
  columns, 
  onApplyPreset, 
  className 
}: TablePresetsProps) {
  
  // Определяем текущий пресет
  const getCurrentPreset = () => {
    const visibleColumnIds = columns
      .filter(col => col.visible)
      .map(col => col.id)
      .sort()
    
    const matchingPreset = TABLE_PRESETS.find(preset => {
      const presetColumns = preset.columns.sort()
      return (
        visibleColumnIds.length === presetColumns.length &&
        visibleColumnIds.every((id, index) => id === presetColumns[index])
      )
    })
    
    return matchingPreset
  }

  const currentPreset = getCurrentPreset()

  const handlePresetApply = (presetId: string) => {
    onApplyPreset(presetId)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={className}
        >
          {currentPreset ? (
            <>
              {currentPreset.icon}
              <span className="ml-2">{currentPreset.name}</span>
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              <span className="ml-2">Пользовательский</span>
            </>
          )}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs font-medium text-gray-500">
          Быстрые настройки
        </DropdownMenuLabel>
        
        {TABLE_PRESETS.map((preset) => (
          <DropdownMenuItem
            key={preset.id}
            onClick={() => handlePresetApply(preset.id)}
            className="flex items-start gap-3 py-3 cursor-pointer"
          >
            <div className="flex-shrink-0 mt-0.5">
              {preset.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{preset.name}</span>
                {currentPreset?.id === preset.id && (
                  <Badge variant="default" className="text-xs">
                    Активный
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-1">
                {preset.description}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>{preset.columns.length} столбцов</span>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem disabled className="text-xs text-gray-500 py-2">
          {currentPreset 
            ? `Применен пресет: ${currentPreset.name}`
            : 'Пользовательская конфигурация'
          }
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
