'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileText, Calculator, DollarSign, Percent } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  vatRate: number
  applyVat: boolean
  totalCostNoVat: number
  totalVatAmount: number
  totalCostWithVat: number
  items: OrderItem[]
}

interface OrderItem {
  id: string
  itemName: string
  quantity: number
  lineCost: number
  linePriceNoVat: number
  vatAmount: number
  linePriceWithVat: number
}

interface OrderSummaryProps {
  order: Order
  onVatChange: (vatRate: number, applyVat: boolean) => void
}

export function OrderSummary({ order, onVatChange }: OrderSummaryProps) {
  // Расчет общих показателей
  const totalCost = order.items.reduce((sum, item) => sum + item.lineCost, 0)
  const totalPriceNoVat = order.items.reduce((sum, item) => sum + item.linePriceNoVat, 0)
  const totalVat = order.items.reduce((sum, item) => sum + item.vatAmount, 0)
  const totalPriceWithVat = totalPriceNoVat + totalVat
  
  const totalMargin = totalPriceNoVat - totalCost
  const marginPercent = totalCost > 0 ? (totalMargin / totalCost) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Информация о заказе */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Информация о заказе
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-sm">Номер заказа</Label>
            <div className="mt-1 p-2 bg-muted rounded-md text-sm font-mono">
              {order.orderNumber}
            </div>
          </div>
          <div>
            <Label className="text-sm">Клиент</Label>
            <Input 
              value={order.customerName}
              onChange={(e) => {
                // Здесь можно добавить обновление имени клиента
              }}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm">Позиций в заказе</Label>
            <div className="mt-1 p-2 bg-muted rounded-md text-sm">
              {order.items.length} шт.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Настройки НДС */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            НДС
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="apply-vat">Применять НДС</Label>
            <Switch
              id="apply-vat"
              checked={order.applyVat}
              onCheckedChange={(checked) => onVatChange(order.vatRate, checked)}
            />
          </div>
          
          {order.applyVat && (
            <div>
              <Label className="text-sm">Ставка НДС (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={order.vatRate}
                onChange={(e) => onVatChange(parseFloat(e.target.value) || 0, order.applyVat)}
                className="mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Финансовые итоги */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Итоги заказа
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Себестоимость:</span>
              <span className="font-medium">{totalCost.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Маржа:</span>
              <span className={`font-medium ${totalMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalMargin.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Маржа (%):</span>
              <span className={`font-medium ${marginPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {marginPercent.toFixed(1)}%
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Сумма без НДС:</span>
              <span>{totalPriceNoVat.toLocaleString('ru-RU')} ₽</span>
            </div>
            {order.applyVat && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">НДС ({order.vatRate}%):</span>
                  <span>{totalVat.toLocaleString('ru-RU')} ₽</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Итого с НДС:</span>
                  <span>{totalPriceWithVat.toLocaleString('ru-RU')} ₽</span>
                </div>
              </>
            )}
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
        </CardContent>
      </Card>

      {/* Детализация по позициям */}
      <Card>
        <CardHeader>
          <CardTitle>Детализация</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div className="flex-1">
                  <div className="text-sm font-medium truncate">{item.itemName}</div>
                  <div className="text-xs text-muted-foreground">{item.quantity} шт.</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {(order.applyVat ? item.linePriceWithVat : item.linePriceNoVat).toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-xs text-muted-foreground">
                    себест.: {item.lineCost.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>
            ))}
            
            {order.items.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Позиции не добавлены</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Действия */}
      <div className="space-y-2">
        <Button className="w-full" size="lg">
          Сформировать коммерческое предложение
        </Button>
        <Button variant="outline" className="w-full">
          Сохранить заказ
        </Button>
        <Button variant="outline" className="w-full">
          Экспорт в PDF
        </Button>
      </div>
    </div>
  )
}
