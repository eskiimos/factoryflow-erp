'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calculator, RefreshCw } from 'lucide-react'

interface OrderItem {
  id: string
  itemName: string
  quantity: number
  effectiveQuantity?: number
  calculationParameters?: Record<string, any>
  parameterValues: OrderItemParameterValue[]
}

interface OrderItemParameterValue {
  id: string
  parameterName: string
  value: string
  unit?: string
}

interface ParametersFormProps {
  item: OrderItem
  onUpdate: (updatedItem: OrderItem) => void
}

export function ParametersForm({ item, onUpdate }: ParametersFormProps) {
  const [parameters, setParameters] = useState<Record<string, any>>(
    item.calculationParameters ? JSON.parse(JSON.stringify(item.calculationParameters)) : {}
  )
  const [isCalculating, setIsCalculating] = useState(false)

  // Обновление значения параметра
  const updateParameter = (paramName: string, value: any) => {
    const updatedParams = {
      ...parameters,
      [paramName]: value
    }
    setParameters(updatedParams)
  }

  // Пересчет эффективного количества
  const recalculateEffectiveQuantity = async () => {
    setIsCalculating(true)
    
    try {
      // Отправляем запрос на пересчет
      const response = await fetch(`/api/orders/calculator/${item.id}/recalculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parameters,
          quantity: item.quantity
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Обновляем позицию с новыми значениями
        const updatedItem = {
          ...item,
          effectiveQuantity: result.effectiveQuantity,
          calculationParameters: parameters
        }
        
        onUpdate(updatedItem)
      }
    } catch (error) {
      console.error('Ошибка пересчета:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  // Применение изменений
  const applyChanges = () => {
    const updatedItem = {
      ...item,
      calculationParameters: parameters
    }
    
    onUpdate(updatedItem)
    recalculateEffectiveQuantity()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Параметры расчета
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Базовое количество */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Количество (базовое)</Label>
              <div className="mt-1 p-2 bg-muted rounded-md text-sm">
                {item.quantity} {item.parameterValues.find(p => p.parameterName === 'unit')?.value || 'шт'}
              </div>
            </div>
            <div>
              <Label>Эффективное количество</Label>
              <div className="mt-1 p-2 bg-muted rounded-md text-sm font-medium">
                {item.effectiveQuantity ? (
                  <>
                    {item.effectiveQuantity.toFixed(2)}
                    {item.effectiveQuantity !== item.quantity && (
                      <Badge variant="secondary" className="ml-2">Рассчитано</Badge>
                    )}
                  </>
                ) : (
                  item.quantity
                )}
              </div>
            </div>
          </div>

          {/* Параметры формулы */}
          {item.parameterValues.length > 0 ? (
            <div>
              <Label className="text-base font-medium">Параметры формулы</Label>
              <div className="mt-3 grid grid-cols-2 gap-4">
                {item.parameterValues.map((param) => (
                  <div key={param.id}>
                    <Label className="text-sm">
                      {param.parameterName}
                      {param.unit && <span className="text-muted-foreground"> ({param.unit})</span>}
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={parameters[param.parameterName] || param.value}
                      onChange={(e) => updateParameter(param.parameterName, parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Формульные параметры не настроены для данного товара</p>
              <p className="text-sm">Используется простой расчет по количеству</p>
            </div>
          )}

          {/* Кнопки действий */}
          {item.parameterValues.length > 0 && (
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={applyChanges}
                disabled={isCalculating}
                className="flex-1"
              >
                {isCalculating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Пересчет...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Пересчитать
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Формула расчета (если есть) */}
          {item.parameterValues.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="text-sm">
                  <div className="font-medium mb-2">Формула расчета:</div>
                  <div className="font-mono text-xs bg-background p-2 rounded border">
                    {/* Здесь можно показать формулу, если она доступна */}
                    эффективное_количество = f({item.parameterValues.map(p => p.parameterName).join(', ')})
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Изменение параметров приведет к пересчету эффективного количества и обновлению стоимости всех материалов и работ
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Предпросмотр расчета */}
      <Card>
        <CardHeader>
          <CardTitle>Предпросмотр расчета</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Базовое количество:</span>
              <span className="font-medium">{item.quantity}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Эффективное количество:</span>
              <span className="font-medium">
                {item.effectiveQuantity?.toFixed(2) || item.quantity}
                {item.effectiveQuantity && item.effectiveQuantity !== item.quantity && (
                  <Badge variant="outline" className="ml-2">×{(item.effectiveQuantity / item.quantity).toFixed(2)}</Badge>
                )}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                Все материалы и работы будут умножены на эффективное количество
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
