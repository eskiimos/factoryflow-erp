"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

type IndustryBenchmarkProps = {
  categories: {
    name: string
    actualPercent: number
    color: string
  }[]
}

export function IndustryBenchmark({ categories }: IndustryBenchmarkProps) {
  // Отраслевые стандарты для производственных предприятий
  const benchmarks = {
    "Фонд оплаты труда": { min: 30, max: 40, optimal: 35 },
    "Фонд сырья и материалов": { min: 15, max: 25, optimal: 20 },
    "Налоги и обязательные платежи": { min: 12, max: 16, optimal: 14 },
    "Постоянные расходы": { min: 10, max: 15, optimal: 12 },
    "Маркетинг и продажи": { min: 5, max: 12, optimal: 8 },
    "Инвестиции и развитие": { min: 3, max: 8, optimal: 5 }
  }

  const getStatusIcon = (actual: number, benchmark: any) => {
    if (actual < benchmark.min) return <TrendingDown className="h-4 w-4 text-red-500" />
    if (actual > benchmark.max) return <TrendingUp className="h-4 w-4 text-yellow-500" />
    return <Minus className="h-4 w-4 text-green-500" />
  }

  const getStatusColor = (actual: number, benchmark: any) => {
    if (actual < benchmark.min || actual > benchmark.max) return "destructive"
    if (Math.abs(actual - benchmark.optimal) <= 2) return "default"
    return "secondary"
  }

  const getStatusText = (actual: number, benchmark: any) => {
    if (actual < benchmark.min) return "Ниже нормы"
    if (actual > benchmark.max) return "Выше нормы"
    if (Math.abs(actual - benchmark.optimal) <= 2) return "Оптимально"
    return "В норме"
  }

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle>Сравнение с отраслевыми стандартами</CardTitle>
        <p className="text-sm text-slate-600">
          Анализ структуры расходов относительно стандартов производственных предприятий
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category) => {
          const benchmark = benchmarks[category.name as keyof typeof benchmarks]
          if (!benchmark) return null

          return (
            <div key={category.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-sm">{category.name}</span>
                  {getStatusIcon(category.actualPercent, benchmark)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {category.actualPercent.toFixed(1)}%
                  </span>
                  <Badge variant={getStatusColor(category.actualPercent, benchmark)}>
                    {getStatusText(category.actualPercent, benchmark)}
                  </Badge>
                </div>
              </div>
              
              <div className="relative">
                <Progress 
                  value={(category.actualPercent / benchmark.max) * 100} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Мин: {benchmark.min}%</span>
                  <span>Опт: {benchmark.optimal}%</span>
                  <span>Макс: {benchmark.max}%</span>
                </div>
              </div>

              {(category.actualPercent < benchmark.min || category.actualPercent > benchmark.max) && (
                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                  <strong>Рекомендация:</strong> {
                    category.actualPercent < benchmark.min 
                      ? `Рассмотрите увеличение бюджета на "${category.name}" до ${benchmark.optimal}%`
                      : `Рекомендуется оптимизировать расходы на "${category.name}" до ${benchmark.optimal}%`
                  }
                </div>
              )}
            </div>
          )
        })}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Отраслевые стандарты</h4>
          <p className="text-sm text-blue-700">
            Данные основаны на статистике российских производственных предприятий среднего размера.
            Значения могут варьироваться в зависимости от специфики бизнеса и региона.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
