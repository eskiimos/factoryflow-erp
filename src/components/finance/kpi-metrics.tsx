"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Target, Calendar, DollarSign } from "lucide-react"

type KPIMetricsProps = {
  totalRevenue: number
  totalExpenses: number
  profit: number
}

export function KPIMetrics({ totalRevenue, totalExpenses, profit }: KPIMetricsProps) {
  const profitMargin = (profit / totalRevenue) * 100
  const roi = (profit / totalExpenses) * 100
  const breakEvenMonths = totalExpenses / (totalRevenue / 6) // Примерный расчет
  
  const metrics = [
    {
      title: "Маржинальность",
      value: `${profitMargin.toFixed(1)}%`,
      description: "Прибыль от выручки",
      icon: TrendingUp,
      color: profitMargin > 10 ? "text-green-600" : profitMargin > 5 ? "text-yellow-600" : "text-red-600",
      bgColor: profitMargin > 10 ? "bg-green-50" : profitMargin > 5 ? "bg-yellow-50" : "bg-red-50"
    },
    {
      title: "ROI",
      value: `${roi.toFixed(1)}%`,
      description: "Возврат инвестиций",
      icon: Target,
      color: roi > 20 ? "text-green-600" : roi > 10 ? "text-yellow-600" : "text-red-600",
      bgColor: roi > 20 ? "bg-green-50" : roi > 10 ? "bg-yellow-50" : "bg-red-50"
    },
    {
      title: "Точка безубыточности",
      value: `${breakEvenMonths.toFixed(1)} мес`,
      description: "Срок окупаемости",
      icon: Calendar,
      color: breakEvenMonths < 3 ? "text-green-600" : breakEvenMonths < 6 ? "text-yellow-600" : "text-red-600",
      bgColor: breakEvenMonths < 3 ? "bg-green-50" : breakEvenMonths < 6 ? "bg-yellow-50" : "bg-red-50"
    },
    {
      title: "Чистая прибыль",
      value: `${new Intl.NumberFormat('ru-RU').format(profit)} ₽`,
      description: "За планируемый период",
      icon: DollarSign,
      color: profit > 0 ? "text-green-600" : "text-red-600",
      bgColor: profit > 0 ? "bg-green-50" : "bg-red-50"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className={`${metric.bgColor} border-none shadow-lg`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                <p className="text-xs text-slate-500 mt-1">{metric.description}</p>
              </div>
              <div className={`p-2 rounded-lg ${metric.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
