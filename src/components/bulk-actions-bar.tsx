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
  FolderOpen,
  X
} from "lucide-react"
import { useLanguage } from "@/context/language-context"

interface BulkActionsBarProps {
  selectedItems: string[]
  onClearSelection: () => void
  onBulkAction: (action: string, params?: any) => void
}

export function BulkActionsBar({ 
  selectedItems, 
  onClearSelection, 
  onBulkAction
}: BulkActionsBarProps) {
  const { t } = useLanguage()
  const [isProcessing, setIsProcessing] = useState(false)

  // Показываем панель если есть выделенные элементы ИЛИ включен групповой режим
  const shouldShow = selectedItems.length > 0

  if (!shouldShow) {
    return null
  }

  const handleAction = async (action: string, params?: any) => {
    setIsProcessing(true)
    try {
      // Передаем параметры действия
      await onBulkAction(action, params)
    } finally {
      setIsProcessing(false)
    }
  }

  const getActionDescription = () => {
    return `${t.bulkActions.selected}: ${selectedItems.length}`
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center gap-4 min-w-max">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {getActionDescription()}
          </Badge>
          

        </div>

        <div className="flex items-center gap-2">
          {/* Действия с ценами */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isProcessing}>
                <Percent className="h-4 w-4 mr-2" />
                {t.bulkActions.priceActions}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleAction('increase_price_percent')}>
                📈 {t.bulkActions.increasePricePercent}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('decrease_price_percent')}>
                📉 {t.bulkActions.decreasePricePercent}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAction('update_currency_usd_rub')}>
                💱 {t.bulkActions.convertToRub}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('update_currency_rub_usd')}>
                💰 {t.bulkActions.convertToUsd}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Копирование */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isProcessing}>
                <Copy className="h-4 w-4 mr-2" />
                {t.bulkActions.copyActions}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleAction('copy_simple')}>
                📋 {t.bulkActions.copySimple}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('copy_to_category')}>
                📁 {t.bulkActions.copyToCategory}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('copy_with_changes')}>
                ✏️ {t.bulkActions.copyWithChanges}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Другие действия */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isProcessing}>
                <FolderOpen className="h-4 w-4 mr-2" />
                {t.bulkActions.otherActions}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleAction('change_category')}>
                📂 {t.bulkActions.changeCategory}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('export_selected')}>
                📤 {t.bulkActions.exportSelected}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleAction('delete_soft')}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t.bulkActions.deactivate}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Кнопка отмены */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={isProcessing}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
