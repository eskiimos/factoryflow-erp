'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Search, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

interface Product {
  id: string
  name: string
  sku: string
  unit: string
  sellingPrice: number
  productType: 'STANDARD' | 'ASSEMBLY' | 'WAREHOUSE'
  currency: string
}

interface AssemblyComponent {
  id: string
  componentProductId: string
  quantity: number
  unit: string
  cost: number
  sequence: number
  componentProduct: Product
}

interface AssemblyComponentsManagerProps {
  components: AssemblyComponent[]
  onComponentsChange: (components: AssemblyComponent[]) => void
  productId?: string
}

export function AssemblyComponentsManager({ 
  components, 
  onComponentsChange,
  productId 
}: AssemblyComponentsManagerProps) {
  const { toast } = useToast()
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)

  // Загрузка доступных товаров
  useEffect(() => {
    fetchAvailableProducts()
  }, [productId])

  const fetchAvailableProducts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/products?excludeId=' + (productId || ''))
      if (!response.ok) throw new Error('Ошибка загрузки товаров')
      
      const data = await response.json()
      setAvailableProducts(data.products || [])
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список товаров",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddComponent = () => {
    if (!selectedProductId || quantity <= 0) {
      toast({
        title: "Ошибка",
        description: "Выберите товар и укажите количество",
        variant: "destructive",
      })
      return
    }

    const selectedProduct = availableProducts.find(p => p.id === selectedProductId)
    if (!selectedProduct) return

    // Проверяем, не добавлен ли уже этот товар
    const existingComponent = components.find(c => c.componentProductId === selectedProductId)
    if (existingComponent) {
      toast({
        title: "Внимание",
        description: "Этот товар уже добавлен в состав",
        variant: "destructive",
      })
      return
    }

    const newComponent: AssemblyComponent = {
      id: `temp-${Date.now()}`,
      componentProductId: selectedProductId,
      quantity,
      unit: selectedProduct.unit,
      cost: selectedProduct.sellingPrice * quantity,
      sequence: components.length,
      componentProduct: selectedProduct
    }

    onComponentsChange([...components, newComponent])
    
    // Сброс формы
    setSelectedProductId('')
    setQuantity(1)
    setIsDialogOpen(false)
    
    toast({
      title: "Успешно",
      description: "Компонент добавлен в состав товара",
    })
  }

  const handleRemoveComponent = (componentId: string) => {
    const updatedComponents = components.filter(c => c.id !== componentId)
    onComponentsChange(updatedComponents)
    
    toast({
      title: "Успешно",
      description: "Компонент удален из состава",
    })
  }

  const handleQuantityChange = (componentId: string, newQuantity: number) => {
    const updatedComponents = components.map(component => {
      if (component.id === componentId) {
        const newCost = component.componentProduct.sellingPrice * newQuantity
        return {
          ...component,
          quantity: newQuantity,
          cost: newCost
        }
      }
      return component
    })
    onComponentsChange(updatedComponents)
  }

  const totalCost = components.reduce((sum, component) => sum + component.cost, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Состав сборного товара
        </CardTitle>
        <CardDescription>
          Добавьте товары и материалы, входящие в состав данного изделия
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Список компонентов */}
        {components.length > 0 ? (
          <div className="space-y-3">
            {components.map((component) => (
              <div 
                key={component.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{component.componentProduct.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {component.componentProduct.sku}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        component.componentProduct.productType === 'STANDARD' ? 'border-blue-300 text-blue-700' :
                        component.componentProduct.productType === 'ASSEMBLY' ? 'border-green-300 text-green-700' :
                        'border-orange-300 text-orange-700'
                      }`}
                    >
                      {component.componentProduct.productType === 'STANDARD' ? 'Стандартный' :
                       component.componentProduct.productType === 'ASSEMBLY' ? 'Сборный' :
                       'Со склада'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Цена за единицу: {component.componentProduct.sellingPrice.toLocaleString()} {component.componentProduct.currency}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`quantity-${component.id}`} className="text-sm">
                      Кол-во:
                    </Label>
                    <Input
                      id={`quantity-${component.id}`}
                      type="number"
                      value={component.quantity}
                      onChange={(e) => handleQuantityChange(component.id, parseFloat(e.target.value) || 0)}
                      className="w-20 text-center"
                      min="0.01"
                      step="0.01"
                    />
                    <span className="text-sm text-gray-500">{component.unit}</span>
                  </div>
                  
                  <div className="text-right min-w-[100px]">
                    <div className="font-medium">
                      {component.cost.toLocaleString()} ₽
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveComponent(component.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Итого */}
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="font-medium">Общая стоимость компонентов:</span>
              <span className="text-lg font-bold text-green-600">
                {totalCost.toLocaleString()} ₽
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Состав товара пока не определен</p>
            <p className="text-sm">Нажмите "Добавить компонент" для начала</p>
          </div>
        )}

        {/* Кнопка добавления */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Добавить компонент
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Добавить компонент в состав</DialogTitle>
              <DialogDescription>
                Выберите товар из каталога и укажите необходимое количество
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Поиск товаров */}
              <div>
                <Label>Поиск товара</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Введите название или артикул товара..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Выбор товара */}
              <div>
                <Label>Выберите товар</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите товар из списка" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <span className="font-medium">{product.name}</span>
                            <span className="text-sm text-gray-500 ml-2">({product.sku})</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.sellingPrice.toLocaleString()} {product.currency}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Количество */}
              <div>
                <Label>Количество</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  min="0.01"
                  step="0.01"
                  placeholder="Введите количество"
                />
              </div>

              {/* Предварительный расчет */}
              {selectedProductId && quantity > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    Стоимость: {(availableProducts.find(p => p.id === selectedProductId)?.sellingPrice || 0) * quantity} ₽
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleAddComponent} disabled={!selectedProductId || quantity <= 0}>
                Добавить компонент
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
