"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronDown, 
  Copy, 
  Percent, 
  Trash2, 
  Building2,
  X,
  DollarSign,
  ToggleLeft,
  ToggleRight
} from "lucide-react"
import { useLanguage } from "@/context/language-context"

interface WorkTypeBulkActionsBarProps {
  selectedItems: string[]
  onClearSelection: () => void
  onBulkAction: (action: string, params?: any) => void
}

export function WorkTypeBulkActionsBar({ 
  selectedItems, 
  onClearSelection, 
  onBulkAction
}: WorkTypeBulkActionsBarProps) {
  const { t } = useLanguage()
  const [isProcessing, setIsProcessing] = useState(false)

  const shouldShow = selectedItems.length > 0

  if (!shouldShow) {
    return null
  }

  const handleAction = async (action: string, params?: any) => {
    setIsProcessing(true)
    try {
      await onBulkAction(action, params)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 flex items-center gap-4 min-w-[400px]">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {selectedItems.length} выбрано
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Copy Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isProcessing}>
                <Copy className="h-4 w-4 mr-2" />
                Копировать
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleAction('copy_simple')}>
                <Copy className="h-4 w-4 mr-2" />
                Простое копирование
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('copy_to_department')}>
                <Building2 className="h-4 w-4 mr-2" />
                Копировать в другой отдел
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('copy_with_changes')}>
                <Percent className="h-4 w-4 mr-2" />
                Копировать с изменениями
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Rate Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isProcessing}>
                <DollarSign className="h-4 w-4 mr-2" />
                Тарифы
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleAction('increase_rate_percent')}>
                <Percent className="h-4 w-4 mr-2" />
                Увеличить на %
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('decrease_rate_percent')}>
                <Percent className="h-4 w-4 mr-2" />
                Уменьшить на %
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('set_fixed_rate')}>
                <DollarSign className="h-4 w-4 mr-2" />
                Установить фиксированную ставку
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isProcessing}>
                <ToggleLeft className="h-4 w-4 mr-2" />
                Статус
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleAction('activate')}>
                <ToggleRight className="h-4 w-4 mr-2" />
                Активировать
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('deactivate')}>
                <ToggleLeft className="h-4 w-4 mr-2" />
                Деактивировать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAction('change_department')}>
                <Building2 className="h-4 w-4 mr-2" />
                Сменить отдел
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Delete Action */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleAction('delete_soft')}
            disabled={isProcessing}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Удалить
          </Button>
        </div>
      </div>
    </div>
  )
}
