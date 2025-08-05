'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calculator, DollarSign, Percent } from 'lucide-react'

interface OrderItem {
  id: string
  itemName: string
  quantity: number
  unitCost: number
  lineCost: number
  linePriceNoVat: number
  vatAmount: number
  linePriceWithVat: number
  markupType: 'percent' | 'absolute'
  markupValue: number
  manualPrice?: number
  materials: OrderItemMaterial[]
  workTypes: OrderItemWorkType[]
  funds: OrderItemFund[]
}

interface OrderItemMaterial {
  calcCost: number
}

interface OrderItemWorkType {
  calcCost: number
}

interface OrderItemFund {
  calcCost: number
}

interface PriceCalculatorProps {
  item: OrderItem
  vatRate: number
  applyVat: boolean
  onUpdate: (updatedItem: OrderItem) => void
}

export function PriceCalculator({ item, vatRate, applyVat, onUpdate }: PriceCalculatorProps) {
  const [markupType, setMarkupType] = useState<'percent' | 'absolute'>(item.markupType)
  const [markupValue, setMarkupValue] = useState(item.markupValue)
  const [manualPrice, setManualPrice] = useState(item.manualPrice || 0)
  const [useManualPrice, setUseManualPrice] = useState(!!item.manualPrice)
  const [showWithVat, setShowWithVat] = useState(true)

  // Расчет себестоимости
  const materialsCost = item.materials.reduce((sum, m) => sum + m.calcCost, 0)
  const worksCost = item.workTypes.reduce((sum, w) => sum + w.calcCost, 0)
  const fundsCost = item.funds.reduce((sum, f) => sum + f.calcCost, 0)
  const unitCost = materialsCost + worksCost + fundsCost
  const lineCost = unitCost

  // Расчет цены
  let linePriceNoVat: number
  
  if (useManualPrice) {
    linePriceNoVat = manualPrice
  } else {
    if (markupType === 'percent') {
      linePriceNoVat = lineCost * (1 + markupValue / 100)
    } else {
      linePriceNoVat = lineCost + markupValue
    }
  }

  // Расчет НДС
  const vatAmount = applyVat ? linePriceNoVat * (vatRate / 100) : 0
  const linePriceWithVat = linePriceNoVat + vatAmount

  // Расчет маржи
  const marginAmount = linePriceNoVat - lineCost
  const marginPercent = lineCost > 0 ? (marginAmount / lineCost) * 100 : 0

  // Обновление позиции при изменении параметров
  useEffect(() => {
    const updatedItem = {
      ...item,
      unitCost,
      lineCost,
      linePriceNoVat,
      vatAmount,
      linePriceWithVat,
      markupType,
      markupValue,
      manualPrice: useManualPrice ? manualPrice : undefined
    }
    
    onUpdate(updatedItem)
  }, [markupType, markupValue, manualPrice, useManualPrice, unitCost, lineCost, vatRate, applyVat])

  return (
    <div className="space-y-6">
      {/* Структура себестоимости */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Структура себестоимости
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Материалы:</span>
                <span className="font-medium">{materialsCost.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Работы:</span>
                <span className="font-medium">{worksCost.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Фонды:</span>
                <span className="font-medium">{fundsCost.toLocaleString('ru-RU')} ₽</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Себестоимость:</span>
                <span>{lineCost.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">За единицу:</span>
                <span className="font-medium">{(unitCost / (item.quantity || 1)).toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Количество:</span>
                <span className="font-medium">{item.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Маржа:</span>
                <span className={`font-medium ${marginPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marginPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Наценка менеджера */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Наценка менеджера
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="manual-price"
              checked={useManualPrice}
              onCheckedChange={setUseManualPrice}
            />
            <Label htmlFor="manual-price">Ручная цена</Label>
          </div>

          {useManualPrice ? (
            <div>
              <Label>Цена без НДС (₽)</Label>
              <Input
                type="number"
                step="0.01"
                value={manualPrice}
                onChange={(e) => setManualPrice(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Тип наценки</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    size="sm"
                    variant={markupType === 'percent' ? 'default' : 'outline'}
                    onClick={() => setMarkupType('percent')}
                  >
                    Процент
                  </Button>
                  <Button
                    size="sm"
                    variant={markupType === 'absolute' ? 'default' : 'outline'}
                    onClick={() => setMarkupType('absolute')}
                  >
                    Сумма
                  </Button>
                </div>
              </div>

              <div>
                <Label>
                  {markupType === 'percent' ? 'Наценка (%)' : 'Наценка (₽)'}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={markupValue}
                  onChange={(e) => setMarkupValue(parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Итоговые суммы */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Итоговые суммы
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="show-with-vat"
                checked={showWithVat}
                onCheckedChange={setShowWithVat}
              />
              <Label htmlFor="show-with-vat" className="text-sm">С НДС</Label>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Себестоимость:</span>
                  <span>{lineCost.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Наценка:</span>
                  <span className={marginAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {marginAmount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Цена без НДС:</span>
                  <span>{linePriceNoVat.toLocaleString('ru-RU')} ₽</span>
                </div>
                {applyVat && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">НДС ({vatRate}%):</span>
                      <span>{vatAmount.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Цена с НДС:</span>
                      <span>{linePriceWithVat.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">За единицу:</span>
                  <span>
                    {(showWithVat && applyVat ? linePriceWithVat : linePriceNoVat / item.quantity).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Маржа:</span>
                  <span className={marginPercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {marginPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Маржа в ₽:</span>
                  <span className={marginAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {marginAmount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            </div>

            {/* Индикатор прибыльности */}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Прибыльность:</span>
                <Badge 
                  variant={marginPercent >= 20 ? 'default' : marginPercent >= 10 ? 'secondary' : 'destructive'}
                >
                  {marginPercent >= 20 ? 'Высокая' : marginPercent >= 10 ? 'Средняя' : 'Низкая'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Сохранение как новый товар */}
      <Card>
        <CardHeader>
          <CardTitle>Сохранить состав</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Сохранить текущий состав и цену как новый товар в каталоге
            </p>
            <Button variant="outline" className="w-full">
              Сохранить как новый товар
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
