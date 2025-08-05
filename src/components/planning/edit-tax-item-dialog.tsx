'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Save, X, HelpCircle, Calculator } from "lucide-react"

interface EditTaxItemDialogProps {
  item: {
    id: string
    name: string
    itemType: string
    amount: number
    currency: string
    percentage?: number | null | undefined
    description?: string
    isRecurring: boolean
    priority: number
  } | null
  categoryId: string
  fundId: string
  isOpen: boolean
  onClose: () => void
  onSave: (itemData: any) => void
}

export function EditTaxItemDialog({ item, categoryId, fundId, isOpen, onClose, onSave }: EditTaxItemDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    taxType: 'VAT',
    percentage: 20,
    description: '',
    isRecurring: true,
    priority: 1
  })
  const [isLoading, setIsLoading] = useState(false)

  // Предустановленные типы налогов с процентами
  const taxTypes = [
    { value: 'VAT', label: 'НДС', defaultPercentage: 20, description: 'Налог на добавленную стоимость' },
    { value: 'INCOME_TAX', label: 'Налог на прибыль', defaultPercentage: 20, description: 'Налог на прибыль организаций' },
    { value: 'PROPERTY_TAX', label: 'Налог на имущество', defaultPercentage: 2.2, description: 'Налог на имущество организаций' },
    { value: 'TRANSPORT_TAX', label: 'Транспортный налог', defaultPercentage: 1, description: 'Налог на транспортные средства' },
    { value: 'LAND_TAX', label: 'Земельный налог', defaultPercentage: 1.5, description: 'Налог на земельные участки' },
    { value: 'SOCIAL_TAX', label: 'Соцвзносы', defaultPercentage: 30.2, description: 'Социальные взносы (ПФР, ФСС, ФОМС)' },
    { value: 'PENSION_TAX', label: 'Пенсионные взносы', defaultPercentage: 22, description: 'Взносы в Пенсионный фонд' },
    { value: 'MEDICAL_TAX', label: 'Медицинские взносы', defaultPercentage: 5.1, description: 'Взносы в ФОМС' },
    { value: 'SOCIAL_INSURANCE', label: 'Соцстрахование', defaultPercentage: 2.9, description: 'Взносы в ФСС' },
    { value: 'OTHER', label: 'Другой налог', defaultPercentage: 0, description: 'Прочие налоги и сборы' }
  ]

  // Заполняем форму данными при открытии
  useEffect(() => {
    if (item && isOpen) {
      // Пытаемся определить тип налога по названию
      let detectedTaxType = 'OTHER'
      const itemName = item.name.toLowerCase()
      
      if (itemName.includes('ндс')) detectedTaxType = 'VAT'
      else if (itemName.includes('прибыль')) detectedTaxType = 'INCOME_TAX'
      else if (itemName.includes('имущество')) detectedTaxType = 'PROPERTY_TAX'
      else if (itemName.includes('транспорт')) detectedTaxType = 'TRANSPORT_TAX'
      else if (itemName.includes('земельн')) detectedTaxType = 'LAND_TAX'
      else if (itemName.includes('соцвзнос') || itemName.includes('социальн')) detectedTaxType = 'SOCIAL_TAX'
      else if (itemName.includes('пенсион')) detectedTaxType = 'PENSION_TAX'
      else if (itemName.includes('медицин') || itemName.includes('фомс')) detectedTaxType = 'MEDICAL_TAX'
      else if (itemName.includes('соцстрах') || itemName.includes('фсс')) detectedTaxType = 'SOCIAL_INSURANCE'

      setFormData({
        name: item.name,
        taxType: detectedTaxType,
        percentage: item.percentage || 0,
        description: item.description || '',
        isRecurring: item.isRecurring,
        priority: item.priority
      })
    }
  }, [item, isOpen])

  const handleTaxTypeChange = (taxType: string) => {
    const selectedTax = taxTypes.find(tax => tax.value === taxType)
    setFormData(prev => ({
      ...prev,
      taxType,
      // Не меняем процент автоматически при редактировании, только название и описание
      name: selectedTax?.label || prev.name,
      description: selectedTax?.description || prev.description
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (!item) return

      console.log('Updating tax item:', formData)
      
      const itemData = {
        name: formData.name,
        itemType: 'TAX',
        amount: 0, // Для налогов сумма рассчитывается автоматически
        currency: 'RUB',
        percentage: formData.percentage,
        description: formData.description,
        employeeId: '',
        isRecurring: formData.isRecurring,
        priority: formData.priority,
        taxType: formData.taxType
      }
      
      await onSave(itemData)
      onClose()
    } catch (error) {
      console.error('Error updating tax item:', error)
      alert('Ошибка при обновлении налога')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedTax = taxTypes.find(tax => tax.value === formData.taxType)

  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Редактировать налог
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Тип налога */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="taxType">Тип налога</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Измените тип налога для автоматического обновления названия и описания</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select value={formData.taxType} onValueChange={handleTaxTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {taxTypes.map((tax) => (
                  <SelectItem key={tax.value} value={tax.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{tax.label}</span>
                      <span className="text-sm text-gray-500 ml-2">{tax.defaultPercentage}%</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Название налога */}
          <div>
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Введите название налога"
            />
          </div>

          {/* Процент */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="percentage">Процент (%)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Процент от выручки, который будет удерживаться как налог. Сумма рассчитается автоматически</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="relative">
              <Input
                id="percentage"
                type="number"
                value={formData.percentage}
                onChange={(e) => setFormData(prev => ({ ...prev, percentage: Number(e.target.value) }))}
                min="0"
                max="100"
                step="0.1"
                placeholder="0"
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
            </div>
          </div>

          {/* Приоритет */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="priority">Приоритет</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Порядок расчёта и отображения налога (1 = высший приоритет)</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="priority"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
              min="1"
              max="10"
              placeholder="1"
            />
          </div>

          {/* Повторяющийся */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: !!checked }))}
            />
            <div className="flex items-center gap-2">
              <Label htmlFor="isRecurring">Повторяющийся налог</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Налог будет автоматически рассчитываться каждый месяц на основе выручки</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Описание */}
          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              placeholder="Дополнительная информация о налоге..."
            />
          </div>

          {/* Информация о выбранном налоге */}
          {selectedTax && selectedTax.value !== 'OTHER' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <strong>{selectedTax.label}</strong> - {selectedTax.description}
              </div>
              <div className="text-sm text-blue-600 mt-1">
                Стандартная ставка: {selectedTax.defaultPercentage}% от налоговой базы
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isLoading || !formData.name} className="flex-1">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Сохранение...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Сохранить
                </div>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="h-4 w-4 mr-1" />
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
