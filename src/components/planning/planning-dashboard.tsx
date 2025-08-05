'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react"

interface PlanningDashboardProps {
  budgetPlans: any[]
  salesForecasts: any[]
  loading: boolean
}

export default function PlanningDashboard({ budgetPlans, salesForecasts, loading }: PlanningDashboardProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  // Подсчет статистики
  const activeBudgetPlans = budgetPlans.filter(plan => plan.status === 'ACTIVE').length
  const totalPlannedRevenue = budgetPlans.reduce((sum, plan) => sum + (plan.totalRevenue || 0), 0)
  const totalPlannedCosts = budgetPlans.reduce((sum, plan) => sum + (plan.totalCosts || 0), 0)
  const totalTargetProfit = budgetPlans.reduce((sum, plan) => sum + (plan.targetProfit || 0), 0)
  
  const activeSalesForecasts = salesForecasts.filter(forecast => forecast.isActive).length
  const totalForecastRevenue = salesForecasts.reduce((sum, forecast) => sum + (forecast.totalRevenue || 0), 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Основные показатели */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные планы</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBudgetPlans}</div>
            <p className="text-xs text-muted-foreground">
              из {budgetPlans.length} всего
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Плановая выручка</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPlannedRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              по всем активным планам
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Плановые расходы</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPlannedCosts)}</div>
            <p className="text-xs text-muted-foreground">
              материалы и труд
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Целевая прибыль</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalTargetProfit)}</div>
            <p className="text-xs text-muted-foreground">
              планируемая прибыль
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Детальная информация */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Последние бюджетные планы</CardTitle>
            <CardDescription>
              Недавно созданные планы
            </CardDescription>
          </CardHeader>
          <CardContent>
            {budgetPlans.length === 0 ? (
              <div className="text-center py-6">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500">Нет бюджетных планов</p>
              </div>
            ) : (
              <div className="space-y-3">
                {budgetPlans.slice(0, 3).map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-sm text-gray-500">{plan.planType}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(plan.totalRevenue)}</p>
                      <p className="text-sm text-gray-500">{plan.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Прогнозы продаж</CardTitle>
            <CardDescription>
              Активные прогнозы
            </CardDescription>
          </CardHeader>
          <CardContent>
            {salesForecasts.length === 0 ? (
              <div className="text-center py-6">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500">Нет прогнозов продаж</p>
              </div>
            ) : (
              <div className="space-y-3">
                {salesForecasts.slice(0, 3).map((forecast) => (
                  <div key={forecast.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{forecast.name}</p>
                      <p className="text-sm text-gray-500">{forecast.forecastType}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(forecast.totalRevenue)}</p>
                      <p className="text-sm text-gray-500">{forecast.confidence}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
