'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, X, Trash2 } from "lucide-react"

interface FundCategory {
  id: string
  name: string
  categoryType: string
  plannedAmount: number
  percentage: number
  description: string
  priority: number
}

interface EditCategoryDialogProps {
  category: FundCategory
  isOpen: boolean
  onClose: () => void
  onSave: (categoryId: string, data: Partial<FundCategory>) => Promise<void>
  onDelete?: (categoryId: string) => Promise<void>
}

export function EditCategoryDialog({ category, isOpen, onClose, onSave, onDelete }: EditCategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: category.name,
    categoryType: category.categoryType,
    plannedAmount: category.plannedAmount,
    percentage: category.percentage,
    description: category.description,
    priority: category.priority
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      console.log('Submitting category data:', formData)
      await onSave(category.id, formData)
      onClose()
    } catch (error) {
      console.error('Error saving category:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!onDelete) return
    
    try {
      await onDelete(category.id)
      setShowDeleteDialog(false)
      onClose()
    } catch (error) {
      console.error('Error deleting category:', error)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Редактировать категорию
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
              <Select value={formData.categoryType} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">Зарплата</SelectItem>
                  <SelectItem value="benefits">Льготы</SelectItem>
                  <SelectItem value="taxes">Налоги</SelectItem>
                  <SelectItem value="deductions">Удержания</SelectItem>
                  <SelectItem value="bonus">Премии</SelectItem>
                  <SelectItem value="other">Прочее</SelectItem>
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
              <Label htmlFor="priority">Приоритет</Label>
              <Select value={formData.priority.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите приоритет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Высокий</SelectItem>
                  <SelectItem value="2">Средний</SelectItem>
                  <SelectItem value="3">Низкий</SelectItem>
                </SelectContent>
              </Select>
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

            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDeleteClick}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Удалить
              </Button>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  <X className="mr-2 h-4 w-4" />
                  Отмена
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  Сохранить
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Модальное окно подтверждения удаления */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Удалить категорию?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Вы уверены, что хотите удалить эту категорию? Это действие нельзя отменить.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={isLoading}
            >
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
