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
import { BudgetPieChart } from "./budget-pie-chart"
import { KPIMetrics } from "./kpi-metrics"
import { IndustryBenchmark } from "./industry-benchmark"
import { FinanceHelp } from "./finance-help"
import { Plus, Save, Calculator, TrendingUp, DollarSign } from "lucide-react"

export function FinancePlanPage() {
  const [plan, setPlan] = useState({
    name: "Финансовый план 2025",
    startDate: new Date(),
    revenue: 9660000, // Берем из прогноза продаж на 6 месяцев
    categories: [
      {
        id: "1",
        name: "Фонд оплаты труда",
        percentOfRevenue: 35.2,
        color: "#3B82F6",
        items: [
          { id: "1", name: "Петрова С. РОП менеджер", amount: 63000 },
          { id: "2", name: "Исламова М. менеджер", amount: 60000 },
          { id: "3", name: "Мохнева Р. менеджер", amount: 91000 },
          { id: "4", name: "Шишкин НПО/монтажник", amount: 70000 },
          { id: "5", name: "Литвинов Нач цеха/слесарь", amount: 74000 },
          { id: "6", name: "Савельев главный инженер", amount: 90000 },
          { id: "7", name: "Константин генеральный директор", amount: 120000 },
          { id: "8", name: "Мария главный бухгалтер", amount: 85000 },
          { id: "9", name: "Социальные взносы (30%)", amount: 195300 },
        ]
      },
      {
        id: "2",
        name: "Фонд сырья и материалов",
        percentOfRevenue: 17.5,
        color: "#10B981",
        items: [
          { id: "1", name: "Листовая сталь", amount: 450000 },
          { id: "2", name: "Профильная труба", amount: 280000 },
          { id: "3", name: "Крепежные элементы", amount: 120000 },
          { id: "4", name: "Сварочные материалы", amount: 95000 },
          { id: "5", name: "Краска и покрытия", amount: 85000 },
          { id: "6", name: "Электронные компоненты", amount: 340000 },
          { id: "7", name: "Упаковочные материалы", amount: 75000 },
          { id: "8", name: "Прочие материалы", amount: 245000 },
        ]
      },
      {
        id: "3",
        name: "Налоги и обязательные платежи",
        percentOfRevenue: 14.0,
        color: "#F59E0B",
        items: [
          { id: "1", name: "НДС (20%)", amount: 450000 },
          { id: "2", name: "Налог на прибыль (20%)", amount: 380000 },
          { id: "3", name: "Налог на имущество", amount: 45000 },
          { id: "4", name: "Транспортный налог", amount: 25000 },
          { id: "5", name: "Земельный налог", amount: 15000 },
          { id: "6", name: "Страховые взносы", amount: 435000 },
        ]
      },
      {
        id: "4",
        name: "Постоянные расходы",
        percentOfRevenue: 12.8,
        color: "#EF4444",
        items: [
          { id: "1", name: "Аренда производственного помещения", amount: 180000 },
          { id: "2", name: "Аренда офиса", amount: 85000 },
          { id: "3", name: "Коммунальные услуги", amount: 120000 },
          { id: "4", name: "Интернет и связь", amount: 15000 },
          { id: "5", name: "Охрана", amount: 45000 },
          { id: "6", name: "Страхование", amount: 55000 },
          { id: "7", name: "Банковское обслуживание", amount: 25000 },
          { id: "8", name: "Лицензии и подписки", amount: 35000 },
          { id: "9", name: "Техобслуживание оборудования", amount: 95000 },
          { id: "10", name: "Юридические услуги", amount: 45000 },
          { id: "11", name: "Бухгалтерские услуги", amount: 35000 },
          { id: "12", name: "Клининг", amount: 25000 },
          { id: "13", name: "Канцелярские товары", amount: 15000 },
          { id: "14", name: "Прочие расходы", amount: 55000 },
        ]
      },
      {
        id: "5",
        name: "Маркетинг и продажи",
        percentOfRevenue: 8.5,
        color: "#8B5CF6",
        items: [
          { id: "1", name: "Контекстная реклама", amount: 180000 },
          { id: "2", name: "SMM и контент-маркетинг", amount: 85000 },
          { id: "3", name: "Выставки и мероприятия", amount: 150000 },
          { id: "4", name: "Печатная реклама", amount: 45000 },
          { id: "5", name: "CRM система", amount: 25000 },
          { id: "6", name: "Представительские расходы", amount: 65000 },
          { id: "7", name: "Командировки", amount: 95000 },
          { id: "8", name: "Обучение персонала", amount: 45000 },
          { id: "9", name: "Бонусы отдела продаж", amount: 125000 },
        ]
      },
      {
        id: "6",
        name: "Инвестиции и развитие",
        percentOfRevenue: 6.0,
        color: "#06B6D4",
        items: [
          { id: "1", name: "Новое оборудование", amount: 250000 },
          { id: "2", name: "Модернизация производства", amount: 150000 },
          { id: "3", name: "IT-инфраструктура", amount: 85000 },
          { id: "4", name: "Разработка новых продуктов", amount: 120000 },
          { id: "5", name: "Сертификация продукции", amount: 45000 },
          { id: "6", name: "Патенты и лицензии", amount: 35000 },
          { id: "7", name: "Резерв на развитие", amount: 95000 },
        ]
      }
    ]
  })
  
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [profit, setProfit] = useState(0)
  
  useEffect(() => {
    // Рассчитываем общие расходы
    const total = plan.categories.reduce((acc, category) => {
      const categoryTotal = category.items.reduce((sum, item) => sum + item.amount, 0)
      return acc + categoryTotal
    }, 0)
    
    setTotalExpenses(total)
    setProfit(plan.revenue - total)
  }, [plan])

  const handleSavePlan = async () => {
    // Логика сохранения плана
    console.log("Сохранение плана:", plan)
  }

  // Подготовка данных для круговой диаграммы
  const chartData = plan.categories.map(category => ({
    name: category.name,
    value: category.items.reduce((sum, item) => sum + item.amount, 0),
    color: category.color
  }))

  // Подготовка данных для сравнения с отраслевыми стандартами  
  const benchmarkData = plan.categories.map(category => ({
    name: category.name,
    actualPercent: (category.items.reduce((sum, item) => sum + item.amount, 0) / plan.revenue) * 100,
    color: category.color
  }))

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Финансовое планирование</h1>
          <p className="text-muted-foreground">Прогноз продаж и распределение бюджета</p>
        </div>
        <Button onClick={handleSavePlan} className="flex items-center gap-2">
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
          <KPIMetrics 
            totalRevenue={plan.revenue}
            totalExpenses={totalExpenses}
            profit={profit}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BudgetPieChart data={chartData} />
            <IndustryBenchmark categories={benchmarkData} />
          </div>
            
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
