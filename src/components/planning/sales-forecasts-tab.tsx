'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, TrendingUp, Calendar, BarChart3 } from "lucide-react"

interface SalesForecastsTabProps {
  salesForecasts: any[]
  setSalesForecasts: (forecasts: any[]) => void
  budgetPlans: any[]
  categories: { id: string; name: string }[]
  loading: boolean
  onRefresh: () => void
}

export default function SalesForecastsTab({ 
  salesForecasts, 
  setSalesForecasts, 
  budgetPlans, 
  categories, 
  loading, 
  onRefresh 
}: SalesForecastsTabProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newForecast, setNewForecast] = useState({
    name: '',
    forecastType: 'PRODUCT_BASED',
    budgetPlanId: '',
    startDate: '',
    endDate: '',
    periodType: 'MONTHLY',
    totalQuantity: 0,
    totalRevenue: 0,
    averagePrice: 0,
    growthRate: 0,
    seasonality: 1,
    marketTrend: 1,
    confidence: 'MEDIUM',
    methodology: '',
    notes: ''
  })

  const handleCreateForecast = async () => {
    try {
      const response = await fetch('/api/sales-forecasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newForecast,
          budgetPlanId: newForecast.budgetPlanId || null
        }),
      })

      if (response.ok) {
        const createdForecast = await response.json()
        setSalesForecasts([createdForecast, ...salesForecasts])
        setIsCreateDialogOpen(false)
        setNewForecast({
          name: '',
          forecastType: 'PRODUCT_BASED',
          budgetPlanId: '',
          startDate: '',
          endDate: '',
          periodType: 'MONTHLY',
          totalQuantity: 0,
          totalRevenue: 0,
          averagePrice: 0,
          growthRate: 0,
          seasonality: 1,
          marketTrend: 1,
          confidence: 'MEDIUM',
          methodology: '',
          notes: ''
        })
      }
    } catch (error) {
      console.error('Error creating sales forecast:', error)
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

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceText = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'Высокая'
      case 'MEDIUM': return 'Средняя'
      case 'LOW': return 'Низкая'
      default: return confidence
    }
  }

  const getForecastTypeText = (variant: string) => {
    switch (type) {
      case 'PRODUCT_BASED': return 'По товарам'
      case 'CATEGORY_BASED': return 'По категориям'
      case 'TOTAL': return 'Общий'
      default: return type
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
          <h2 className="text-2xl font-bold">Прогнозы продаж</h2>
          <p className="text-gray-600">Планирование и прогнозирование продаж</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Создать прогноз
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Создать прогноз продаж</DialogTitle>
              <DialogDescription>
                Создайте новый прогноз продаж для планирования выручки
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название прогноза</Label>
                <Input
                  id="name"
                  value={newForecast.name}
                  onChange={(e) => setNewForecast({ ...newForecast, name: e.target.value })}
                  placeholder="Например: Прогноз продаж Q1 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="forecastType">Тип прогноза</Label>
                <Select
                  value={newForecast.forecastType}
                  onValueChange={(value) => setNewForecast({ ...newForecast, forecastType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRODUCT_BASED">По товарам</SelectItem>
                    <SelectItem value="CATEGORY_BASED">По категориям</SelectItem>
                    <SelectItem value="TOTAL">Общий прогноз</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetPlan">Бюджетный план (опционально)</Label>
                <Select
                  value={newForecast.budgetPlanId}
                  onValueChange={(value) => setNewForecast({ ...newForecast, budgetPlanId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите план" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Без привязки к плану</SelectItem>
                    {budgetPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="periodType">Период</Label>
                <Select
                  value={newForecast.periodType}
                  onValueChange={(value) => setNewForecast({ ...newForecast, periodType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Ежедневно</SelectItem>
                    <SelectItem value="WEEKLY">Еженедельно</SelectItem>
                    <SelectItem value="MONTHLY">Ежемесячно</SelectItem>
                    <SelectItem value="QUARTERLY">Ежеквартально</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Дата начала</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newForecast.startDate}
                  onChange={(e) => setNewForecast({ ...newForecast, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Дата окончания</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newForecast.endDate}
                  onChange={(e) => setNewForecast({ ...newForecast, endDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalRevenue">Прогнозируемая выручка</Label>
                <Input
                  id="totalRevenue"
                  type="number"
                  value={newForecast.totalRevenue}
                  onChange={(e) => setNewForecast({ ...newForecast, totalRevenue: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confidence">Уровень уверенности</Label>
                <Select
                  value={newForecast.confidence}
                  onValueChange={(value) => setNewForecast({ ...newForecast, confidence: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Низкая</SelectItem>
                    <SelectItem value="MEDIUM">Средняя</SelectItem>
                    <SelectItem value="HIGH">Высокая</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="growthRate">Темп роста (%)</Label>
                <Input
                  id="growthRate"
                  type="number"
                  value={newForecast.growthRate}
                  onChange={(e) => setNewForecast({ ...newForecast, growthRate: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seasonality">Сезонность (коэффициент)</Label>
                <Input
                  id="seasonality"
                  type="number"
                  step="0.1"
                  value={newForecast.seasonality}
                  onChange={(e) => setNewForecast({ ...newForecast, seasonality: Number(e.target.value) })}
                  placeholder="1.0"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="methodology">Методология прогноза</Label>
                <Textarea
                  id="methodology"
                  value={newForecast.methodology}
                  onChange={(e) => setNewForecast({ ...newForecast, methodology: e.target.value })}
                  placeholder="Описание методологии составления прогноза..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateForecast}>
                Создать прогноз
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {salesForecasts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Нет прогнозов продаж
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Создайте первый прогноз продаж для планирования выручки
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Создать первый прогноз
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {salesForecasts.map((forecast) => (
            <Card key={forecast.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{forecast.name}</CardTitle>
                    <CardDescription>{getForecastTypeText(forecast.forecastType)}</CardDescription>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(forecast.confidence)}`}>
                    {getConfidenceText(forecast.confidence)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Период:</span>
                    <span className="text-sm font-medium">
                      {formatDate(forecast.startDate)} - {formatDate(forecast.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Прогнозируемая выручка:</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(forecast.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Темп роста:</span>
                    <span className="text-sm font-medium">
                      {forecast.growthRate > 0 ? '+' : ''}{forecast.growthRate}%
                    </span>
                  </div>
                  {forecast.budgetPlan && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Бюджетный план:</span>
                      <span className="text-sm font-medium text-blue-600">
                        {forecast.budgetPlan.name}
                      </span>
                    </div>
                  )}
                  {forecast.notes && (
                    <div className="pt-2">
                      <p className="text-sm text-gray-600">{forecast.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
