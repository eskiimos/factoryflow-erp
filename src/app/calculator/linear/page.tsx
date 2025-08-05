'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Ruler, Calculator, Package, Clock } from 'lucide-react'

interface LinearProduct {
  id: string
  name: string
  description?: string
  sku: string
  basePrice: number
  baseUnit: string
  specifications?: string
  materialUsages?: MaterialUsage[]
  workTypeUsages?: WorkUsage[]
}

interface MaterialUsage {
  id: string
  quantity: number
  cost: number
  materialItem: {
    name: string
    unit: string
    price: number
  }
}

interface WorkUsage {
  id: string
  quantity: number
  cost: number
  workType: {
    name: string
    hourlyRate: number
    unit: string
  }
}

interface CalculationResult {
  length: number
  unit: string
  totalCost: number
  materialCost: number
  laborCost: number
  materialBreakdown: MaterialBreakdown[]
  workBreakdown: WorkBreakdown[]
  totalTime: number
}

interface MaterialBreakdown {
  materialName: string
  quantity: number
  unit: string
  unitPrice: number
  totalCost: number
}

interface WorkBreakdown {
  workTypeName: string
  time: number
  hourlyRate: number
  totalCost: number
}

export default function LinearCalculator() {
  const [products, setProducts] = useState<LinearProduct[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<LinearProduct | null>(null)
  const [length, setLength] = useState<number>(100) // в см
  const [unit, setUnit] = useState<string>('см')
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null)
  const [loading, setLoading] = useState(true)

  // Загрузка погонажных товаров
  const loadLinearProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products?group=Погонажные изделия')
      if (response.ok) {
        const result = await response.json()
        const linearProducts = result.data?.filter((p: any) => 
          p.baseUnit === 'см' && p.pricingMethod === 'LINEAR'
        ) || []
        setProducts(linearProducts)
        
        // Выбираем первый товар по умолчанию
        if (linearProducts.length > 0) {
          const firstProduct = linearProducts[0]
          setSelectedProductId(firstProduct.id)
          await loadProductDetails(firstProduct.id)
        }
      } else {
        console.error('Ошибка загрузки товаров')
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error)
    } finally {
      setLoading(false)
    }
  }

  // Загрузка деталей товара
  const loadProductDetails = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (response.ok) {
        const result = await response.json()
        setSelectedProduct(result.data)
      } else {
        console.error('Ошибка загрузки деталей товара')
      }
    } catch (error) {
      console.error('Ошибка загрузки деталей товара:', error)
    }
  }

  useEffect(() => {
    loadLinearProducts()
  }, [])

  // Выбор товара
  const handleProductSelect = async (productId: string) => {
    setSelectedProductId(productId)
    await loadProductDetails(productId)
    setCalculationResult(null)
  }

  // Расчет стоимости
  const calculateCost = () => {
    if (!selectedProduct) return

    const lengthInCm = unit === 'м' ? length * 100 : length
    const lengthInM = unit === 'см' ? length / 100 : length

    // Базовая стоимость
    const baseCost = selectedProduct.basePrice * lengthInCm

    // Расчет материалов
    const materialBreakdown: MaterialBreakdown[] = []
    let materialCost = 0

    if (selectedProduct.materialUsages) {
      for (const usage of selectedProduct.materialUsages) {
        const quantity = usage.quantity * lengthInCm
        const cost = usage.cost * lengthInCm
        
        materialBreakdown.push({
          materialName: usage.materialItem.name,
          quantity: quantity,
          unit: usage.materialItem.unit,
          unitPrice: usage.materialItem.price,
          totalCost: cost
        })
        
        materialCost += cost
      }
    }

    // Расчет работ
    const workBreakdown: WorkBreakdown[] = []
    let laborCost = 0
    let totalTime = 0

    if (selectedProduct.workTypeUsages) {
      for (const usage of selectedProduct.workTypeUsages) {
        const time = usage.quantity * lengthInCm
        const cost = usage.cost * lengthInCm
        
        workBreakdown.push({
          workTypeName: usage.workType.name,
          time: time,
          hourlyRate: usage.workType.hourlyRate,
          totalCost: cost
        })
        
        laborCost += cost
        totalTime += time
      }
    }

    const result: CalculationResult = {
      length: length,
      unit: unit,
      totalCost: baseCost,
      materialCost: materialCost,
      laborCost: laborCost,
      materialBreakdown: materialBreakdown,
      workBreakdown: workBreakdown,
      totalTime: totalTime
    }

    setCalculationResult(result)
  }

  // Конвертация единиц
  const convertUnit = (newUnit: string) => {
    if (unit === newUnit) return

    if (unit === 'см' && newUnit === 'м') {
      setLength(length / 100)
    } else if (unit === 'м' && newUnit === 'см') {
      setLength(length * 100)
    }
    
    setUnit(newUnit)
  }

  // Получение спецификаций товара
  const getSpecifications = () => {
    if (!selectedProduct?.specifications) return null
    try {
      return JSON.parse(selectedProduct.specifications)
    } catch {
      return null
    }
  }

  if (loading) {
    return <div className="container mx-auto p-6">Загрузка...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <Ruler className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold">Калькулятор погонажных изделий</h1>
          <p className="text-muted-foreground">
            Расчет стоимости изделий с ценообразованием за сантиметр
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Выбор товара и параметры */}
        <div className="space-y-6">
          {/* Выбор товара */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Выбор изделия
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="product">Погонажное изделие</Label>
                  <Select value={selectedProductId} onValueChange={handleProductSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите изделие" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.basePrice} ₽/{product.baseUnit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProduct && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {selectedProduct.description}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">SKU: {selectedProduct.sku}</Badge>
                      <Badge variant="secondary">
                        {selectedProduct.basePrice} ₽/{selectedProduct.baseUnit}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Параметры расчета */}
          <Card>
            <CardHeader>
              <CardTitle>Параметры расчета</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="length">Длина</Label>
                  <Input
                    id="length"
                    type="number"
                    min="1"
                    step="0.1"
                    value={length}
                    onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Единица</Label>
                  <Select value={unit} onValueChange={convertUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="см">Сантиметры</SelectItem>
                      <SelectItem value="м">Метры</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={calculateCost} className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Рассчитать стоимость
              </Button>
            </CardContent>
          </Card>

          {/* Спецификации */}
          {getSpecifications() && (
            <Card>
              <CardHeader>
                <CardTitle>Характеристики</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(getSpecifications()!).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                      </span>
                      <span>{value as string}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Результаты расчета */}
        <div className="space-y-6">
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
                      за {calculationResult.length} {calculationResult.unit}
                    </div>
                  </div>

                  {/* Разбивка стоимости */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="font-medium text-blue-900">Материалы</div>
                      <div className="text-xl font-bold text-blue-600">
                        {calculationResult.materialCost.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <div className="font-medium text-green-900">Работы</div>
                      <div className="text-xl font-bold text-green-600">
                        {calculationResult.laborCost.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>

                  {/* Время изготовления */}
                  {calculationResult.totalTime > 0 && (
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-orange-900">Время изготовления</span>
                      </div>
                      <span className="text-lg font-bold text-orange-600">
                        {calculationResult.totalTime.toFixed(2)} ч
                      </span>
                    </div>
                  )}

                  {/* Детализация материалов */}
                  {calculationResult.materialBreakdown.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Материалы:</h4>
                      <div className="space-y-2">
                        {calculationResult.materialBreakdown.map((material, index) => (
                          <div 
                            key={index}
                            className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm"
                          >
                            <div>
                              <span className="font-medium">{material.materialName}</span>
                              <div className="text-muted-foreground">
                                {material.quantity.toFixed(3)} {material.unit} × {material.unitPrice} ₽
                              </div>
                            </div>
                            <span className="font-semibold">
                              {material.totalCost.toFixed(2)} ₽
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Детализация работ */}
                  {calculationResult.workBreakdown.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Работы:</h4>
                      <div className="space-y-2">
                        {calculationResult.workBreakdown.map((work, index) => (
                          <div 
                            key={index}
                            className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm"
                          >
                            <div>
                              <span className="font-medium">{work.workTypeName}</span>
                              <div className="text-muted-foreground">
                                {work.time.toFixed(3)} ч × {work.hourlyRate} ₽/ч
                              </div>
                            </div>
                            <span className="font-semibold">
                              {work.totalCost.toFixed(2)} ₽
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="h-8 w-8 mx-auto mb-2" />
                  <p>Выберите изделие и укажите длину</p>
                  <p className="text-sm">для расчета стоимости</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Package className="h-8 w-8 mb-2" />
            <p>Погонажные изделия не найдены</p>
            <p className="text-sm">Создайте товары с единицей измерения "см"</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
