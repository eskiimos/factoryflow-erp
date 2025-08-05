"use client"

import { useState, useEffect } from 'react'
import { Plus, Settings, Search, Trash2 } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ProductConfigurator } from './product-configurator'
import { ProductCard } from './product-card'
import { generatePDF } from '@/lib/calculator-api'

// Типы данных
type Product = {
  id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
}

type OrderItem = {
  id: string
  productId: string
  product: Product
  quantity: number
  totalPrice: number
  materials: any[]
  workTypes: any[]
  funds: any[]
}

type AdditionalService = {
  id: string
  name: string
  price: number
  type: 'URGENT' | 'DELIVERY' | 'INSTALLATION' | 'DESIGN' | 'PACKAGING' | 'CUSTOM'
}

type OrderCalculation = {
  subtotal: number
  vat: number
  total: number
  servicesTotal: number
}

export function UniversalCalculator() {
  // Состояния
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([])
  const [includeVat, setIncludeVat] = useState(true)
  const [orderCalculation, setOrderCalculation] = useState<OrderCalculation>({
    subtotal: 0,
    vat: 0,
    total: 0,
    servicesTotal: 0
  })
  
  // Состояния конфигураций
  const [savedConfigurations, setSavedConfigurations] = useState<Configuration[]>([])
  const [showSaveConfigDialog, setShowSaveConfigDialog] = useState(false)
  const [configurationName, setConfigurationName] = useState('')
  const [loadingConfigurations, setLoadingConfigurations] = useState(false)

  // Диалоги
  const [showConfigureDialog, setShowConfigureDialog] = useState(false)
  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [customServiceName, setCustomServiceName] = useState('')
  const [customServicePrice, setCustomServicePrice] = useState(0)

  // Загрузка продуктов
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts()
        setProducts(data)
        setFilteredProducts(data)
      } catch (error) {
        console.error('Error loading products:', error)
        // TODO: Показать уведомление об ошибке
      }
    }
    loadProducts()
  }, [])

  // Фильтрация продуктов
  useEffect(() => {
    let filtered = products
    
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }, [searchQuery, selectedCategory, products])

  // Расчет итогов
  useEffect(() => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const servicesTotal = additionalServices.reduce((sum, service) => sum + service.price, 0)
    const vatAmount = includeVat ? (subtotal + servicesTotal) * 0.2 : 0
    const total = subtotal + servicesTotal + vatAmount

    setOrderCalculation({
      subtotal,
      vat: vatAmount,
      total,
      servicesTotal
    })
  }, [orderItems, additionalServices, includeVat])

  // Добавление товара в заказ
  const addToOrder = (product: Product) => {
    setSelectedProduct(product)
    setShowConfigureDialog(true)
  }

  // Удаление товара из заказа
  const removeFromOrder = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Изменение количества товара
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setOrderItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newTotalPrice = (item.totalPrice / item.quantity) * newQuantity
        return { ...item, quantity: newQuantity, totalPrice: newTotalPrice }
      }
      return item
    }))
  }

  // Добавление стандартной услуги
  const addStandardService = (type: AdditionalService['type']) => {
    const standardServices = {
      'URGENT': { name: 'Срочное изготовление (+50%)', price: orderCalculation.subtotal * 0.5 },
      'DELIVERY': { name: 'Доставка', price: 2000 },
      'INSTALLATION': { name: 'Монтаж', price: orderCalculation.subtotal * 0.15 },
      'DESIGN': { name: 'Разработка дизайна', price: 5000 },
      'PACKAGING': { name: 'Упаковка', price: 1000 }
    }

    const service = standardServices[type]
    if (service && !additionalServices.some(s => s.type === type)) {
      addAdditionalService(service.name, service.price, type)
    }
  }

  // Добавление пользовательской услуги
  const addCustomService = () => {
    if (customServiceName.trim() && customServicePrice > 0) {
      addAdditionalService(customServiceName, customServicePrice, 'CUSTOM')
      setCustomServiceName('')
      setCustomServicePrice(0)
      setShowServiceDialog(false)
    }
  }

  // Общая функция добавления услуги
  const addAdditionalService = (name: string, price: number, type: AdditionalService['type']) => {
    const newService: AdditionalService = {
      id: Math.random().toString(),
      name,
      price,
      type
    }
    setAdditionalServices(prev => [...prev, newService])
  }

  // Удаление услуги
  const removeAdditionalService = (id: string) => {
    setAdditionalServices(prev => prev.filter(service => service.id !== id))
  }

  // Загрузка сохраненных конфигураций
  useEffect(() => {
    async function loadConfigurations() {
      setLoadingConfigurations(true)
      try {
        const data = await getConfigurations()
        setSavedConfigurations(data)
      } catch (error) {
        console.error('Error loading configurations:', error)
        // TODO: Показать уведомление об ошибке
      } finally {
        setLoadingConfigurations(false)
      }
    }
    loadConfigurations()
  }, [])

  // Сохранение конфигурации
  const saveConfiguration = async () => {
    if (!configurationName.trim() || orderItems.length === 0) return

    try {
      const configuration = {
        name: configurationName,
        productId: orderItems[0].productId,
        totalPrice: orderCalculation.total,
        materials: orderItems[0].materials.map(m => ({
          materialId: m.id,
          quantity: m.quantity,
          price: m.price
        })),
        workTypes: orderItems[0].workTypes.map(w => ({
          workTypeId: w.id,
          quantity: w.quantity,
          price: w.price
        })),
        funds: orderItems[0].funds.map(f => ({
          fundId: f.id,
          percentage: f.percentage
        }))
      }

      const savedConfig = await saveConfiguration(configuration)
      setSavedConfigurations(prev => [...prev, savedConfig])
      setShowSaveConfigDialog(false)
      setConfigurationName('')
      
      // TODO: Показать уведомление об успешном сохранении
    } catch (error) {
      console.error('Error saving configuration:', error)
      // TODO: Показать уведомление об ошибке
    }
  }

  // Загрузка конфигурации
  const loadConfiguration = async (id: string) => {
    try {
      const config = await getConfiguration(id)
      
      // Создаем новый orderItem из конфигурации
      const newItem: OrderItem = {
        id: Math.random().toString(),
        productId: config.productId,
        product: config.product,
        quantity: 1,
        totalPrice: config.totalPrice,
        materials: config.materials.map(m => ({
          ...m.material,
          quantity: m.quantity
        })),
        workTypes: config.workTypes.map(w => ({
          ...w.workType,
          quantity: w.quantity
        })),
        funds: config.funds.map(f => ({
          ...f.fund,
          percentage: f.percentage
        }))
      }

      setOrderItems([newItem])
      // TODO: Показать уведомление об успешной загрузке
    } catch (error) {
      console.error('Error loading configuration:', error)
      // TODO: Показать уведомление об ошибке
    }
  }

  // Удаление конфигурации
  const deleteConfiguration = async (id: string) => {
    try {
      await deleteConfiguration(id)
      setSavedConfigurations(prev => prev.filter(c => c.id !== id))
      // TODO: Показать уведомление об успешном удалении
    } catch (error) {
      console.error('Error deleting configuration:', error)
      // TODO: Показать уведомление об ошибке
    }
  }

  // Генерация PDF с коммерческим предложением
  const generateQuotePDF = async () => {
    if (orderItems.length === 0) return

    try {
      const data = {
        orderNumber: Math.random().toString().slice(2, 8), // TODO: Получать номер из API
        date: new Date().toLocaleDateString('ru-RU'),
        company: {
          name: 'ООО "Компания"',
          address: 'г. Москва, ул. Примерная, д. 1',
          phone: '+7 (999) 123-45-67',
          email: 'info@company.ru'
        },
        items: orderItems.map(item => ({
          name: item.product.name,
          description: item.product.description,
          quantity: item.quantity,
          price: item.totalPrice / item.quantity,
          total: item.totalPrice
        })),
        materials: orderItems[0].materials.map(material => ({
          name: material.name,
          quantity: material.quantity,
          unit: material.unit,
          price: material.price
        })),
        workTypes: orderItems[0].workTypes.map(work => ({
          name: work.name,
          quantity: work.quantity,
          unit: work.unit,
          price: work.price
        })),
        additionalServices: additionalServices.map(service => ({
          name: service.name,
          price: service.price
        })),
        totals: orderCalculation
      }

      const pdfBlob = await generatePDF(data)
      
      // Создаем ссылку для скачивания
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `quote-${data.orderNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
      // TODO: Показать уведомление об ошибке
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Каталог товаров */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Каталог товаров
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Сохраненные конфигурации */}
              {savedConfigurations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Сохраненные конфигурации</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedConfigurations.map(config => (
                      <Card key={config.id}>
                        <CardHeader>
                          <CardTitle className="text-base">{config.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-500">
                              {config.product.name}
                            </p>
                            <p className="font-semibold">
                              {config.totalPrice.toLocaleString()} ₽
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" onClick={() => loadConfiguration(config.id)}>
                            Загрузить
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteConfiguration(config.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Поиск и фильтры */}
              <div className="space-y-4 mb-4">
                <Input
                  placeholder="Поиск товаров..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <div className="flex gap-2">
                  {Array.from(new Set(products.map(p => p.category))).map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(prev => prev === category ? null : category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Список товаров */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToOrder={() => addToOrder(product)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Заказ */}
        <div className="space-y-6">
          {/* Товары в заказе */}
          <Card>
            <CardHeader>
              <CardTitle>Заказ</CardTitle>
            </CardHeader>
            <CardContent>
              {orderItems.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  Добавьте товары в заказ
                </div>
              ) : (
                <div className="space-y-4">
                  {orderItems.map(item => (
                    <div key={item.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-gray-500">
                          {item.totalPrice.toLocaleString()} ₽
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromOrder(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Дополнительные услуги */}
          {orderItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Дополнительные услуги
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Быстрые кнопки стандартных услуг */}
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={additionalServices.some(s => s.type === 'URGENT') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => addStandardService('URGENT')}
                  >
                    Срочность
                  </Button>
                  <Button 
                    variant={additionalServices.some(s => s.type === 'DELIVERY') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => addStandardService('DELIVERY')}
                  >
                    Доставка
                  </Button>
                  <Button 
                    variant={additionalServices.some(s => s.type === 'INSTALLATION') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => addStandardService('INSTALLATION')}
                  >
                    Монтаж
                  </Button>
                  <Button 
                    variant={additionalServices.some(s => s.type === 'DESIGN') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => addStandardService('DESIGN')}
                  >
                    Дизайн
                  </Button>
                  <Button 
                    variant={additionalServices.some(s => s.type === 'PACKAGING') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => addStandardService('PACKAGING')}
                  >
                    Упаковка
                  </Button>
                </div>

                {/* Список добавленных услуг */}
                {additionalServices.length > 0 && (
                  <div className="space-y-2">
                    {additionalServices.map(service => (
                      <div key={service.id} className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm">{service.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {service.price.toLocaleString()} ₽
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAdditionalService(service.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Добавление пользовательской услуги */}
                <div className="pt-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowServiceDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить услугу
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Настройки заказа */}
          {orderItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Настройки заказа
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* НДС */}
                <div className="flex items-center justify-between">
                  <Label>Включить НДС</Label>
                  <Switch
                    checked={includeVat}
                    onCheckedChange={setIncludeVat}
                  />
                </div>
                
                {includeVat && (
                  <div className="text-sm text-gray-500">
                    НДС 20% будет добавлен к итоговой сумме заказа
                  </div>
                )}

                {/* Итоги */}
                                  {/* Итоги */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Товары:</span>
                      <span>{orderCalculation.subtotal.toLocaleString()} ₽</span>
                    </div>
                    {orderCalculation.servicesTotal > 0 && (
                      <div className="flex justify-between">
                        <span>Услуги:</span>
                        <span>{orderCalculation.servicesTotal.toLocaleString()} ₽</span>
                      </div>
                    )}
                    {includeVat && (
                      <div className="flex justify-between">
                        <span>НДС 20%:</span>
                        <span>{orderCalculation.vat.toLocaleString()} ₽</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Итого:</span>
                      <span>{orderCalculation.total.toLocaleString()} ₽</span>
                    </div>
                  </div>

                  {/* Кнопки действий */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => setShowSaveConfigDialog(true)}
                      disabled={orderItems.length === 0}
                    >
                      Сохранить конфигурацию
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={generateQuotePDF}
                      disabled={orderItems.length === 0}
                    >
                      Скачать КП
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Диалог настройки товара */}
      {selectedProduct && (
        <Dialog open={showConfigureDialog} onOpenChange={setShowConfigureDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Настройка товара: {selectedProduct.name}</DialogTitle>
            </DialogHeader>
            <ProductConfigurator
              product={selectedProduct}
              onSave={(config) => {
                const newItem: OrderItem = {
                  id: Math.random().toString(),
                  productId: selectedProduct.id,
                  product: selectedProduct,
                  quantity: 1,
                  totalPrice: config.totalPrice,
                  materials: config.materials,
                  workTypes: config.workTypes,
                  funds: config.funds
                }
                setOrderItems(prev => [...prev, newItem])
                setShowConfigureDialog(false)
              }}
              onCancel={() => setShowConfigureDialog(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Диалог добавления услуги */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить услугу</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название услуги</Label>
              <Input
                value={customServiceName}
                onChange={e => setCustomServiceName(e.target.value)}
                placeholder="Введите название услуги"
              />
            </div>
            <div>
              <Label>Стоимость</Label>
              <Input
                type="number"
                value={customServicePrice}
                onChange={e => setCustomServicePrice(Number(e.target.value))}
                placeholder="Введите стоимость"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowServiceDialog(false)}>
              Отмена
            </Button>
            <Button onClick={addCustomService}>
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог сохранения конфигурации */}
      <Dialog open={showSaveConfigDialog} onOpenChange={setShowSaveConfigDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сохранить конфигурацию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название конфигурации</Label>
              <Input
                value={configurationName}
                onChange={e => setConfigurationName(e.target.value)}
                placeholder="Введите название для сохранения"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveConfigDialog(false)}>
              Отмена
            </Button>
            <Button onClick={saveConfiguration}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
