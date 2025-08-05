'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, X } from "lucide-react"

interface Fund {
  id: string
  name: string
  description: string
  fundType: string
  totalAmount: number
  status: string
  startDate: string
  endDate: string
}

interface EditFundDialogProps {
  fund: Fund
  isOpen: boolean
  onClose: () => void
  onSave: (fundId: string, data: Partial<Fund>) => Promise<void>
}

export function EditFundDialog({ fund, isOpen, onClose, onSave }: EditFundDialogProps) {
  const [formData, setFormData] = useState({
    name: fund.name,
    description: fund.description,
    fundType: fund.fundType,
    totalAmount: fund.totalAmount,
    status: fund.status,
    startDate: fund.startDate ? fund.startDate.toString().split('T')[0] : '',
    endDate: fund.endDate ? fund.endDate.toString().split('T')[0] : ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      console.log('Submitting fund data:', formData)
      await onSave(fund.id, formData)
      onClose()
    } catch (error) {
      console.error('Error saving fund:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Редактировать фонд
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Название фонда</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="fundType">Тип фонда</Label>
            <Select 
              value={formData.fundType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, fundType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRODUCTION">Фонд производства</SelectItem>
                <SelectItem value="SALES">Фонд отдела продаж</SelectItem>
                <SelectItem value="DEVELOPMENT">Фонд развития</SelectItem>
                <SelectItem value="MARKETING">Фонд маркетинга</SelectItem>
                <SelectItem value="OPERATIONS">Операционный фонд</SelectItem>
                <SelectItem value="RESERVE">Резервный фонд</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="totalAmount">Общая сумма бюджета</Label>
            <Input
              id="totalAmount"
              type="number"
              value={formData.totalAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <Label htmlFor="status">Статус</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Активный</SelectItem>
                <SelectItem value="PAUSED">Приостановлен</SelectItem>
                <SelectItem value="COMPLETED">Завершен</SelectItem>
                <SelectItem value="CANCELLED">Отменен</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Дата начала</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Дата окончания</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
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
