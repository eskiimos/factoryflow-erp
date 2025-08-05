"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calculator, TrendingUp } from "lucide-react"

export function SalesForecast() {
  const [forecast, setForecast] = useState({
    averageCheck: 15000,
    leadsPerMonth: 644,
    conversionRate: 50,
    dealCycleDays: 15
  })
  
  const [results, setResults] = useState({
    salesPerMonth: 0,
    periods: [
      { days: 30, label: "1 месяц", forecast: 0 },
      { days: 60, label: "2 месяца", forecast: 0 },
      { days: 90, label: "3 месяца", forecast: 0 },
      { days: 120, label: "4 месяца", forecast: 0 },
      { days: 150, label: "5 месяцев", forecast: 0 },
      { days: 180, label: "6 месяцев", forecast: 0 },
    ]
  })
  
  useEffect(() => {
    // Расчет количества продаж в месяц
    const salesPerMonth = Math.round(forecast.leadsPerMonth * (forecast.conversionRate / 100))
    
    // Расчет прогноза для каждого периода
    const periods = results.periods.map(period => {
      // Формула: количество продаж в месяц * средний чек * (период в месяцах) / (цикл сделки в месяцах)
      const periodInMonths = period.days / 30
      const dealCycleInMonths = forecast.dealCycleDays / 30
      const forecastValue = salesPerMonth * forecast.averageCheck * periodInMonths / dealCycleInMonths
      
      return {
        ...period,
        forecast: Math.round(forecastValue)
      }
    })
    
    setResults({
      salesPerMonth,
      periods
    })
  }, [forecast])
  
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-500" />
            Калькулятор прогноза продаж
          </CardTitle>
          <CardDescription>
            Настройте параметры воронки продаж для расчета прогноза выручки
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="average-check">Средний чек, руб.</Label>
            <Input 
              id="average-check"
              type="number"
              value={forecast.averageCheck}
              onChange={(e) => setForecast({...forecast, averageCheck: Number(e.target.value)})}
            />
            <p className="text-xs text-slate-500">Средняя сумма одной сделки</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="leads">Количество лидов в месяц</Label>
            <Input 
              id="leads"
              type="number"
              value={forecast.leadsPerMonth}
              onChange={(e) => setForecast({...forecast, leadsPerMonth: Number(e.target.value)})}
            />
            <p className="text-xs text-slate-500">Общее количество потенциальных клиентов</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="conversion">Конверсия, %</Label>
            <Input 
              id="conversion"
              type="number"
              max="100"
              value={forecast.conversionRate}
              onChange={(e) => setForecast({...forecast, conversionRate: Number(e.target.value)})}
            />
            <p className="text-xs text-slate-500">
              Процент лидов, которые становятся клиентами
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cycle">Цикл сделки, дней</Label>
            <Input 
              id="cycle"
              type="number"
              value={forecast.dealCycleDays}
              onChange={(e) => setForecast({...forecast, dealCycleDays: Number(e.target.value)})}
            />
            <p className="text-xs text-slate-500">Время от первого контакта до закрытия сделки</p>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">Расчетные показатели</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Продаж в месяц:</span>
                <span className="font-semibold">{results.salesPerMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Выручка в месяц:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('ru-RU').format(results.salesPerMonth * forecast.averageCheck)} ₽
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Прогноз выручки по периодам</CardTitle>
          <CardDescription>
            Планируемая выручка на различные временные горизонты
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Период</TableHead>
                <TableHead className="text-right">Дней</TableHead>
                <TableHead className="text-right">Прогноз выручки</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.periods.map((period) => (
                <TableRow key={period.label}>
                  <TableCell className="font-medium">{period.label}</TableCell>
                  <TableCell className="text-right">{period.days}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {new Intl.NumberFormat('ru-RU').format(period.forecast)} ₽
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-2">Формула расчета</div>
            <p className="text-xs text-slate-700">
              <strong>Выручка = </strong>
              Продаж в месяц × Средний чек × Период (мес.) ÷ Цикл сделки (мес.)
            </p>
            <div className="mt-2 text-xs text-slate-600">
              <div>Продаж в месяц = Лиды в месяц × Конверсия (%)</div>
              <div>Пример: {forecast.leadsPerMonth} × {forecast.conversionRate}% = {results.salesPerMonth} продаж</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="text-sm font-medium text-green-800 mb-1">Рекомендуемый бюджет для планирования</div>
            <div className="text-lg font-bold text-green-700">
              {new Intl.NumberFormat('ru-RU').format(results.periods[5]?.forecast || 0)} ₽
            </div>
            <p className="text-xs text-slate-600">Прогноз на 6 месяцев для годового планирования</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
