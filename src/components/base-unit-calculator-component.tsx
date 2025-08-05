'use client'

import { useState, useEffect } from 'react'
import { Calculator, TrendingUp, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BaseUnitCalculation } from '@/lib/base-unit-calculator'
import { cn } from '@/lib/utils'

interface BaseUnitCalculatorProps {
  productId?: string
  baseUnit: string
  onCalculationUpdate?: (calculation: BaseUnitCalculation) => void
  className?: string
}

export function BaseUnitCalculatorComponent({ 
  productId, 
  baseUnit, 
  onCalculationUpdate,
  className 
}: BaseUnitCalculatorProps) {
  const [calculation, setCalculation] = useState<BaseUnitCalculation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sellingPrice, setSellingPrice] = useState<number>(0)
  const [quantity, setQuantity] = useState<number>(1)

  useEffect(() => {
    if (productId && baseUnit) {
      calculateCost()
    }
  }, [productId, baseUnit])

  const calculateCost = async () => {
    if (!productId || !baseUnit) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/products/calculate-base-unit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId, 
          baseUnit,
          sellingPrice 
        })
      })

      const data = await response.json()

      if (data.success) {
        setCalculation(data.data)
        onCalculationUpdate?.(data.data)
      } else {
        setError(data.error || 'Ошибка расчета')
      }
    } catch (error) {
      console.error('Error calculating cost:', error)
      setError('Ошибка подключения к серверу')
    } finally {
      setLoading(false)
    }
  }

  const getMarginColor = (percentage: number) => {
    if (percentage < 10) return 'text-red-600 bg-red-50'
    if (percentage < 20) return 'text-orange-600 bg-orange-50'
    if (percentage < 30) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getMarginRecommendation = (percentage: number) => {
    if (percentage < 10) return { icon: AlertCircle, message: 'Критически низкая маржа', color: 'text-red-600' }
    if (percentage < 20) return { icon: Info, message: 'Низкая маржа, рассмотрите увеличение цены', color: 'text-orange-600' }
    if (percentage < 30) return { icon: TrendingUp, message: 'Приемлемая маржа', color: 'text-yellow-600' }
    return { icon: CheckCircle2, message: 'Отличная маржа!', color: 'text-green-600' }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Calculator className="h-5 w-5 animate-spin" />
            <span>Рассчитываем стоимость...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <Button 
            onClick={calculateCost}
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Попробовать снова
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!calculation) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Выберите базовую единицу для расчета стоимости</p>
        </CardContent>
      </Card>
    )
  }

  const totalForQuantity = calculation.totalCostPerUnit * quantity
  const margin = sellingPrice * quantity - totalForQuantity
  const marginPercentage = totalForQuantity > 0 ? (margin / totalForQuantity) * 100 : 0
  const recommendation = getMarginRecommendation(marginPercentage)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Калькулятор стоимости
        </CardTitle>
        <CardDescription>
          Расчет на базовую единицу: <Badge variant="secondary">{calculation.baseUnitSymbol}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Основные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              ₽{calculation.materialCostPerUnit.toFixed(2)}
            </div>
            <div className="text-xs text-blue-800">Материалы/{calculation.baseUnitSymbol}</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              ₽{calculation.laborCostPerUnit.toFixed(2)}
            </div>
            <div className="text-xs text-green-800">Работы/{calculation.baseUnitSymbol}</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">
              ₽{calculation.overheadCostPerUnit.toFixed(2)}
            </div>
            <div className="text-xs text-orange-800">Накладные/{calculation.baseUnitSymbol}</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
            <div className="text-xl font-bold text-purple-600">
              ₽{calculation.totalCostPerUnit.toFixed(2)}
            </div>
            <div className="text-xs text-purple-800">Итого/{calculation.baseUnitSymbol}</div>
          </div>
        </div>

        {/* Калькулятор количества */}
        <div className="space-y-4">
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Количество ({calculation.baseUnitSymbol})</Label>
              <Input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="selling-price">Цена продажи за {calculation.baseUnitSymbol}</Label>
              <Input
                id="selling-price"
                type="number"
                min="0"
                step="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Итоговый расчет */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Себестоимость ({quantity} {calculation.baseUnitSymbol}):</span>
              <span className="font-medium">₽{totalForQuantity.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Цена продажи ({quantity} {calculation.baseUnitSymbol}):</span>
              <span className="font-medium">₽{(sellingPrice * quantity).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Прибыль:</span>
              <div className="text-right">
                <div className={cn("font-bold", margin >= 0 ? "text-green-600" : "text-red-600")}>
                  ₽{margin.toFixed(2)}
                </div>
                <div className={cn("text-xs px-2 py-1 rounded", getMarginColor(marginPercentage))}>
                  {marginPercentage.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Рекомендация */}
            {sellingPrice > 0 && (
              <div className={cn("flex items-center gap-2 text-sm", recommendation.color)}>
                <recommendation.icon className="h-4 w-4" />
                <span>{recommendation.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Детализация по компонентам */}
        <Tabs defaultValue="materials" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="materials">Материалы ({calculation.materialBreakdown.length})</TabsTrigger>
            <TabsTrigger value="labor">Работы ({calculation.laborBreakdown.length})</TabsTrigger>
            <TabsTrigger value="overhead">Накладные ({calculation.overheadBreakdown.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="materials" className="space-y-2">
            {calculation.materialBreakdown.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.usagePerBaseUnit} {item.unit} × ₽{item.pricePerUnit}
                  </div>
                </div>
                <div className="text-sm font-medium">₽{item.totalCost.toFixed(2)}</div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="labor" className="space-y-2">
            {calculation.laborBreakdown.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.timePerBaseUnit} ч × ₽{item.hourlyRate}/ч
                    {item.department && ` • ${item.department}`}
                  </div>
                </div>
                <div className="text-sm font-medium">₽{item.totalCost.toFixed(2)}</div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="overhead" className="space-y-2">
            {calculation.overheadBreakdown.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.allocationMethod}</div>
                </div>
                <div className="text-sm font-medium">₽{item.totalCost.toFixed(2)}</div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
