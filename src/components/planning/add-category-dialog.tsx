'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"

// Определяем типы категорий с эмодзи
const categoryTypes = [
  { value: 'salary', label: 'Зарплата', emoji: '💰' },
  { value: 'benefits', label: 'Льготы', emoji: '🎁' },
  { value: 'taxes', label: 'Налоги', emoji: '📊' },
  { value: 'deductions', label: 'Удержания', emoji: '📉' },
  { value: 'bonus', label: 'Премии', emoji: '🏆' },
  { value: 'marketing', label: 'Маркетинг', emoji: '📢' },
  { value: 'operations', label: 'Операционные расходы', emoji: '⚙️' },
  { value: 'rent', label: 'Аренда', emoji: '🏢' },
  { value: 'utilities', label: 'Коммунальные услуги', emoji: '💡' },
  { value: 'travel', label: 'Командировки', emoji: '✈️' },
  { value: 'training', label: 'Обучение', emoji: '📚' },
  { value: 'equipment', label: 'Оборудование', emoji: '🖥️' },
  { value: 'software', label: 'Программное обеспечение', emoji: '💻' },
  { value: 'insurance', label: 'Страхование', emoji: '🛡️' },
  { value: 'legal', label: 'Юридические услуги', emoji: '⚖️' },
  { value: 'consulting', label: 'Консалтинг', emoji: '🤝' },
  { value: 'materials', label: 'Материалы', emoji: '📦' },
  { value: 'transport', label: 'Транспорт', emoji: '🚗' },
  { value: 'food', label: 'Питание', emoji: '🍽️' },
  { value: 'other', label: 'Прочее', emoji: '🔧' }
]

interface AddCategoryDialogProps {
  fundId: string
  isOpen: boolean
  onClose: () => void
  onAdd: (fundId: string, data: {
    name: string
    categoryType: string
    plannedAmount: number
    description: string
  }) => Promise<void>
}

export function AddCategoryDialog({ fundId, isOpen, onClose, onAdd }: AddCategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    categoryType: '',
    plannedAmount: 0,
    description: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🎯 Form submitted with data:', formData)
    
    if (!formData.name.trim() || !formData.categoryType) {
      console.log('❌ Validation failed - name or categoryType missing')
      return
    }
    
    setIsLoading(true)
    
    try {
      console.log('📞 Calling onAdd function with:', { fundId, formData })
      await onAdd(fundId, formData)
      
      // Очищаем форму и закрываем диалог
      setFormData({
        name: '',
        categoryType: '',
        plannedAmount: 0,
        description: ''
      })
      onClose()
    } catch (error) {
      console.error('Error adding category:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    // Очищаем форму при закрытии
    setFormData({
      name: '',
      categoryType: '',
      plannedAmount: 0,
      description: ''
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Добавить категорию
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Название категории</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Введите название категории"
              required
            />
          </div>

          <div>
            <Label htmlFor="categoryType">Тип категории</Label>
            <Select 
              value={formData.categoryType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип категории" />
              </SelectTrigger>
              <SelectContent>
                {categoryTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className="flex items-center gap-2">
                      <span>{type.emoji}</span>
                      <span>{type.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="plannedAmount">Планируемая сумма (₽)</Label>
            <Input
              id="plannedAmount"
              type="number"
              step="0.01"
              min="0"
              value={formData.plannedAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, plannedAmount: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Введите описание категории"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="mr-2 h-4 w-4" />
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name || !formData.categoryType}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
