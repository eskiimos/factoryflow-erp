'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, TrendingUp, Target, AlertCircle } from "lucide-react"

interface BudgetPlan {
  id: string
  name: string
}

interface CreateSalesForecastProps {
  budgetPlans: BudgetPlan[]
  onSuccess?: () => void
}

export function CreateSalesForecast({ budgetPlans, onSuccess }: CreateSalesForecastProps) {
  const [formData, setFormData] = useState({
    budgetPlanId: '',
    name: '',
    forecastType: 'QUARTERLY',
    startDate: '',
    endDate: '',
    periodType: 'QUARTER',
    totalQuantity: '',
    totalRevenue: '',
    averagePrice: '',
    growthRate: '',
    seasonality: '',
    marketTrend: 'STABLE',
    confidence: '70',
    methodology: 'STATISTICAL',
    notes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/sales-forecasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          totalQuantity: formData.totalQuantity ? parseInt(formData.totalQuantity) : 0,
          totalRevenue: formData.totalRevenue ? parseFloat(formData.totalRevenue) : 0,
          averagePrice: formData.averagePrice ? parseFloat(formData.averagePrice) : 0,
          growthRate: formData.growthRate ? parseFloat(formData.growthRate) : 0,
          seasonality: formData.seasonality ? parseFloat(formData.seasonality) : 0,
          confidence: parseInt(formData.confidence)
        })
      })

      if (!response.ok) {
        throw new Error('Ошибка при создании прогноза')
      }

      setSuccess(true)
      setFormData({
        budgetPlanId: '',
        name: '',
        forecastType: 'QUARTERLY',
        startDate: '',
        endDate: '',
        periodType: 'QUARTER',
        totalQuantity: '',
        totalRevenue: '',
        averagePrice: '',
        growthRate: '',
        seasonality: '',
        marketTrend: 'STABLE',
        confidence: '70',
        methodology: 'STATISTICAL',
        notes: ''
      })
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <Target className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-700 mb-2">
              Прогноз продаж создан успешно!
            </h3>
            <p className="text-gray-600 mb-4">
              Прогноз добавлен в систему планирования
            </p>
            <Button onClick={() => setSuccess(false)}>
              Создать еще один прогноз
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Создание прогноза продаж
        </CardTitle>
        <CardDescription>
          Создайте новый прогноз продаж с параметрами планирования
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetPlanId">Бюджетный план</Label>
              <Select
                value={formData.budgetPlanId}
                onValueChange={(value) => handleInputChange('budgetPlanId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите бюджетный план" />
                </SelectTrigger>
                <SelectContent>
                  {budgetPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Название прогноза *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Введите название прогноза"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="forecastType">Тип прогноза</Label>
              <Select
                value={formData.forecastType}
                onValueChange={(value) => handleInputChange('forecastType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Месячный</SelectItem>
                  <SelectItem value="QUARTERLY">Квартальный</SelectItem>
                  <SelectItem value="YEARLY">Годовой</SelectItem>
                  <SelectItem value="CUSTOM">Произвольный</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodType">Период</Label>
              <Select
                value={formData.periodType}
                onValueChange={(value) => handleInputChange('periodType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAY">День</SelectItem>
                  <SelectItem value="WEEK">Неделя</SelectItem>
                  <SelectItem value="MONTH">Месяц</SelectItem>
                  <SelectItem value="QUARTER">Квартал</SelectItem>
                  <SelectItem value="YEAR">Год</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Дата начала</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Дата окончания</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalQuantity">Общее количество</Label>
              <Input
                id="totalQuantity"
                type="number"
                value={formData.totalQuantity}
                onChange={(e) => handleInputChange('totalQuantity', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalRevenue">Общая выручка (₽)</Label>
              <Input
                id="totalRevenue"
                type="number"
                step="0.01"
                value={formData.totalRevenue}
                onChange={(e) => handleInputChange('totalRevenue', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="averagePrice">Средняя цена (₽)</Label>
              <Input
                id="averagePrice"
                type="number"
                step="0.01"
                value={formData.averagePrice}
                onChange={(e) => handleInputChange('averagePrice', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="growthRate">Темп роста (%)</Label>
              <Input
                id="growthRate"
                type="number"
                step="0.1"
                value={formData.growthRate}
                onChange={(e) => handleInputChange('growthRate', e.target.value)}
                placeholder="0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seasonality">Сезонность (%)</Label>
              <Input
                id="seasonality"
                type="number"
                step="0.1"
                value={formData.seasonality}
                onChange={(e) => handleInputChange('seasonality', e.target.value)}
                placeholder="0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confidence">Уверенность (%)</Label>
              <Input
                id="confidence"
                type="number"
                min="0"
                max="100"
                value={formData.confidence}
                onChange={(e) => handleInputChange('confidence', e.target.value)}
                placeholder="70"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marketTrend">Рыночный тренд</Label>
              <Select
                value={formData.marketTrend}
                onValueChange={(value) => handleInputChange('marketTrend', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GROWING">Рост</SelectItem>
                  <SelectItem value="STABLE">Стабильный</SelectItem>
                  <SelectItem value="DECLINING">Снижение</SelectItem>
                  <SelectItem value="VOLATILE">Нестабильный</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="methodology">Методология</Label>
              <Select
                value={formData.methodology}
                onValueChange={(value) => handleInputChange('methodology', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STATISTICAL">Статистическая</SelectItem>
                  <SelectItem value="MACHINE_LEARNING">Машинное обучение</SelectItem>
                  <SelectItem value="EXPERT_OPINION">Экспертная оценка</SelectItem>
                  <SelectItem value="COMBINED">Комбинированная</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Примечания</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Дополнительные комментарии к прогнозу..."
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Calendar className="mr-2 h-4 w-4 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Создать прогноз
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({
                budgetPlanId: '',
                name: '',
                forecastType: 'QUARTERLY',
                startDate: '',
                endDate: '',
                periodType: 'QUARTER',
                totalQuantity: '',
                totalRevenue: '',
                averagePrice: '',
                growthRate: '',
                seasonality: '',
                marketTrend: 'STABLE',
                confidence: '70',
                methodology: 'STATISTICAL',
                notes: ''
              })}
            >
              Очистить
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
