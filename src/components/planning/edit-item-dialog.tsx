'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, X } from "lucide-react"

interface FundCategoryItem {
  id: string
  name: string
  itemType: string
  amount: number
  currency: string
  percentage?: number
  description: string
  isRecurring: boolean
  priority: number
}

interface EditItemDialogProps {
  item: FundCategoryItem
  isOpen: boolean
  onClose: () => void
  onSave: (itemId: string, data: Partial<FundCategoryItem>) => Promise<void>
}

export function EditItemDialog({ item, isOpen, onClose, onSave }: EditItemDialogProps) {
  const [formData, setFormData] = useState({
    name: item.name,
    itemType: item.itemType,
    amount: item.amount,
    currency: item.currency,
    percentage: item.percentage || 0,
    description: item.description,
    isRecurring: item.isRecurring,
    priority: item.priority
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      console.log('Submitting item data:', formData)
      await onSave(item.id, formData)
      onClose()
    } catch (error) {
      console.error('Error saving item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Редактировать элемент
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Сумма</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <Label htmlFor="itemType">Тип элемента</Label>
            <Select 
              value={formData.itemType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, itemType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SALARY">Зарплата</SelectItem>
                <SelectItem value="BONUS">Бонус</SelectItem>
                <SelectItem value="EXPENSE">Расход</SelectItem>
                <SelectItem value="INVESTMENT">Инвестиции</SelectItem>
                <SelectItem value="OTHER">Другое</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="percentage">Процент (%)</Label>
            <Input
              id="percentage"
              type="number"
              value={formData.percentage}
              onChange={(e) => setFormData(prev => ({ ...prev, percentage: Number(e.target.value) }))}
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: !!checked }))}
            />
            <Label htmlFor="isRecurring">Повторяющийся</Label>
          </div>

          <div>
            <Label htmlFor="priority">Приоритет</Label>
            <Input
              id="priority"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
              min="1"
              max="10"
            />
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
