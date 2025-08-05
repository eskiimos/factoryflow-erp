'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Calculator, Percent, Minus } from "lucide-react"

interface AddDeductionItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: {
    name: string
    calculationType: 'fixed' | 'percentage'
    amount?: number
    percentage?: number
    baseType?: 'salary' | 'gross' | 'net'
    description?: string
  }) => Promise<void>
}

const calculationTypes = [
  { 
    value: 'fixed', 
    label: 'Фиксированная сумма', 
    icon: Calculator,
    description: 'Постоянная сумма удержания'
  },
  { 
    value: 'percentage', 
    label: 'Процент от базы', 
    icon: Percent,
    description: 'Процент от выбранной базы расчета'
  }
]

const baseTypes = [
  { 
    value: 'salary', 
    label: 'Оклад', 
    description: 'Базовый оклад сотрудника'
  },
  { 
    value: 'gross', 
    label: 'Общий доход', 
    description: 'Оклад + премии + надбавки'
  },
  { 
    value: 'net', 
    label: 'После налогов', 
    description: 'Доход после удержания подоходного налога'
  }
]

const commonDeductions = [
  { name: 'Профсоюзные взносы', percentage: 1, baseType: 'salary' },
  { name: 'Удержание за питание', amount: 3000, calculationType: 'fixed' },
  { name: 'Алименты', percentage: 25, baseType: 'net' },
  { name: 'Займ предприятия', amount: 5000, calculationType: 'fixed' },
  { name: 'Штраф', amount: 1000, calculationType: 'fixed' }
]

export function AddDeductionItemDialog({ isOpen, onClose, onAdd }: AddDeductionItemDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    calculationType: 'percentage' as 'fixed' | 'percentage',
    amount: '',
    percentage: '',
    baseType: 'salary' as 'salary' | 'gross' | 'net',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePresetSelect = (preset: typeof commonDeductions[0]) => {
    setFormData({
      name: preset.name,
      calculationType: preset.calculationType || 'percentage',
      amount: preset.amount?.toString() || '',
      percentage: preset.percentage?.toString() || '',
      baseType: preset.baseType || 'salary',
      description: ''
    })
  }

  const calculateExampleAmount = () => {
    const exampleSalary = 100000 // Пример зарплаты для расчета
    if (formData.calculationType === 'fixed' && formData.amount) {
      return parseFloat(formData.amount)
    }
    if (formData.calculationType === 'percentage' && formData.percentage) {
      let baseAmount = exampleSalary
      if (formData.baseType === 'gross') {
        baseAmount = exampleSalary * 1.3 // Предполагаем +30% от оклада
      } else if (formData.baseType === 'net') {
        baseAmount = exampleSalary * 0.87 // Предполагаем -13% подоходный налог
      }
      return baseAmount * parseFloat(formData.percentage) / 100
    }
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onAdd({
        name: formData.name,
        calculationType: formData.calculationType,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        percentage: formData.percentage ? parseFloat(formData.percentage) : undefined,
        baseType: formData.calculationType === 'percentage' ? formData.baseType : undefined,
        description: formData.description
      })
      
      // Сброс формы
      setFormData({
        name: '',
        calculationType: 'percentage',
        amount: '',
        percentage: '',
        baseType: 'salary',
        description: ''
      })
      onClose()
    } catch (error) {
      console.error('Error adding deduction item:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📉 Добавить удержание
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Быстрый выбор из шаблонов */}
          <div>
            <Label className="text-sm font-medium">Быстрый выбор</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
              {commonDeductions.map((preset, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetSelect(preset)}
                  className="h-auto p-2 text-left justify-start"
                >
                  <div>
                    <div className="font-medium text-xs">{preset.name}</div>
                    <div className="text-xs text-gray-500">
                      {preset.percentage ? `${preset.percentage}%` : `${preset.amount} ₽`}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Левая колонка */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Название удержания *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Например: Профсоюзные взносы"
                  required
                />
              </div>

              <div>
                <Label>Тип расчета *</Label>
                <Select 
                  value={formData.calculationType} 
                  onValueChange={(value: 'fixed' | 'percentage') => 
                    setFormData(prev => ({ ...prev, calculationType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {calculationTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-gray-500">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {formData.calculationType === 'fixed' && (
                <div>
                  <Label htmlFor="amount">Сумма удержания (₽) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="5000"
                    required
                  />
                </div>
              )}

              {formData.calculationType === 'percentage' && (
                <>
                  <div>
                    <Label htmlFor="percentage">Процент удержания (%) *</Label>
                    <Input
                      id="percentage"
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={formData.percentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, percentage: e.target.value }))}
                      placeholder="1"
                      required
                    />
                  </div>

                  <div>
                    <Label>База для расчета *</Label>
                    <Select 
                      value={formData.baseType} 
                      onValueChange={(value: 'salary' | 'gross' | 'net') => 
                        setFormData(prev => ({ ...prev, baseType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {baseTypes.map((base) => (
                          <SelectItem key={base.value} value={base.value}>
                            <div>
                              <div className="font-medium">{base.label}</div>
                              <div className="text-xs text-gray-500">{base.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="description">Описание</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Дополнительная информация"
                />
              </div>
            </div>

            {/* Правая колонка - предварительный расчет */}
            <div>
              <Label className="text-sm font-medium">Предварительный расчет</Label>
              <Card className="mt-2">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Info className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">Пример для зарплаты 100 000 ₽</span>
                    </div>

                    {formData.calculationType === 'percentage' && (
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">База расчета:</span>
                          <span className="font-medium">
                            {formData.baseType === 'salary' && '100 000 ₽ (оклад)'}
                            {formData.baseType === 'gross' && '130 000 ₽ (общий доход)'}
                            {formData.baseType === 'net' && '87 000 ₽ (после налогов)'}
                          </span>
                        </div>
                        {formData.percentage && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Процент:</span>
                            <span className="font-medium">{formData.percentage}%</span>
                          </div>
                        )}
                      </div>
                    )}

                    {(formData.amount || formData.percentage) && (
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Minus className="w-4 h-4 text-red-500" />
                            <span className="font-medium">Удержание:</span>
                          </div>
                          <span className="text-lg font-bold text-red-600">
                            {calculateExampleAmount().toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                      <div className="flex items-start gap-2">
                        <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium mb-1">Важные ограничения:</p>
                          <ul className="space-y-0.5 ml-2">
                            <li>• Максимальное удержание: 50% от зарплаты</li>
                            <li>• Алименты: до 70% при задолженности</li>
                            <li>• Профсоюз: обычно 1% от оклада</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Добавление...' : 'Добавить удержание'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
