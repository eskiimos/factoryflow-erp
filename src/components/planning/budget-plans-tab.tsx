'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Calendar, DollarSign } from "lucide-react"

interface BudgetPlansTabProps {
  budgetPlans: any[]
  setBudgetPlans: (plans: any[]) => void
  loading: boolean
  onRefresh: () => void
}

export default function BudgetPlansTab({ budgetPlans, setBudgetPlans, loading, onRefresh }: BudgetPlansTabProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    planType: 'QUARTERLY',
    startDate: '',
    endDate: '',
    totalRevenue: 0,
    totalCosts: 0,
    materialCosts: 0,
    laborCosts: 0,
    overheadCosts: 0,
    targetProfit: 0
  })

  const handleCreatePlan = async () => {
    try {
      const response = await fetch('/api/budget-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlan),
      })

      if (response.ok) {
        const createdPlan = await response.json()
        setBudgetPlans([createdPlan, ...budgetPlans])
        setIsCreateDialogOpen(false)
        setNewPlan({
          name: '',
          description: '',
          planType: 'QUARTERLY',
          startDate: '',
          endDate: '',
          totalRevenue: 0,
          totalCosts: 0,
          materialCosts: 0,
          laborCosts: 0,
          overheadCosts: 0,
          targetProfit: 0
        })
      }
    } catch (error) {
      console.error('Error creating budget plan:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Активный'
      case 'DRAFT': return 'Черновик'
      case 'COMPLETED': return 'Завершен'
      case 'CANCELLED': return 'Отменен'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Бюджетные планы</h2>
          <p className="text-gray-600">Управление фондами и бюджетными планами</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Создать план
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Создать бюджетный план</DialogTitle>
              <DialogDescription>
                Создайте новый бюджетный план для управления фондами
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название плана</Label>
                <Input
                  id="name"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  placeholder="Например: Бюджет Q1 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planType">Тип плана</Label>
                <Select
                  value={newPlan.planType}
                  onValueChange={(value) => setNewPlan({ ...newPlan, planType: value })}
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
                <Label htmlFor="startDate">Дата начала</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newPlan.startDate}
                  onChange={(e) => setNewPlan({ ...newPlan, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Дата окончания</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newPlan.endDate}
                  onChange={(e) => setNewPlan({ ...newPlan, endDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalRevenue">Планируемая выручка</Label>
                <Input
                  id="totalRevenue"
                  type="number"
                  value={newPlan.totalRevenue}
                  onChange={(e) => setNewPlan({ ...newPlan, totalRevenue: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetProfit">Целевая прибыль</Label>
                <Input
                  id="targetProfit"
                  type="number"
                  value={newPlan.targetProfit}
                  onChange={(e) => setNewPlan({ ...newPlan, targetProfit: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  placeholder="Описание бюджетного плана..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreatePlan}>
                Создать план
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {budgetPlans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Нет бюджетных планов
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Создайте первый бюджетный план для управления фондами предприятия
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Создать первый план
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {budgetPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                    {getStatusText(plan.status)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Период:</span>
                    <span className="text-sm font-medium">
                      {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Плановая выручка:</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(plan.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Плановые расходы:</span>
                    <span className="text-sm font-medium text-red-600">
                      {formatCurrency(plan.totalCosts)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Целевая прибыль:</span>
                    <span className="text-sm font-medium text-blue-600">
                      {formatCurrency(plan.targetProfit)}
                    </span>
                  </div>
                  <div className="pt-3 border-t flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
