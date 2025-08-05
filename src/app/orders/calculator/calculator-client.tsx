'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, Calculator, Save, RefreshCw } from 'lucide-react'
import { ProductSelector } from './components/product-selector'
import { ParametersForm } from './components/parameters-form'
import { CompositionEditor } from './components/composition-editor'
import { PriceCalculator } from './components/price-calculator'
import { OrderSummary } from './components/order-summary'

interface OrderItem {
  id: string
  productId: string
  itemName: string
  quantity: number
  effectiveQuantity?: number
  unit: string
  unitCost: number
  lineCost: number
  linePriceNoVat: number
  vatAmount: number
  linePriceWithVat: number
  markupType: 'percent' | 'absolute'
  markupValue: number
  manualPrice?: number
  calculationParameters?: Record<string, any>
  materials: OrderItemMaterial[]
  workTypes: OrderItemWorkType[]
  funds: OrderItemFund[]
  parameterValues: OrderItemParameterValue[]
}

interface OrderItemMaterial {
  id: string
  nameSnapshot: string
  unitSnapshot: string
  priceSnapshot: number
  quantity: number
  calcCost: number
}

interface OrderItemWorkType {
  id: string
  nameSnapshot: string
  unitSnapshot: string
  priceSnapshot: number
  quantity: number
  calcCost: number
  sequence: number
}

interface OrderItemFund {
  id: string
  nameSnapshot: string
  fundType: 'percent' | 'fixed'
  fundValue: number
  calcCost: number
}

interface OrderItemParameterValue {
  id: string
  parameterName: string
  value: string
  unit?: string
}

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

export function OrderCalculatorClient() {
  const [order, setOrder] = useState<Order | null>(null)
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null)
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Создание нового заказа
  const createNewOrder = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: 'Новый клиент',
          vatRate: 20.0,
          applyVat: true,
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setOrder(result.data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Ошибка создания заказа')
      }
    } catch (error) {
      console.error('Ошибка создания заказа:', error)
      setError('Ошибка подключения к серверу')
    } finally {
      setLoading(false)
    }
  }

  // Добавление товара в заказ
  const addProductToOrder = async (productId: string, quantity: number, parameters?: Record<string, any>) => {
    if (!order) return

    setLoading(true)
    try {
      const response = await fetch('/api/orders/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          productId,
          quantity,
          parameters,
        })
      })
      
      if (response.ok) {
        const newItem = await response.json()
        setOrder(prev => prev ? {
          ...prev,
          items: [...prev.items, newItem.data]
        } : null)
        setShowProductSelector(false)
      }
    } catch (error) {
      console.error('Ошибка добавления товара:', error)
    } finally {
      setLoading(false)
    }
  }

  // Пересчет итогов заказа
  const recalculateOrder = () => {
    if (!order) return

    let totalCostNoVat = 0
    let totalVatAmount = 0

    order.items.forEach(item => {
      totalCostNoVat += item.linePriceNoVat
      totalVatAmount += item.vatAmount
    })

    const totalCostWithVat = totalCostNoVat + totalVatAmount

    setOrder(prev => prev ? {
      ...prev,
      totalCostNoVat,
      totalVatAmount,
      totalCostWithVat
    } : null)
  }

  // Автоматический пересчет при изменении позиций
  useEffect(() => {
    recalculateOrder()
  }, [order?.items])

  // Создание заказа при загрузке компонента
  useEffect(() => {
    createNewOrder()
  }, [])

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Загрузка калькулятора...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">Ошибка: {error}</div>
          <Button onClick={createNewOrder} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Попробовать снова
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Калькулятор заказа</h1>
          <p className="text-muted-foreground">
            Заказ #{order.orderNumber} • {order.customerName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowProductSelector(true)}
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить товар
          </Button>
          <Button disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Сохранить заказ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка - Список позиций */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Позиции заказа
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Добавьте товары для начала расчета</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowProductSelector(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить первый товар
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <Card 
                      key={item.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedItem?.id === item.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.itemName}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>{item.quantity} {item.unit}</span>
                              {item.effectiveQuantity && item.effectiveQuantity !== item.quantity && (
                                <Badge variant="secondary">
                                  Расчетное: {item.effectiveQuantity.toFixed(2)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {item.linePriceWithVat.toLocaleString('ru-RU')} ₽
                            </div>
                            <div className="text-sm text-muted-foreground">
                              без НДС: {item.linePriceNoVat.toLocaleString('ru-RU')} ₽
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Калькулятор позиции */}
          {selectedItem && (
            <Card>
              <CardHeader>
                <CardTitle>Калькулятор позиции: {selectedItem.itemName}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="composition" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="composition">Состав</TabsTrigger>
                    <TabsTrigger value="parameters">Параметры</TabsTrigger>
                    <TabsTrigger value="pricing">Цена</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="composition">
                    <CompositionEditor 
                      item={selectedItem}
                      onUpdate={(updatedItem) => {
                        setOrder(prev => prev ? {
                          ...prev,
                          items: prev.items.map(item => 
                            item.id === updatedItem.id ? updatedItem : item
                          )
                        } : null)
                      }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="parameters">
                    <ParametersForm 
                      item={selectedItem}
                      onUpdate={(updatedItem) => {
                        setOrder(prev => prev ? {
                          ...prev,
                          items: prev.items.map(item => 
                            item.id === updatedItem.id ? updatedItem : item
                          )
                        } : null)
                      }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="pricing">
                    <PriceCalculator 
                      item={selectedItem}
                      vatRate={order.vatRate}
                      applyVat={order.applyVat}
                      onUpdate={(updatedItem) => {
                        setOrder(prev => prev ? {
                          ...prev,
                          items: prev.items.map(item => 
                            item.id === updatedItem.id ? updatedItem : item
                          )
                        } : null)
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Правая колонка - Итоги заказа */}
        <div className="space-y-4">
          <OrderSummary 
            order={order}
            onVatChange={(vatRate, applyVat) => {
              setOrder(prev => prev ? { ...prev, vatRate, applyVat } : null)
            }}
          />
        </div>
      </div>

      {/* Модальное окно выбора товара */}
      {showProductSelector && (
        <ProductSelector
          onSelect={addProductToOrder}
          onClose={() => setShowProductSelector(false)}
        />
      )}
    </div>
  )
}
