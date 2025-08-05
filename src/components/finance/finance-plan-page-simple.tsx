"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, Calculator, DollarSign, TrendingUp } from "lucide-react"

export function FinancePlanPageSimple() {
  const [isLoading, setIsLoading] = useState(false)
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Финансовое планирование</h1>
          <p className="text-muted-foreground">Прогноз продаж и распределение бюджета</p>
        </div>
        <Button onClick={() => setIsLoading(!isLoading)} className="flex items-center gap-2">
          <Save className="h-4 w-4" /> Сохранить план
        </Button>
      </div>

      <Card className="shadow-lg rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-500" />
            Модуль финансового планирования
          </CardTitle>
          <CardDescription>
            Система загружается... Проверка компонентов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-green-500" />
                <div>
                  <h3 className="font-semibold">Прогноз продаж</h3>
                  <p className="text-sm text-slate-600">9,660,000 руб.</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold">Общие расходы</h3>
                  <p className="text-sm text-slate-600">9,079,300 руб.</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
                <div>
                  <h3 className="font-semibold">Чистая прибыль</h3>
                  <p className="text-sm text-slate-600">580,700 руб.</p>
                </div>
              </div>
            </Card>
          </div>
          
          {isLoading && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800">Загрузка компонентов... Это может занять несколько секунд.</p>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Статус системы</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Базовые компоненты UI загружены</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Навигация работает</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Проверка сложных компонентов...</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
