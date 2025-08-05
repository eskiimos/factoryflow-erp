'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, Package, Cog, Save, Play } from 'lucide-react'
import { ProductComponentManager } from '@/components/product/product-component-manager'
import { ComponentMaterialManager } from '@/components/product/component-material-manager'

interface Product {
  id: string
  name: string
  description?: string
  category?: string
}

interface CalculationParams {
  width: number
  height: number
  depth: number
  hasHandrail: boolean
  doorCount: number
  shelfCount: number
  [key: string]: any
}

interface CalculationResult {
  totalCost: number
  componentBreakdown: ComponentCalculation[]
  materialBreakdown: MaterialBreakdown[]
  totalTime: number
}

interface ComponentCalculation {
  componentId: string
  componentName: string
  quantity: number
  materialCost: number
  laborCost: number
  totalCost: number
  materials: MaterialUsage[]
}

interface MaterialUsage {
  materialId: string
  materialName: string
  quantity: number
  unit: string
  unitPrice: number
  totalCost: number
}

interface MaterialBreakdown {
  materialId: string
  materialName: string
  totalQuantity: number
  unit: string
  unitPrice: number
  totalCost: number
}

export default function ComponentCalculatorDemo() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [calculationParams, setCalculationParams] = useState<CalculationParams>({
    width: 2000,
    height: 2400,
    depth: 600,
    hasHandrail: false,
    doorCount: 2,
    shelfCount: 3
  })
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [selectedComponentId, setSelectedComponentId] = useState<string>('')

  // Загрузка продуктов
  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const result = await response.json()
        setProducts(result.data || [])
        
        // Выбираем первый продукт по умолчанию
        if (result.data?.length > 0) {
          const firstProduct = result.data[0]
          setSelectedProductId(firstProduct.id)
          setSelectedProduct(firstProduct)
        }
      } else {
        console.error('Ошибка загрузки продуктов')
      }
    } catch (error) {
      console.error('Ошибка загрузки продуктов:', error)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  // Выбор продукта
  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId)
    setSelectedProductId(productId)
    setSelectedProduct(product || null)
    setCalculationResult(null)
    setSelectedComponentId('')
  }

  // Расчет стоимости
  const handleCalculate = async () => {
    if (!selectedProductId) return

    try {
      setCalculating(true)
      const response = await fetch(`/api/products/${selectedProductId}/components/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculationParams)
      })

      if (response.ok) {
        const result = await response.json()
        setCalculationResult(result.data)
      } else {
        const error = await response.json()
        console.error('Ошибка расчета:', error)
        alert(error.message || 'Ошибка расчета')
      }
    } catch (error) {
      console.error('Ошибка расчета:', error)
      alert('Ошибка расчета')
    } finally {
      setCalculating(false)
    }
  }

  // Обновление параметров
  const updateParam = (key: string, value: any) => {
    setCalculationParams(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <Calculator className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold">Компонентный калькулятор</h1>
          <p className="text-muted-foreground">
            Демонстрация системы расчета сложных изделий по компонентам
          </p>
        </div>
      </div>

      {/* Выбор продукта */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Выбор изделия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="product">Изделие для расчета</Label>
              <Select value={selectedProductId} onValueChange={handleProductSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите изделие" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} {product.category && `(${product.category})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedProduct && (
              <div className="text-sm text-muted-foreground">
                {selectedProduct.description}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedProduct && (
        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calculator">Калькулятор</TabsTrigger>
            <TabsTrigger value="components">Компоненты</TabsTrigger>
            <TabsTrigger value="materials">Материалы</TabsTrigger>
          </TabsList>

          {/* Калькулятор */}
          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Параметры расчета */}
              <Card>
                <CardHeader>
                  <CardTitle>Параметры изделия</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Размеры */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="width">Ширина (мм)</Label>
                      <Input
                        id="width"
                        type="number"
                        value={calculationParams.width}
                        onChange={(e) => updateParam('width', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="height">Высота (мм)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={calculationParams.height}
                        onChange={(e) => updateParam('height', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="depth">Глубина (мм)</Label>
                      <Input
                        id="depth"
                        type="number"
                        value={calculationParams.depth}
                        onChange={(e) => updateParam('depth', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  {/* Дополнительные параметры */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="doorCount">Количество дверей</Label>
                      <Input
                        id="doorCount"
                        type="number"
                        min="0"
                        value={calculationParams.doorCount}
                        onChange={(e) => updateParam('doorCount', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="shelfCount">Количество полок</Label>
                      <Input
                        id="shelfCount"
                        type="number"
                        min="0"
                        value={calculationParams.shelfCount}
                        onChange={(e) => updateParam('shelfCount', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  {/* Опции */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasHandrail"
                      checked={calculationParams.hasHandrail}
                      onChange={(e) => updateParam('hasHandrail', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="hasHandrail">Наличие штанги для одежды</Label>
                  </div>

                  <Button onClick={handleCalculate} disabled={calculating} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    {calculating ? 'Расчет...' : 'Рассчитать стоимость'}
                  </Button>
                </CardContent>
              </Card>

              {/* Результаты расчета */}
              <Card>
                <CardHeader>
                  <CardTitle>Результаты расчета</CardTitle>
                </CardHeader>
                <CardContent>
                  {calculationResult ? (
                    <div className="space-y-4">
                      {/* Общая стоимость */}
                      <div className="text-center p-4 bg-primary/10 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {calculationResult.totalCost.toLocaleString('ru-RU')} ₽
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Общая стоимость изделия
                        </div>
                      </div>

                      {/* Разбивка по компонентам */}
                      <div>
                        <h4 className="font-semibold mb-2">Компоненты:</h4>
                        <div className="space-y-2">
                          {calculationResult.componentBreakdown.map(component => (
                            <div 
                              key={component.componentId}
                              className="flex justify-between items-center p-2 bg-muted/50 rounded"
                            >
                              <div>
                                <span className="font-medium">{component.componentName}</span>
                                <Badge variant="outline" className="ml-2">
                                  {component.quantity} шт
                                </Badge>
                              </div>
                              <span className="font-semibold">
                                {component.totalCost.toLocaleString('ru-RU')} ₽
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Разбивка по материалам */}
                      <div>
                        <h4 className="font-semibold mb-2">Материалы:</h4>
                        <div className="space-y-2">
                          {calculationResult.materialBreakdown.map(material => (
                            <div 
                              key={material.materialId}
                              className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm"
                            >
                              <div>
                                <span>{material.materialName}</span>
                                <span className="text-muted-foreground ml-2">
                                  {material.totalQuantity} {material.unit}
                                </span>
                              </div>
                              <span className="font-medium">
                                {material.totalCost.toLocaleString('ru-RU')} ₽
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {calculationResult.totalTime > 0 && (
                        <div className="pt-2 border-t">
                          <div className="text-sm text-muted-foreground">
                            Время изготовления: {calculationResult.totalTime} ч
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calculator className="h-8 w-8 mx-auto mb-2" />
                      <p>Нажмите "Рассчитать стоимость"</p>
                      <p className="text-sm">для получения детального расчета</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Управление компонентами */}
          <TabsContent value="components">
            <ProductComponentManager productId={selectedProductId} />
          </TabsContent>

          {/* Управление материалами */}
          <TabsContent value="materials">
            {selectedComponentId ? (
              <ComponentMaterialManager 
                productId={selectedProductId}
                componentId={selectedComponentId}
                componentName="Выбранный компонент"
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Cog className="h-8 w-8 mb-2" />
                  <p>Выберите компонент на вкладке "Компоненты"</p>
                  <p className="text-sm">для управления его материалами</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {products.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Package className="h-8 w-8 mb-2" />
            <p>Изделия не найдены</p>
            <p className="text-sm">Создайте изделие для начала работы с калькулятором</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
