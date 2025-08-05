'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Package } from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  unit: string
  basePrice: number
  sellingPrice: number
  formulaEnabled: boolean
  parameters?: ProductParameter[]
}

interface ProductParameter {
  id: string
  name: string
  type: string
  unit?: string
  defaultValue?: string
  isRequired: boolean
}

interface ProductSelectorProps {
  onSelect: (productId: string, quantity: number, parameters?: Record<string, any>) => void
  onClose: () => void
}

export function ProductSelector({ onSelect, onClose }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  // Загрузка списка товаров
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?includeParameters=true')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.data || [])
          setFilteredProducts(data.data || [])
        }
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Фильтрация товаров по поиску
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredProducts(filtered)
    }
  }, [searchQuery, products])

  // Выбор товара
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    
    // Установка значений по умолчанию для параметров
    if (product.parameters) {
      const defaultParams: Record<string, any> = {}
      product.parameters.forEach(param => {
        if (param.defaultValue) {
          defaultParams[param.name] = param.defaultValue
        }
      })
      setParameters(defaultParams)
    }
  }

  // Обновление значения параметра
  const handleParameterChange = (paramName: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }))
  }

  // Добавление товара в заказ
  const handleAddToOrder = () => {
    if (!selectedProduct) return

    // Проверка обязательных параметров
    if (selectedProduct.parameters) {
      const missingRequired = selectedProduct.parameters.filter(
        param => param.isRequired && !parameters[param.name]
      )
      
      if (missingRequired.length > 0) {
        alert(`Заполните обязательные параметры: ${missingRequired.map(p => p.name).join(', ')}`)
        return
      }
    }

    onSelect(selectedProduct.id, quantity, parameters)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Выбор товара для добавления в заказ</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-6">
          {/* Левая панель - список товаров */}
          <div className="flex-1 flex flex-col">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {loading ? (
                <div className="text-center py-8">Загрузка товаров...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Товары не найдены</p>
                </div>
              ) : (
                filteredProducts.map(product => (
                  <Card 
                    key={product.id}
                    className={`cursor-pointer transition-colors ${
                      selectedProduct?.id === product.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleProductSelect(product)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{product.sku}</Badge>
                            <span className="text-sm text-muted-foreground">{product.unit}</span>
                            {product.formulaEnabled && (
                              <Badge variant="secondary">Формула</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{(product.sellingPrice || product.basePrice || 0).toLocaleString('ru-RU')} ₽</div>
                          <div className="text-sm text-muted-foreground">за {product.unit}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Правая панель - параметры выбранного товара */}
          {selectedProduct && (
            <div className="w-80 flex flex-col">
              <Card className="flex-1">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Параметры заказа</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Количество ({selectedProduct.unit})
                        </label>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={quantity}
                          onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                        />
                      </div>

                      {/* Параметры для формульного расчета */}
                      {selectedProduct.formulaEnabled && selectedProduct.parameters && (
                        <div>
                          <h4 className="font-medium mb-2">Параметры расчета</h4>
                          <div className="space-y-2">
                            {selectedProduct.parameters.map(param => (
                              <div key={param.id}>
                                <label className="block text-sm font-medium mb-1">
                                  {param.name}
                                  {param.isRequired && <span className="text-red-500">*</span>}
                                  {param.unit && <span className="text-muted-foreground"> ({param.unit})</span>}
                                </label>
                                {param.type === 'NUMBER' ? (
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={parameters[param.name] || ''}
                                    onChange={(e) => handleParameterChange(param.name, parseFloat(e.target.value) || 0)}
                                    placeholder={param.defaultValue}
                                  />
                                ) : (
                                  <Input
                                    value={parameters[param.name] || ''}
                                    onChange={(e) => handleParameterChange(param.name, e.target.value)}
                                    placeholder={param.defaultValue}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddToOrder}
                        className="flex-1"
                        disabled={quantity <= 0}
                      >
                        Добавить в заказ
                      </Button>
                      <Button variant="outline" onClick={onClose}>
                        Отмена
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
