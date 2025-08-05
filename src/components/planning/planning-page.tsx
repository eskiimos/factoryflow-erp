'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, DollarSign, Calendar } from "lucide-react"
import BudgetPlansTab from './budget-plans-tab'
import SalesForecastsTab from './sales-forecasts-tab'
import PlanningDashboard from './planning-dashboard'

interface PlanningPageProps {
  categories: { id: string; name: string }[]
}

export default function PlanningPage({ categories }: PlanningPageProps) {
  const [budgetPlans, setBudgetPlans] = useState([])
  const [salesForecasts, setSalesForecasts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [budgetResponse, forecastResponse] = await Promise.all([
        fetch('/api/budget-plans'),
        fetch('/api/sales-forecasts')
      ])
      
      if (budgetResponse.ok) {
        const budgetData = await budgetResponse.json()
        setBudgetPlans(budgetData)
      }
      
      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json()
        setSalesForecasts(forecastData)
      }
    } catch (error) {
      console.error('Error fetching planning data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Планирование и прогнозы</h1>
          <p className="text-gray-600 mt-1">
            Управление бюджетами, фондами и прогнозами продаж
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp size={16} />
            Дашборд
          </TabsTrigger>
          <TabsTrigger value="budget-plans" className="flex items-center gap-2">
            <DollarSign size={16} />
            Бюджетные планы
          </TabsTrigger>
          <TabsTrigger value="sales-forecasts" className="flex items-center gap-2">
            <Calendar size={16} />
            Прогнозы продаж
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp size={16} />
            Аналитика
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <PlanningDashboard 
            budgetPlans={budgetPlans}
            salesForecasts={salesForecasts}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="budget-plans">
          <BudgetPlansTab 
            budgetPlans={budgetPlans}
            setBudgetPlans={setBudgetPlans}
            loading={loading}
            onRefresh={fetchData}
          />
        </TabsContent>

        <TabsContent value="sales-forecasts">
          <SalesForecastsTab 
            salesForecasts={salesForecasts}
            setSalesForecasts={setSalesForecasts}
            budgetPlans={budgetPlans}
            categories={categories}
            loading={loading}
            onRefresh={fetchData}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Аналитика планирования</CardTitle>
              <CardDescription>
                Анализ выполнения планов и точности прогнозов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Аналитика в разработке
                </h3>
                <p className="text-gray-500">
                  Здесь будут графики и отчеты по выполнению планов
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
