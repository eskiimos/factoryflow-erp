"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Checkbox } from "@/components/ui/checkbox"
import { MaterialCombobox } from "@/components/material-combobox"
import { Category } from "@/lib/types"
import { useLanguage } from "@/context/language-context"

interface BulkActionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (params: any) => void
  action: string
  selectedCount: number
  categories?: Category[]
}

export function BulkActionDialog({
  isOpen,
  onClose,
  onSubmit,
  action,
  selectedCount,
  categories = []
}: BulkActionDialogProps) {
  const { t } = useLanguage()
  const [params, setParams] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(params)
      onClose()
    } catch (error) {
      console.error("Error submitting bulk action:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAffectedItemsCount = () => {
    return selectedCount
  }

  const renderContent = () => {
    switch (action) {
      case 'increase_price_percent':
      case 'decrease_price_percent':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="percent">Процент изменения</Label>
              <Input
                id="percent"
                type="number"
                min="0"
                max="1000"
                step="0.1"
                value={params.percent || ''}
                onChange={(e) => setParams({...params, percent: parseFloat(e.target.value)})}
                placeholder="Введите процент"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="roundToInteger"
                type="checkbox"
                checked={params.roundToInteger || false}
                onChange={(e) => setParams({...params, roundToInteger: e.target.checked})}
                className="h-4 w-4"
              />
              <Label htmlFor="roundToInteger">Округлить до целых чисел</Label>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">
                {action === 'increase_price_percent' ? 'Увеличить' : 'Уменьшить'} цену на {params.percent || 0}% 
                для {getAffectedItemsCount()} материалов
              </p>
            </div>
          </div>
        )

      case 'update_currency_usd_rub':
      case 'update_currency_rub_usd':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exchangeRate">Курс обмена</Label>
              <Input
                id="exchangeRate"
                type="number"
                min="0"
                step="0.01"
                value={params.exchangeRate || ''}
                onChange={(e) => setParams({...params, exchangeRate: parseFloat(e.target.value)})}
                placeholder="Например: 92.50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spread">Спред (% комиссии)</Label>
              <Input
                id="spread"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={params.spread || ''}
                onChange={(e) => setParams({...params, spread: parseFloat(e.target.value)})}
                placeholder="Например: 2.0"
              />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">
                Пересчитать {action === 'update_currency_usd_rub' ? 'из USD в RUB' : 'из RUB в USD'} 
                для {getAffectedItemsCount()} материалов
              </p>
            </div>
          </div>
        )

      case 'copy_simple':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="namePrefix">Префикс для названий</Label>
              <Input
                id="namePrefix"
                value={params.namePrefix || 'Копия'}
                onChange={(e) => setParams({...params, namePrefix: e.target.value})}
                placeholder="Копия"
              />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">
                Создать копии для {getAffectedItemsCount()} материалов
              </p>
            </div>
          </div>
        )

      case 'copy_to_category':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="namePrefix">Префикс для названий</Label>
              <Input
                id="namePrefix"
                value={params.namePrefix || 'Копия'}
                onChange={(e) => setParams({...params, namePrefix: e.target.value})}
                placeholder="Копия"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Категория для копий</Label>
              <MaterialCombobox
                type="category"
                options={categories.map(cat => ({
                  value: cat.id,
                  label: cat.name
                }))}
                value={params.categoryId || ''}
                onChange={(value) => setParams({...params, categoryId: value})}
                allowEmpty={true}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">
                Создать копии для {getAffectedItemsCount()} материалов в выбранной категории
              </p>
            </div>
          </div>
        )

      case 'copy_with_changes':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="namePrefix">Префикс для названий</Label>
              <Input
                id="namePrefix"
                value={params.namePrefix || 'Копия'}
                onChange={(e) => setParams({...params, namePrefix: e.target.value})}
                placeholder="Копия"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Категория для копий</Label>
              <MaterialCombobox
                type="category"
                options={categories.map(cat => ({
                  value: cat.id,
                  label: cat.name
                }))}
                value={params.categoryId || ''}
                onChange={(value) => setParams({...params, categoryId: value})}
                allowEmpty={true}
              />
            </div>
            <div className="space-y-2">
              <Label>Изменение цены</Label>
              <div className="flex gap-2">
                <Select
                  value={params.priceAdjustmentType || 'percent'}
                  onValueChange={(value) => setParams({...params, priceAdjustmentType: value})}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">%</SelectItem>
                    <SelectItem value="fixed">Фикс.</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={params.priceAdjustmentValue || ''}
                  onChange={(e) => setParams({...params, priceAdjustmentValue: parseFloat(e.target.value)})}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">
                Создать копии для {getAffectedItemsCount()} материалов с изменениями
              </p>
            </div>
          </div>
        )

      case 'change_category':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Новая категория</Label>
              <MaterialCombobox
                type="category"
                options={categories.map(cat => ({
                  value: cat.id,
                  label: cat.name
                }))}
                value={params.categoryId || ''}
                onChange={(value) => setParams({...params, categoryId: value})}
                allowEmpty={true}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">
                Изменить категорию для {getAffectedItemsCount()} материалов
              </p>
            </div>
          </div>
        )

      default:
        return (
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">
              Выполнить действие для {getAffectedItemsCount()} материалов
            </p>
          </div>
        )
    }
  }

  const getTitle = () => {
    switch (action) {
      case 'increase_price_percent':
        return 'Увеличить цену на %'
      case 'decrease_price_percent':
        return 'Уменьшить цену на %'
      case 'update_currency_usd_rub':
        return 'Пересчитать в рубли'
      case 'update_currency_rub_usd':
        return 'Пересчитать в доллары'
      case 'copy_simple':
        return 'Создать копии'
      case 'copy_to_category':
        return 'Копировать в категорию'
      case 'copy_with_changes':
        return 'Копировать с изменениями'
      case 'change_category':
        return 'Изменить категорию'
      default:
        return 'Массовое действие'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            Настройте параметры для выполнения массового действия
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {renderContent()}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Обработка...' : 'Применить'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
