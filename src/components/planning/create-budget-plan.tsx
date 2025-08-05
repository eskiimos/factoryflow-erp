'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"

interface CreateBudgetPlanProps {
  onBack: () => void
  onPlanCreated: () => void
}

export default function CreateBudgetPlan({ onBack, onPlanCreated }: CreateBudgetPlanProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    planType: 'QUARTERLY',
    startDate: '',
    endDate: '',
    totalRevenue: '',
    totalCosts: '',
    materialCosts: '',
    laborCosts: '',
    overheadCosts: '',
    targetProfit: ''
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const response = await fetch('/api/budget-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          totalRevenue: Number(formData.totalRevenue) || 0,
          totalCosts: Number(formData.totalCosts) || 0,
          materialCosts: Number(formData.materialCosts) || 0,
          laborCosts: Number(formData.laborCosts) || 0,
          overheadCosts: Number(formData.overheadCosts) || 0,
          targetProfit: Number(formData.targetProfit) || 0
        }),
      })

      if (response.ok) {
        onPlanCreated()
        onBack()
      } else {
        alert('Ошибка при создании плана')
      }
    } catch (error) {
      console.error('Error creating budget plan:', error)
      alert('Ошибка при создании плана')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>Создать бюджетный план</CardTitle>
            <p className="text-gray-600">Создайте новый план для управления фондами</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название плана *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: Бюджет Q1 2024"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="planType">Тип плана</Label>
              <Select
                value={formData.planType}
                onValueChange={(value) => setFormData({ ...formData, planType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Месячный</SelectItem>
                  <SelectItem value="QUARTERLY">Квартальный</SelectItem>
                  <SelectItem value="ANNUAL">Годовой</SelectItem>
                  <SelectItem value="CUSTOM">Произвольный</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Дата начала *</Label>
              <Input
                id="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Дата окончания *</Label>
              <Input
                id="endDate"
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalRevenue">Планируемая выручка (₽)</Label>
              <Input
                id="totalRevenue"
                type="number"
                min="0"
                value={formData.totalRevenue}
                onChange={(e) => setFormData({ ...formData, totalRevenue: e.target.value })}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetProfit">Целевая прибыль (₽)</Label>
              <Input
                id="targetProfit"
                type="number"
                min="0"
                value={formData.targetProfit}
                onChange={(e) => setFormData({ ...formData, targetProfit: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="materialCosts">Расходы на материалы (₽)</Label>
              <Input
                id="materialCosts"
                type="number"
                min="0"
                value={formData.materialCosts}
                onChange={(e) => setFormData({ ...formData, materialCosts: e.target.value })}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="laborCosts">Расходы на труд (₽)</Label>
              <Input
                id="laborCosts"
                type="number"
                min="0"
                value={formData.laborCosts}
                onChange={(e) => setFormData({ ...formData, laborCosts: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Описание бюджетного плана..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onBack}>
              Отмена
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Создание...' : 'Создать план'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
