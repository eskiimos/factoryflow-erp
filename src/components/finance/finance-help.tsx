"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calculator, DollarSign, TrendingUp, HelpCircle } from "lucide-react"

export function FinanceHelp() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <HelpCircle className="h-5 w-5" />
          Краткое руководство
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start gap-2">
            <Calculator className="h-4 w-4 text-blue-600 mt-1" />
            <div>
              <Badge variant="outline" className="text-xs mb-1">Прогноз продаж</Badge>
              <p className="text-xs text-slate-700">
                Настройте лиды, конверсию и средний чек для расчета прогноза выручки
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <DollarSign className="h-4 w-4 text-green-600 mt-1" />
            <div>
              <Badge variant="outline" className="text-xs mb-1">Бюджет</Badge>
              <p className="text-xs text-slate-700">
                Распределите расходы по категориям и отредактируйте статьи затрат
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600 mt-1" />
            <div>
              <Badge variant="outline" className="text-xs mb-1">Аналитика</Badge>
              <p className="text-xs text-slate-700">
                Анализируйте KPI и сравнивайте с отраслевыми стандартами
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-blue-700 bg-white p-2 rounded border border-blue-200">
          <strong>Совет:</strong> Начните с настройки прогноза продаж, затем распределите бюджет и проанализируйте результаты во вкладке "Аналитика"
        </div>
      </CardContent>
    </Card>
  )
}
