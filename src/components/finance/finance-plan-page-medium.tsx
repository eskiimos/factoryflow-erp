"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseCategoryCard } from "./expense-category-card"
import { SalesForecast } from "./sales-forecast"
import { FinanceHelp } from "./finance-help"
import { Plus, Save, Calculator, TrendingUp, DollarSign } from "lucide-react"

export function FinancePlanPageMedium() {
  const [plan, setPlan] = useState({
    name: "Финансовый план 2025",
    startDate: new Date(),
    revenue: 9660000,
    categories: [
      {
        id: "1",
        name: "Фонд оплаты труда",
        percentOfRevenue: 35.2,
        color: "#3B82F6",
        items: [
          { id: "1", name: "Руководители", amount: 300000 },
          { id: "2", name: "Специалисты", amount: 450000 },
          { id: "3", name: "Рабочие", amount: 380000 },
          { id: "4", name: "Социальные взносы", amount: 339000 },
        ]
      },
      {
        id: "2",
        name: "Сырье и материалы",
        percentOfRevenue: 17.5,
        color: "#10B981",
        items: [
          { id: "1", name: "Металлопрокат", amount: 850000 },
          { id: "2", name: "Крепеж", amount: 250000 },
          { id: "3", name: "Электрокомпоненты", amount: 400000 },
          { id: "4", name: "Прочие материалы", amount: 190000 },
        ]
      },
      {
        id: "3",
        name: "Налоги",
        percentOfRevenue: 14.0,
        color: "#F59E0B",
        items: [
          { id: "1", name: "НДС", amount: 600000 },
          { id: "2", name: "Налог на прибыль", amount: 450000 },
          { id: "3", name: "Прочие налоги", amount: 302400 },
        ]
      }
    ]
  })
  
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [profit, setProfit] = useState(0)
  
  useEffect(() => {
    const total = plan.categories.reduce((acc, category) => {
      const categoryTotal = category.items.reduce((sum, item) => sum + item.amount, 0)
      return acc + categoryTotal
    }, 0)
    
    setTotalExpenses(total)
    setProfit(plan.revenue - total)
  }, [plan])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Финансовое планирование</h1>
          <p className="text-muted-foreground">Прогноз продаж и распределение бюджета</p>
        </div>
        <Button className="flex items-center gap-2">
          <Save className="h-4 w-4" /> Сохранить план
        </Button>
      </div>

      <FinanceHelp />

      <Tabs defaultValue="forecast" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forecast" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Прогноз продаж
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Бюджет
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Аналитика
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-6">
          <SalesForecast />
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle>Основные параметры</CardTitle>
              <CardDescription>Настройте базовые параметры финансового плана</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Название плана</label>
                <Input 
                  value={plan.name}
                  onChange={(e) => setPlan({...plan, name: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Общий бюджет (руб.)</label>
                <Input 
                  type="number"
                  value={plan.revenue}
                  onChange={(e) => setPlan({...plan, revenue: parseFloat(e.target.value)})}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {plan.categories.map((category) => (
              <ExpenseCategoryCard 
                key={category.id}
                category={category}
                totalRevenue={plan.revenue}
                onCategoryChange={(updatedCategory: any) => {
                  setPlan({
                    ...plan,
                    categories: plan.categories.map((c) => 
                      c.id === updatedCategory.id ? updatedCategory : c
                    )
                  })
                }}
              />
            ))}
          </div>
          
          <Card className="shadow-lg rounded-xl bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle>Итоговые показатели</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Планируемая выручка</h3>
                <p className="text-2xl font-bold">{new Intl.NumberFormat('ru-RU').format(plan.revenue)} ₽</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Общие расходы</h3>
                <p className="text-2xl font-bold text-red-600">{new Intl.NumberFormat('ru-RU').format(totalExpenses)} ₽</p>
                <p className="text-sm">({((totalExpenses / plan.revenue) * 100).toFixed(1)}%)</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Чистая прибыль</h3>
                <p className="text-2xl font-bold text-emerald-600">{new Intl.NumberFormat('ru-RU').format(profit)} ₽</p>
                <p className="text-sm">({((profit / plan.revenue) * 100).toFixed(1)}%)</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Рентабельность</h3>
                <p className="text-2xl font-bold text-blue-600">{((profit / totalExpenses) * 100).toFixed(1)}%</p>
                <p className="text-sm">ROI</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle>Детальный анализ расходов</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Категория</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                    <TableHead className="text-right">% от выручки</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.categories
                    .sort((a, b) => {
                      const aTotal = a.items.reduce((sum, item) => sum + item.amount, 0)
                      const bTotal = b.items.reduce((sum, item) => sum + item.amount, 0)
                      return bTotal - aTotal
                    })
                    .map((category) => {
                      const categoryTotal = category.items.reduce((sum, item) => sum + item.amount, 0)
                      const percentage = (categoryTotal / plan.revenue) * 100
                      return (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {new Intl.NumberFormat('ru-RU').format(categoryTotal)} ₽
                          </TableCell>
                          <TableCell className="text-right">
                            {percentage.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
