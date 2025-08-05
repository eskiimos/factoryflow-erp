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
  Settings, 
  Eye, 
  EyeOff, 
  RotateCcw,
  GripVertical
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/context/language-context"

export type TableColumn = {
  id: string
  label: string
  visible: boolean
  required?: boolean // Обязательные столбцы нельзя скрыть
  width?: string
  order: number
}

interface TableColumnSettingsProps {
  columns: TableColumn[]
  onColumnsChange: (columns: TableColumn[]) => void
  className?: string
}

export function TableColumnSettings({ 
  columns, 
  onColumnsChange, 
  className 
}: TableColumnSettingsProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null)

  // Подсчет видимых столбцов
  const visibleCount = columns.filter(col => col.visible).length
  const totalCount = columns.length

  // Сброс к настройкам по умолчанию
  const resetToDefault = () => {
    const defaultColumns = columns.map(col => ({
      ...col,
      visible: true,
      order: col.order
    }))
    onColumnsChange(defaultColumns)
  }

  // Переключение видимости столбца
  const toggleColumn = (columnId: string) => {
    const updatedColumns = columns.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    )
    onColumnsChange(updatedColumns)
  }

  // Показать все столбцы
  const showAllColumns = () => {
    const updatedColumns = columns.map(col => ({ ...col, visible: true }))
    onColumnsChange(updatedColumns)
  }

  // Скрыть все необязательные столбцы
  const hideOptionalColumns = () => {
    const updatedColumns = columns.map(col => ({
      ...col,
      visible: col.required || false
    }))
    onColumnsChange(updatedColumns)
  }

  // Drag and drop для изменения порядка столбцов
  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumn(columnId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()
    
    if (!draggedColumn || draggedColumn === targetColumnId) return

    const draggedIndex = columns.findIndex(col => col.id === draggedColumn)
    const targetIndex = columns.findIndex(col => col.id === targetColumnId)

    const newColumns = [...columns]
    const draggedItem = newColumns[draggedIndex]
    
    // Удаляем элемент из старой позиции
    newColumns.splice(draggedIndex, 1)
    // Вставляем в новую позицию
    newColumns.splice(targetIndex, 0, draggedItem)
    
    // Обновляем порядок
    const updatedColumns = newColumns.map((col, index) => ({
      ...col,
      order: index
    }))

    onColumnsChange(updatedColumns)
    setDraggedColumn(null)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
        >
          <Settings className="h-4 w-4" />
          Столбцы
          <Badge variant="secondary" className="text-xs">
            {visibleCount}/{totalCount}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4" 
        align="end"
        sideOffset={5}
      >
        <div className="space-y-4">
          {/* Заголовок */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Настройка столбцов</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefault}
              className="h-8 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Сбросить
            </Button>
          </div>

          {/* Быстрые действия */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={showAllColumns}
              className="flex-1 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Показать все
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={hideOptionalColumns}
              className="flex-1 text-xs"
            >
              <EyeOff className="h-3 w-3 mr-1" />
              Только основные
            </Button>
          </div>

          {/* Список столбцов */}
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {columns
              .sort((a, b) => a.order - b.order)
              .map((column) => (
                <div
                  key={column.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md border border-transparent hover:border-gray-200 transition-colors",
                    draggedColumn === column.id && "opacity-50"
                  )}
                  draggable
                  onDragStart={(e) => handleDragStart(e, column.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <GripVertical className="h-3 w-3 text-gray-400 cursor-move" />
                    <span className="text-sm font-medium">
                      {column.label}
                    </span>
                    {column.required && (
                      <Badge variant="secondary" className="text-xs">
                        Обязательный
                      </Badge>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleColumn(column.id)}
                    disabled={column.required}
                    className={cn(
                      "h-8 w-8 p-0",
                      column.visible 
                        ? "text-blue-600 hover:text-blue-700" 
                        : "text-gray-400 hover:text-gray-500"
                    )}
                  >
                    {column.visible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
          </div>

          {/* Информация */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">💡 Советы:</span>
            </div>
            <ul className="space-y-1 pl-2">
              <li>• Перетащите столбцы для изменения порядка</li>
              <li>• Обязательные столбцы нельзя скрыть</li>
              <li>• Настройки сохраняются автоматически</li>
            </ul>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
