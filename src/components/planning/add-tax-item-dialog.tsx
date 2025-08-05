'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Save, X, HelpCircle, Calculator } from "lucide-react"

interface AddTaxItemDialogProps {
  categoryId: string
  fundId: string
  categoryName?: string
  categoryType?: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddTaxItemDialog({ categoryId, fundId, categoryName, categoryType, isOpen, onClose, onSuccess }: AddTaxItemDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    taxType: 'VAT', // НДС по умолчанию
    percentage: 20, // 20% по умолчанию для НДС
    description: '',
    isRecurring: true // Налоги обычно повторяющиеся
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

  const handleTaxTypeChange = (taxType: string) => {
    const selectedTax = taxTypes.find(tax => tax.value === taxType)
    setFormData(prev => ({
      ...prev,
      taxType,
      percentage: selectedTax?.defaultPercentage || 0,
      name: selectedTax?.label || '',
      description: selectedTax?.description || ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      console.log('Adding new tax item:', formData)
      
      // Для налогов сумма рассчитывается на основе процента от выручки
      const itemData = {
        name: formData.name,
        itemType: 'TAX',
        amount: 0, // Сумма будет рассчитываться автоматически
        currency: 'RUB',
        percentage: formData.percentage,
        description: formData.description,
        employeeId: '',
        isRecurring: formData.isRecurring,
        priority: 1,
        // Дополнительные данные о налоге
        taxType: formData.taxType
      }
      
      const response = await fetch(`/api/funds/${fundId}/categories/${categoryId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      })
      
      const result = await response.json()
      console.log('Add tax item response:', result)
      
      if (response.ok) {
        // Reset form
        setFormData({
          name: '',
          taxType: 'VAT',
          percentage: 20,
          description: '',
          isRecurring: true
        })
        onSuccess()
        onClose()
      } else {
        console.error('Add tax item failed:', result)
        alert('Ошибка при добавлении налога: ' + result.error)
      }
    } catch (error) {
      console.error('Error adding tax item:', error)
      alert('Ошибка при добавлении налога')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedTax = taxTypes.find(tax => tax.value === formData.taxType)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Добавить налог
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
                  <p>Выберите тип налога. Процент будет установлен автоматически согласно действующему законодательству</p>
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

          {/* Информация о выбранном налоге */}
          {selectedTax && selectedTax.value !== 'OTHER' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <strong>{selectedTax.label}</strong> - {selectedTax.description}
              </div>
              <div className="text-sm text-blue-600 mt-1">
                Ставка: {selectedTax.defaultPercentage}% от налоговой базы
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isLoading || !formData.name} className="flex-1">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Добавление...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Добавить налог
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
