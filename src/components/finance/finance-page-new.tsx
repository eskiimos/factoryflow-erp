"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator, DollarSign, TrendingUp, Save } from "lucide-react"

export function FinancePageNew() {
  const [salesData, setSalesData] = useState({
    averageCheck: 15000,
    leadsPerMonth: 644,
    conversionRate: 50,
    dealCycleDays: 15
  })

  const [budget, setBudget] = useState({
    revenue: 9660000,
    categories: [
      { name: "Фонд оплаты труда", amount: 3400000, percent: 35.2 },
      { name: "Сырье и материалы", amount: 1690000, percent: 17.5 },
      { name: "Налоги", amount: 1350000, percent: 14.0 },
      { name: "Постоянные расходы", amount: 1240000, percent: 12.8 },
      { name: "Маркетинг", amount: 820000, percent: 8.5 },
      { name: "Развитие", amount: 580000, percent: 6.0 }
    ]
  })

  // Расчеты
  const salesPerMonth = Math.round(salesData.leadsPerMonth * (salesData.conversionRate / 100))
  const monthlyRevenue = salesPerMonth * salesData.averageCheck
  const sixMonthForecast = monthlyRevenue * 6 * (30 / salesData.dealCycleDays)
  
  const totalExpenses = budget.categories.reduce((sum, cat) => sum + cat.amount, 0)
  const profit = budget.revenue - totalExpenses
  const profitMargin = (profit / budget.revenue * 100).toFixed(1)

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Финансовое планирование</h1>
          <p className="text-gray-600 mt-2">Прогноз продаж и управление бюджетом</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Сохранить план
        </Button>
      </div>

      {/* KPI Карточки */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Прогноз выручки</p>
                <p className="text-2xl font-bold text-blue-800">
                  {new Intl.NumberFormat('ru-RU').format(Math.round(sixMonthForecast))} ₽
                </p>
                <p className="text-xs text-blue-600">на 6 месяцев</p>
              </div>
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Чистая прибыль</p>
                <p className="text-2xl font-bold text-green-800">
                  {new Intl.NumberFormat('ru-RU').format(profit)} ₽
                </p>
                <p className="text-xs text-green-600">{profitMargin}% маржа</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Общие расходы</p>
                <p className="text-2xl font-bold text-orange-800">
                  {new Intl.NumberFormat('ru-RU').format(totalExpenses)} ₽
                </p>
                <p className="text-xs text-orange-600">
                  {((totalExpenses / budget.revenue) * 100).toFixed(1)}% от выручки
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Продаж в месяц</p>
                <p className="text-2xl font-bold text-purple-800">{salesPerMonth}</p>
                <p className="text-xs text-purple-600">при {salesData.conversionRate}% конверсии</p>
              </div>
              <Calculator className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Прогноз продаж */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Калькулятор прогноза продаж
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="avgCheck">Средний чек (руб.)</Label>
              <Input
                id="avgCheck"
                type="number"
                value={salesData.averageCheck}
                onChange={(e) => setSalesData({
                  ...salesData, 
                  averageCheck: Number(e.target.value)
                })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="leads">Лидов в месяц</Label>
              <Input
                id="leads"
                type="number"
                value={salesData.leadsPerMonth}
                onChange={(e) => setSalesData({
                  ...salesData, 
                  leadsPerMonth: Number(e.target.value)
                })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="conversion">Конверсия (%)</Label>
              <Input
                id="conversion"
                type="number"
                min="0"
                max="100"
                value={salesData.conversionRate}
                onChange={(e) => setSalesData({
                  ...salesData, 
                  conversionRate: Number(e.target.value)
                })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cycle">Цикл сделки (дней)</Label>
              <Input
                id="cycle"
                type="number"
                value={salesData.dealCycleDays}
                onChange={(e) => setSalesData({
                  ...salesData, 
                  dealCycleDays: Number(e.target.value)
                })}
                className="mt-1"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Результат расчета</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Продаж в месяц:</span>
                  <span className="font-semibold">{salesPerMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span>Выручка в месяц:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat('ru-RU').format(monthlyRevenue)} ₽
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span>Прогноз на 6 мес:</span>
                  <span className="font-bold text-blue-700">
                    {new Intl.NumberFormat('ru-RU').format(Math.round(sixMonthForecast))} ₽
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Распределение бюджета */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Распределение бюджета
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label htmlFor="revenue">Общий бюджет (руб.)</Label>
                <Input
                  id="revenue"
                  type="number"
                  value={budget.revenue}
                  onChange={(e) => setBudget({
                    ...budget, 
                    revenue: Number(e.target.value)
                  })}
                  className="mt-1"
                />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Категории расходов</h4>
                {budget.categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{category.name}</div>
                      <div className="text-xs text-gray-500">{category.percent}% от бюджета</div>
                    </div>
                    <div className="text-right">
                      <Input
                        type="number"
                        value={category.amount}
                        onChange={(e) => {
                          const newCategories = [...budget.categories]
                          newCategories[index].amount = Number(e.target.value)
                          newCategories[index].percent = Number(((Number(e.target.value) / budget.revenue) * 100).toFixed(1))
                          setBudget({ ...budget, categories: newCategories })
                        }}
                        className="w-32 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Итоги</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Общий бюджет:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('ru-RU').format(budget.revenue)} ₽
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Всего расходов:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('ru-RU').format(totalExpenses)} ₽
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span>Прибыль:</span>
                    <span className={`font-bold ${profit > 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {new Intl.NumberFormat('ru-RU').format(profit)} ₽
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Маржинальность:</span>
                    <span className={`font-semibold ${profit > 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {profitMargin}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
