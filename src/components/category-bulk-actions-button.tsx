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
  Zap,
  Settings
} from "lucide-react"
import { useLanguage } from "@/context/language-context"

interface CategoryBulkActionsButtonProps {
  categoryId: string
  categoryName: string
  materialsCount: number
  onBulkAction: (action: string) => void
}

export function CategoryBulkActionsButton({ 
  categoryId, 
  categoryName, 
  materialsCount,
  onBulkAction 
}: CategoryBulkActionsButtonProps) {
  const { t } = useLanguage()
  const [isProcessing, setIsProcessing] = useState(false)

  if (materialsCount === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-center">
          <p className="text-gray-600">В этой категории пока нет материалов</p>
          <p className="text-sm text-gray-500 mt-1">
            Добавьте материалы, чтобы использовать массовые действия
          </p>
        </div>
      </div>
    )
  }

  const handleAction = async (action: string) => {
    setIsProcessing(true)
    try {
      await onBulkAction(action)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
            <Zap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Массовые действия для категории
            </h3>
            <p className="text-sm text-gray-600">
              Применить действия ко всем <Badge variant="secondary" className="mx-1">
                {materialsCount}
              </Badge> материалам категории "{categoryName}"
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Действия с ценами */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isProcessing}>
                <Percent className="h-4 w-4 mr-2" />
                Цены
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleAction('increase_price_percent')}>
                📈 Увеличить цену на %
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('decrease_price_percent')}>
                📉 Уменьшить цену на %
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAction('update_currency_usd_rub')}>
                💱 Пересчитать в рубли
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('update_currency_rub_usd')}>
                💰 Пересчитать в доллары
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Копирование */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isProcessing}>
                <Copy className="h-4 w-4 mr-2" />
                Копирование
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleAction('copy_simple')}>
                📋 Создать копии
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('copy_to_category')}>
                📁 Копировать в другую категорию
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('copy_with_changes')}>
                ✏️ Копировать с изменениями
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Другие действия */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isProcessing}>
                <Settings className="h-4 w-4 mr-2" />
                Управление
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleAction('change_category')}>
                📂 Переместить в другую категорию
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleAction('delete_soft')}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Деактивировать все
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
