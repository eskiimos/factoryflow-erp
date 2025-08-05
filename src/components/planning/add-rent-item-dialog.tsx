'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Building, Calculator } from "lucide-react"

interface AddRentItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: {
    name: string
    rentType: 'office' | 'warehouse' | 'equipment' | 'vehicle' | 'land'
    amount: number
    frequency: 'monthly' | 'quarterly' | 'annually'
    startDate: string
    endDate?: string
    area?: number
    location?: string
    description?: string
  }) => Promise<void>
}

const rentTypes = [
  { value: 'office', label: 'Офисное помещение', icon: Building, description: 'Аренда офиса, кабинетов' },
  { value: 'warehouse', label: 'Склад/Производство', icon: Building, description: 'Складские и производственные помещения' },
  { value: 'equipment', label: 'Оборудование', icon: Calculator, description: 'Аренда станков, техники' },
  { value: 'vehicle', label: 'Транспорт', icon: MapPin, description: 'Автомобили, спецтехника' },
  { value: 'land', label: 'Земельный участок', icon: MapPin, description: 'Земля для деятельности' }
]

const frequencies = [
  { 
    value: 'monthly', 
    label: 'Ежемесячно', 
    multiplier: 1,
    description: 'Платеж каждый месяц'
  },
  { 
    value: 'quarterly', 
    label: 'Ежеквартально', 
    multiplier: 3,
    description: 'Платеж каждые 3 месяца'
  },
  { 
    value: 'annually', 
    label: 'Ежегодно', 
    multiplier: 12,
    description: 'Платеж раз в год'
  }
]

const commonRentItems = [
  { name: 'Аренда офиса', rentType: 'office', amount: 150000, frequency: 'monthly', area: 100 },
  { name: 'Аренда склада', rentType: 'warehouse', amount: 80000, frequency: 'monthly', area: 500 },
  { name: 'Аренда автомобиля', rentType: 'vehicle', amount: 25000, frequency: 'monthly' },
  { name: 'Лизинг оборудования', rentType: 'equipment', amount: 50000, frequency: 'monthly' }
]

export function AddRentItemDialog({ isOpen, onClose, onAdd }: AddRentItemDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    rentType: 'office' as 'office' | 'warehouse' | 'equipment' | 'vehicle' | 'land',
    amount: '',
    frequency: 'monthly' as 'monthly' | 'quarterly' | 'annually',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    area: '',
    location: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePresetSelect = (preset: typeof commonRentItems[0]) => {
    setFormData({
      name: preset.name,
      rentType: preset.rentType as any,
      amount: preset.amount.toString(),
      frequency: preset.frequency as any,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      area: preset.area?.toString() || '',
      location: '',
      description: ''
    })
  }

  const calculateMonthlyAmount = () => {
    if (!formData.amount) return 0
    const amount = parseFloat(formData.amount)
    const frequency = frequencies.find(f => f.value === formData.frequency)
    if (!frequency) return 0
    
    return amount / frequency.multiplier
  }

  const calculateAnnualAmount = () => {
    return calculateMonthlyAmount() * 12
  }

  const getContractEndDate = () => {
    if (!formData.startDate) return null
    const startDate = new Date(formData.startDate)
    const endDate = new Date(startDate)
    endDate.setFullYear(endDate.getFullYear() + 1) // Обычно договор на год
    return endDate.toISOString().split('T')[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onAdd({
        name: formData.name,
        rentType: formData.rentType,
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate || getContractEndDate() || undefined,
        area: formData.area ? parseFloat(formData.area) : undefined,
        location: formData.location || undefined,
        description: formData.description || undefined
      })
      
      // Сброс формы
      setFormData({
        name: '',
        rentType: 'office',
        amount: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        area: '',
        location: '',
        description: ''
      })
      onClose()
    } catch (error) {
      console.error('Error adding rent item:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🏢 Добавить аренду
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Быстрый выбор */}
          <div>
            <Label className="text-sm font-medium">Быстрый выбор</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
              {commonRentItems.map((preset, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetSelect(preset)}
                  className="h-auto p-3 text-left justify-start"
                >
                  <div className="w-full">
                    <div className="font-medium text-xs">{preset.name}</div>
                    <div className="text-xs text-gray-500">
                      {preset.amount.toLocaleString('ru-RU')} ₽/мес
                    </div>
                    {preset.area && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {preset.area} м²
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Левая колонка */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Название *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Например: Аренда офиса на Тверской"
                  required
                />
              </div>

              <div>
                <Label>Тип аренды *</Label>
                <Select 
                  value={formData.rentType} 
                  onValueChange={(value: 'office' | 'warehouse' | 'equipment' | 'vehicle' | 'land') => 
                    setFormData(prev => ({ ...prev, rentType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rentTypes.map((type) => {
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="amount">Сумма платежа (₽) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="150000"
                    required
                  />
                </div>

                <div>
                  <Label>Периодичность *</Label>
                  <Select 
                    value={formData.frequency} 
                    onValueChange={(value: 'monthly' | 'quarterly' | 'annually') => 
                      setFormData(prev => ({ ...prev, frequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          <div>
                            <div className="font-medium">{freq.label}</div>
                            <div className="text-xs text-gray-500">{freq.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="startDate">Дата начала *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">Дата окончания</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    placeholder={getContractEndDate() || ''}
                  />
                </div>
              </div>

              {(formData.rentType === 'office' || formData.rentType === 'warehouse') && (
                <div>
                  <Label htmlFor="area">Площадь (м²)</Label>
                  <Input
                    id="area"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.area}
                    onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    placeholder="100"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="location">Адрес/Местоположение</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Москва, ул. Тверская, д.1"
                />
              </div>

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

            {/* Правая колонка - расчеты */}
            <div>
              <Label className="text-sm font-medium">Расчет стоимости</Label>
              <Card className="mt-2">
                <CardContent className="pt-4 space-y-4">
                  {formData.amount && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Платеж:</span>
                          <span className="font-medium">
                            {parseFloat(formData.amount).toLocaleString('ru-RU')} ₽ 
                            /{formData.frequency === 'monthly' ? 'мес' : formData.frequency === 'quarterly' ? 'кв' : 'год'}
                          </span>
                        </div>

                        {formData.frequency !== 'monthly' && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">В месяц:</span>
                            <span className="font-medium">
                              {calculateMonthlyAmount().toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between text-sm border-t pt-2">
                          <span className="text-gray-600">В год:</span>
                          <span className="font-bold text-lg">
                            {calculateAnnualAmount().toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                      </div>

                      {formData.area && (formData.rentType === 'office' || formData.rentType === 'warehouse') && (
                        <div className="border-t pt-3 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Площадь:</span>
                            <span className="font-medium">{formData.area} м²</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">₽ за м²/мес:</span>
                            <span className="font-medium">
                              {(calculateMonthlyAmount() / parseFloat(formData.area)).toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Информационная панель */}
                  <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium mb-1">График платежей:</p>
                        <ul className="space-y-0.5 ml-2">
                          <li>• Ежемесячно: 12 платежей в год</li>
                          <li>• Ежеквартально: 4 платежа в год</li>
                          <li>• Ежегодно: 1 платеж в год</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Дополнительные расходы */}
                  <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800">
                    <p className="font-medium mb-1">Дополнительно учесть:</p>
                    <ul className="space-y-0.5 ml-2">
                      <li>• Коммунальные платежи</li>
                      <li>• Обслуживание и уборка</li>
                      <li>• Страхование имущества</li>
                      <li>• Налог на имущество</li>
                    </ul>
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
              {isSubmitting ? 'Добавление...' : 'Добавить аренду'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
