'use client'

import { Warehouse, TrendingUp, Package } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface WarehouseProductSettingsProps {
  basePrice: number
  onBasePriceChange: (price: number) => void
  currentStock: number
  onCurrentStockChange: (stock: number) => void
  minStock: number
  onMinStockChange: (stock: number) => void
  maxStock: number
  onMaxStockChange: (stock: number) => void
  unit: string
  currency?: string
}

export function WarehouseProductSettings({
  basePrice,
  onBasePriceChange,
  currentStock,
  onCurrentStockChange,
  minStock,
  onMinStockChange,
  maxStock,
  onMaxStockChange,
  unit,
  currency = 'RUB'
}: WarehouseProductSettingsProps) {
  
  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'RUB': return '₽'
      case 'USD': return '$'
      case 'EUR': return '€'
      default: return curr
    }
  }

  const getStockStatus = () => {
    if (currentStock <= minStock) {
      return { status: 'critical', color: 'bg-red-100 text-red-800', text: 'Критический остаток' }
    } else if (currentStock <= minStock * 1.5) {
      return { status: 'low', color: 'bg-yellow-100 text-yellow-800', text: 'Низкий остаток' }
    } else if (currentStock >= maxStock * 0.8) {
      return { status: 'high', color: 'bg-green-100 text-green-800', text: 'Оптимальный остаток' }
    } else {
      return { status: 'normal', color: 'bg-blue-100 text-blue-800', text: 'Нормальный остаток' }
    }
  }

  const stockStatus = getStockStatus()

  return (
    <div className="space-y-6">
      {/* Ценообразование */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ценообразование
          </CardTitle>
          <CardDescription>
            Укажите фиксированную стоимость товара за единицу
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="basePrice">Цена за единицу *</Label>
              <div className="relative">
                <Input
                  id="basePrice"
                  type="number"
                  value={basePrice || ''}
                  onChange={(e) => onBasePriceChange(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="pr-12"
                />
                <div className="absolute right-3 top-3 text-sm text-gray-500">
                  {getCurrencySymbol(currency)}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Стоимость за {unit}
              </p>
            </div>
            
            <div className="flex items-end">
              <div className="p-4 bg-blue-50 rounded-lg w-full">
                <div className="text-sm text-blue-600 font-medium">
                  Итоговая цена
                </div>
                <div className="text-xl font-bold text-blue-800">
                  {basePrice.toLocaleString()} {getCurrencySymbol(currency)}
                </div>
                <div className="text-xs text-blue-600">
                  за {unit}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Управление складскими остатками */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            Складские остатки
          </CardTitle>
          <CardDescription>
            Настройте учет остатков товара на складе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Текущий остаток с индикатором статуса */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="currentStock">Текущий остаток</Label>
                <Badge className={stockStatus.color}>
                  {stockStatus.text}
                </Badge>
              </div>
              <div className="relative">
                <Input
                  id="currentStock"
                  type="number"
                  value={currentStock || ''}
                  onChange={(e) => onCurrentStockChange(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="pr-16"
                />
                <div className="absolute right-3 top-3 text-sm text-gray-500">
                  {unit}
                </div>
              </div>
            </div>

            {/* Минимальный и максимальный остатки */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minStock">Минимальный остаток</Label>
                <div className="relative">
                  <Input
                    id="minStock"
                    type="number"
                    value={minStock || ''}
                    onChange={(e) => onMinStockChange(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="pr-16"
                  />
                  <div className="absolute right-3 top-3 text-sm text-gray-500">
                    {unit}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Уведомление о необходимости пополнения
                </p>
              </div>
              
              <div>
                <Label htmlFor="maxStock">Максимальный остаток</Label>
                <div className="relative">
                  <Input
                    id="maxStock"
                    type="number"
                    value={maxStock || ''}
                    onChange={(e) => onMaxStockChange(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="pr-16"
                  />
                  <div className="absolute right-3 top-3 text-sm text-gray-500">
                    {unit}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Оптимальный уровень запаса
                </p>
              </div>
            </div>

            {/* Статистика по остаткам */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Статистика остатков
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">На складе</div>
                  <div className="font-medium">{currentStock.toLocaleString()} {unit}</div>
                </div>
                <div>
                  <div className="text-gray-600">Стоимость</div>
                  <div className="font-medium">{(currentStock * basePrice).toLocaleString()} {getCurrencySymbol(currency)}</div>
                </div>
                <div>
                  <div className="text-gray-600">До минимума</div>
                  <div className="font-medium">
                    {currentStock > minStock 
                      ? `${(currentStock - minStock).toLocaleString()} ${unit}`
                      : <span className="text-red-600">Достигнут</span>
                    }
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Резерв</div>
                  <div className="font-medium">
                    {maxStock > currentStock 
                      ? `${(maxStock - currentStock).toLocaleString()} ${unit}`
                      : <span className="text-orange-600">Превышен</span>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
