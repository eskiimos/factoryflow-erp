'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, Package, Wrench, DollarSign, Settings, ChevronLeft, ChevronRight, Loader2, Info, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AddMaterialDialog } from '@/components/add-material-dialog'
import { AddWorkTypeDialog } from '@/components/add-work-type-dialog'
import { AddFundDialog } from '@/components/add-fund-dialog'
import { ImageUpload } from '@/components/image-upload'
import { ProductTypeSelector, ProductType } from '@/components/product-type-selector'
import { AssemblyComponentsManager } from '@/components/assembly-components-manager'
import { WarehouseProductSettings } from '@/components/warehouse-product-settings'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from '@/components/ui/use-toast'

// Определяем типы для используемых данных
interface ProductFormData {
  name: string
  description: string
  sku: string
  unit: string
  productType: ProductType
  variant: 'PRODUCT' | 'SERVICE'
  pricingMethod: string
  basePrice: number
  sellingPrice: number
  margin: number
  currency: string
  currentStock: number
  minStock: number
  maxStock: number
  isActive: boolean
  categoryId: string
  images: string
}

interface MaterialUsage {
  materialItemId: string
  quantity: number
  cost: number
  unitType: string
  baseQuantity: number
  calculationFormula?: string
  materialItem: { 
    id: string
    name: string
    unit: string
    price: number
    currency: string
  }
}

interface WorkTypeUsage {
  workTypeId: string
  quantity: number
  cost: number
  sequence: number
  unitType: string
  baseTime: number
  calculationFormula?: string
  workType: { id: string; name: string; unit: string; hourlyRate: number; department?: { name: string } }
}

interface FundUsage {
  fundId: string
  categoryId: string
  itemId?: string
  allocatedAmount: number
  percentage?: number
  description?: string
}

interface AssemblyComponent {
  id: string
  componentProductId: string
  quantity: number
  unit: string
  cost: number
  sequence: number
  componentProduct: {
    id: string
    name: string
    sku: string
    unit: string
    sellingPrice: number
    productType: ProductType
    currency: string
  }
}

interface Category {
  id: string
  name: string
}

// Основной компонент страницы
export default function CreateProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Состояния
  const [activeTab, setActiveTab] = useState('basic')
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    sku: '',
    unit: 'шт',
    productType: 'STANDARD',
    variant: 'PRODUCT',
    pricingMethod: 'FIXED',
    basePrice: 0,
    sellingPrice: 0,
    margin: 25,
    currency: 'RUB',
    currentStock: 0,
    minStock: 0,
    maxStock: 10,
    isActive: true,
    categoryId: '',
    images: '[]'
  })

  const [materialUsages, setMaterialUsages] = useState<MaterialUsage[]>([])
  const [workTypeUsages, setWorkTypeUsages] = useState<WorkTypeUsage[]>([])
  const [fundUsages, setFundUsages] = useState<FundUsage[]>([])
  const [assemblyComponents, setAssemblyComponents] = useState<AssemblyComponent[]>([])

  // Загрузка категорий при монтировании
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        if (!res.ok) throw new Error('Failed to fetch categories')
        const data = await res.json()
        
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data)
        } else {
          console.error('Неожиданный формат данных:', data)
          throw new Error('Неверный формат данных категорий')
        }
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error)
        toast({
          variant: 'destructive',
          title: 'Ошибка',
          description: 'Не удалось загрузить категории товаров.'
        })
        setCategories([])
      }
    }
    fetchCategories()
  }, [toast])

  // Здесь была удалена дублирующаяся версия handleSave

  // Расчетные значения
  const materialCost = useMemo(() => materialUsages.reduce((sum, item) => sum + item.cost, 0), [materialUsages])
  const laborCost = useMemo(() => workTypeUsages.reduce((sum, item) => sum + item.cost, 0), [workTypeUsages])
  const overheadCost = useMemo(() => fundUsages.reduce((sum, item) => sum + item.allocatedAmount, 0), [fundUsages])
  const totalCost = useMemo(() => materialCost + laborCost + overheadCost, [materialCost, laborCost, overheadCost])
  const productionTime = useMemo(() => workTypeUsages.reduce((sum, item) => sum + item.quantity, 0), [workTypeUsages])

  // Обновление цены продажи при изменении себестоимости или маржи
  useEffect(() => {
    if (totalCost > 0) {
      const newSellingPrice = totalCost * (1 + formData.margin / 100)
      setFormData(prev => ({ ...prev, sellingPrice: parseFloat(newSellingPrice.toFixed(2)) }))
    } else {
      setFormData(prev => ({ ...prev, sellingPrice: 0 }))
    }
  }, [totalCost, formData.margin])

  // Обработчик изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const isNumber = type === 'number'
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value }))
  }

  const handleSelectChange = (name: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Функции для добавления компонентов
  const handleAddMaterial = (material: any) => {
    const cost = material.quantity * material.materialItem.price
    setMaterialUsages(prev => [...prev, { ...material, cost }])
  }

  const handleAddWorkType = (workType: any) => {
    const cost = workType.quantity * workType.workType.hourlyRate
    setWorkTypeUsages(prev => [...prev, { ...workType, cost }])
  }

  const handleAddFund = (fund: any) => {
    setFundUsages(prev => [...prev, fund])
  }

  // Функция сохранения
  const handleSave = async () => {
    setLoading(true)
    try {
      const payload = {
        ...formData,
        materialCost,
        laborCost,
        overheadCost,
        totalCost,
        productionTime,
        materials: materialUsages.map(m => ({ materialItemId: m.materialItemId, quantity: m.quantity, unitType: m.unitType, baseQuantity: m.baseQuantity, calculationFormula: m.calculationFormula })),
        workTypes: workTypeUsages.map(w => ({ workTypeId: w.workTypeId, quantity: w.quantity, sequence: w.sequence, unitType: w.unitType, baseTime: w.baseTime, calculationFormula: w.calculationFormula })),
        funds: fundUsages.map(f => ({ fundId: f.fundId, categoryId: f.categoryId, itemId: f.itemId, allocatedAmount: f.allocatedAmount, percentage: f.percentage, description: f.description })),
        assemblyComponents: formData.productType === 'ASSEMBLY' ? assemblyComponents : undefined,
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details?.[0]?.message || 'Не удалось создать товар')
      }

      const newProduct = await response.json()

      toast({
        title: 'Успешно!',
        description: `Товар "${newProduct.name}" был успешно создан.`
      })
      router.push(`/products/${newProduct.id}/edit`)
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Ошибка',
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const tabOrder = ['basic', 'materials', 'work', 'funds', 'pricing', 'settings']
  const activeTabIndex = tabOrder.indexOf(activeTab)

  return (
    <div className="compact-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/products')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к товарам
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Создание нового товара</h1>
            <p className="text-muted-foreground">
              SKU: {formData.sku || 'Будет создан автоматически'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => router.push('/products')}
          >
            Отменить
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Сохранить
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="compact-tabs">
        <TabsList className="switch-tabs-container grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full mb-6 h-auto">
          <div 
            className="switch-indicator"
            style={{
              left: `calc(${(tabOrder.indexOf(activeTab) / tabOrder.length) * 100}% + 6px)`,
              width: `calc(${100 / tabOrder.length}% - 12px)`
            }}
          />
          <TabsTrigger value="basic" className="tab-trigger h-14 px-3 py-2">
            <div className="tab-icon-group">
              <div className="tab-number w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs font-bold flex items-center justify-center">1</div>
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <div className="tab-text-group">
              <div className="tab-text text-sm font-medium">Основное</div>
              <div className="tab-description text-xs text-muted-foreground">Инфо</div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="materials" className="tab-trigger h-14 px-3 py-2">
            <div className="tab-icon-group">
              <div className="tab-number w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold flex items-center justify-center">2</div>
              <Wrench className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="tab-text-group">
              <div className="tab-text text-sm font-medium">Материалы</div>
              <div className="tab-description text-xs text-muted-foreground">Сырье</div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="work" className="tab-trigger h-14 px-3 py-2">
            <div className="tab-icon-group">
              <div className="tab-number w-5 h-5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold flex items-center justify-center">3</div>
              <Wrench className="h-4 w-4 text-orange-600" />
            </div>
            <div className="tab-text-group">
              <div className="tab-text text-sm font-medium">Работы</div>
              <div className="tab-description text-xs text-muted-foreground">Труд</div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="funds" className="tab-trigger h-14 px-3 py-2">
            <div className="tab-icon-group">
              <div className="tab-number w-5 h-5 bg-purple-100 text-purple-600 rounded-full text-xs font-bold flex items-center justify-center">4</div>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
            <div className="tab-text-group">
              <div className="tab-text text-sm font-medium">Фонды</div>
              <div className="tab-description text-xs text-muted-foreground">Ресурсы</div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="tab-trigger h-14 px-3 py-2">
            <div className="tab-icon-group">
              <div className="tab-number w-5 h-5 bg-yellow-100 text-yellow-600 rounded-full text-xs font-bold flex items-center justify-center">5</div>
              <Calculator className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="tab-text-group">
              <div className="tab-text text-sm font-medium">Цена</div>
              <div className="tab-description text-xs text-muted-foreground">Маржа</div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="settings" className="tab-trigger h-14 px-3 py-2">
            <div className="tab-icon-group">
              <div className="tab-number w-5 h-5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold flex items-center justify-center">6</div>
              <Settings className="h-4 w-4 text-gray-600" />
            </div>
            <div className="tab-text-group">
              <div className="tab-text text-sm font-medium">Настройки</div>
              <div className="tab-description text-xs text-muted-foreground">Склад</div>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>📋 Основная информация</CardTitle>
                <CardDescription>
                  Введите название, артикул и описание товара. Эти данные будут видны клиентам.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Выбор типа товара - ПЕРВЫЙ ЭЛЕМЕНТ */}
                  <div className="space-y-4 border border-gray-200 p-6 rounded-lg bg-gray-50">
                    <div>
                      <Label className="text-lg font-bold text-gray-800">Тип товара *</Label>
                      <p className="text-sm text-gray-600 mb-4">
                        Выберите тип товара для определения метода расчета стоимости
                      </p>
                    </div>
                    
                    {/* Основной селектор типа */}
                    <div className="w-full">
                      <Select
                        name="productType"
                        value={formData.productType}
                        onValueChange={(value: ProductType) => setFormData(prev => ({ ...prev, productType: value }))}
                      >
                        <SelectTrigger className="w-full h-12 text-base">
                          <SelectValue placeholder="Выберите тип товара" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STANDARD">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">📦</span>
                              <div>
                                <div className="font-medium">Стандартный товар</div>
                                <div className="text-xs text-muted-foreground">С расчетом по материалам и работам</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="ASSEMBLY">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">🔧</span>
                              <div>
                                <div className="font-medium">Сборный товар</div>
                                <div className="text-xs text-muted-foreground">Состоит из других товаров</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="WAREHOUSE">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">📋</span>
                              <div>
                                <div className="font-medium">Товар со склада</div>
                                <div className="text-xs text-muted-foreground">С фиксированной ценой</div>
                              </div>
                            </div>
                          </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Название товара *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Введите название товара"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sku">Артикул (SKU) *</Label>
                      <Input
                        id="sku"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        placeholder="ABC-001"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Описание товара</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Подробное описание товара, его характеристики и особенности"
                    />
                  </div>

                  <div>
                    <Label htmlFor="unit">Единица измерения *</Label>
                    <Select
                      name="unit"
                      value={formData.unit}
                      onValueChange={(value) => handleSelectChange('unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите единицу измерения" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Штучные</SelectLabel>
                          <SelectItem value="шт">Штуки (шт)</SelectItem>
                          <SelectItem value="комплект">Комплект</SelectItem>
                          <SelectItem value="пара">Пара</SelectItem>
                          <SelectItem value="упаковка">Упаковка</SelectItem>
                          <SelectItem value="рулон">Рулон</SelectItem>
                          <SelectItem value="лист">Лист</SelectItem>
                          <SelectItem value="катушка">Катушка</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Длина</SelectLabel>
                          <SelectItem value="мм">Миллиметры (мм)</SelectItem>
                          <SelectItem value="см">Сантиметры (см)</SelectItem>
                          <SelectItem value="дм">Дециметры (дм)</SelectItem>
                          <SelectItem value="м">Метры (м)</SelectItem>
                          <SelectItem value="км">Километры (км)</SelectItem>
                          <SelectItem value="пог. м">Погонные метры (пог. м)</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Площадь</SelectLabel>
                          <SelectItem value="мм2">мм²</SelectItem>
                          <SelectItem value="см2">см²</SelectItem>
                          <SelectItem value="дм2">дм²</SelectItem>
                          <SelectItem value="м2">м²</SelectItem>
                          <SelectItem value="км2">км²</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Объем</SelectLabel>
                          <SelectItem value="м3">м³</SelectItem>
                          <SelectItem value="л">Литры (л)</SelectItem>
                          <SelectItem value="мл">Миллилитры (мл)</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Вес</SelectLabel>
                          <SelectItem value="мг">Миллиграммы (мг)</SelectItem>
                          <SelectItem value="г">Граммы (г)</SelectItem>
                          <SelectItem value="кг">Килограммы (кг)</SelectItem>
                          <SelectItem value="т">Тонны (т)</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Время</SelectLabel>
                          <SelectItem value="мин">Минуты (мин)</SelectItem>
                          <SelectItem value="ч">Часы (ч)</SelectItem>
                          <SelectItem value="смена">Смена</SelectItem>
                          <SelectItem value="выезд">Выезд</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Специальные</SelectLabel>
                          <SelectItem value="%">Процент (%)</SelectItem>
                          <SelectItem value="люкс">Люксы</SelectItem>
                          <SelectItem value="вт">Ватт (вт)</SelectItem>
                          <SelectItem value="усл.ед">Условная единица (усл.ед)</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      * Обязательные поля для создания товара
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Карточка с изображениями */}
            <Card>
              <CardHeader>
                <CardTitle>🖼️ Изображения товара</CardTitle>
                <CardDescription>
                  Загрузите фотографии товара. Изображения автоматически конвертируются в формат WebP для оптимизации.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={formData.images ? JSON.parse(formData.images) : []}
                  onChange={(newImages) => handleSelectChange('images', JSON.stringify(newImages))}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Материалы */}
        <TabsContent value="materials">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Материалы</CardTitle>
                <CardDescription>Список материалов, необходимых для производства.</CardDescription>
              </div>
              <AddMaterialDialog onAdd={(material) => {
                setMaterialUsages(prev => [...prev, material])
              }} />
            </CardHeader>
            <CardContent>
              {materialUsages.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {materialUsages.map((usage, index) => (
                    <li key={index} className="py-2 flex justify-between items-center">
                      <span>{usage.materialItem.name} - {usage.quantity} {usage.materialItem.unit}</span>
                      <Button variant="ghost" size="icon" onClick={() => setMaterialUsages(prev => prev.filter((_, i) => i !== index))}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-gray-500">Материалы еще не добавлены.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Виды работ */}
        <TabsContent value="work">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Технологический процесс</CardTitle>
                <CardDescription>Перечень работ для изготовления товара.</CardDescription>
              </div>
              <AddWorkTypeDialog onAdd={(workType) => {
                setWorkTypeUsages(prev => [...prev, {
                  ...workType,
                  cost: workType.quantity * workType.workType.hourlyRate,
                  sequence: prev.length + 1,
                  unitType: 'TIME',
                  baseTime: workType.quantity
                }])
              }} />
            </CardHeader>
            <CardContent>
              {workTypeUsages.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {workTypeUsages.map((usage, index) => (
                    <li key={index} className="py-2 flex justify-between items-center">
                      <span>{usage.workType.name} - {usage.quantity} {usage.workType.unit}</span>
                      <Button variant="ghost" size="icon" onClick={() => setWorkTypeUsages(prev => prev.filter((_, i) => i !== index))}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-gray-500">Виды работ еще не добавлены.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Фонды */}
        <TabsContent value="funds">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Распределение фондов</CardTitle>
                <CardDescription>Накладные расходы, заложенные в стоимость.</CardDescription>
              </div>
              <AddFundDialog
                open={false}
                onOpenChange={() => {}}
                onAdd={async (fundId, categoryId, itemId, allocatedAmount, percentage) => {
                  setFundUsages(prev => [...prev, {
                    fundId,
                    categoryId,
                    itemId,
                    allocatedAmount: allocatedAmount || 0,
                    percentage: percentage || 0,
                    description: `Распределение из фонда ${fundId}`
                  }])
                  return Promise.resolve()
                }}
                productId=""
              />
            </CardHeader>
            <CardContent>
              {fundUsages.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {fundUsages.map((usage, index) => (
                    <li key={index} className="py-2 flex justify-between items-center">
                      <span>{usage.description || 'Распределение из фонда'} - {usage.allocatedAmount} {formData.currency}</span>
                      <Button variant="ghost" size="icon" onClick={() => setFundUsages(prev => prev.filter((_, i) => i !== index))}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-gray-500">Распределения из фондов еще не добавлены.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ценообразование */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Ценообразование и себестоимость</CardTitle>
              <CardDescription>Автоматический расчет на основе введенных данных.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium text-gray-500">Стоимость материалов</Label>
                  <p className="text-2xl font-bold">{materialCost.toFixed(2)} {formData.currency}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium text-gray-500">Стоимость работ</Label>
                  <p className="text-2xl font-bold">{laborCost.toFixed(2)} {formData.currency}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium text-gray-500">Накладные расходы</Label>
                  <p className="text-2xl font-bold">{overheadCost.toFixed(2)} {formData.currency}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Label className="text-sm font-medium text-blue-600">Полная себестоимость</Label>
                  <p className="text-2xl font-bold text-blue-700">{totalCost.toFixed(2)} {formData.currency}</p>
                </div>
              </div>
              <Separator />
              <div className="grid md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <Label htmlFor="margin">Торговая наценка (%)</Label>
                  <Input id="margin" name="margin" type="number" value={formData.margin} onChange={handleInputChange} placeholder="Например, 25" />
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <Label className="text-sm font-medium text-green-600">Цена продажи</Label>
                  <p className="text-3xl font-bold text-green-700">{formData.sellingPrice.toFixed(2)} {formData.currency}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Метод расчета</Label>
                <Select name="pricingMethod" value={formData.pricingMethod} onValueChange={(value) => handleSelectChange('pricingMethod', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED">Фиксированная</SelectItem>
                    <SelectItem value="PER_UNIT">За единицу</SelectItem>
                    <SelectItem value="PER_AREA">За площадь (м²)</SelectItem>
                    <SelectItem value="PER_VOLUME">За объем (м³)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Настройки */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Склад и доступность</CardTitle>
              <CardDescription>Управление складскими остатками и видимостью товара.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Категоризация и видимость</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Категория товара</Label>
                    <Select 
                      name="categoryId" 
                      value={formData.categoryId} 
                      onValueChange={(value) => handleSelectChange('categoryId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories && categories.length > 0 ? (
                          categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)
                        ) : (
                          <SelectItem value="loading" disabled>Загрузка категорий...</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Видимость</Label>
                    <Select name="isActive" value={String(formData.isActive)} onValueChange={(value) => handleSelectChange('isActive', value === 'true')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Активный</SelectItem>
                        <SelectItem value="false">Скрытый</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Управление остатками</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentStock">Текущий остаток</Label>
                    <Input id="currentStock" name="currentStock" type="number" value={formData.currentStock} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStock">Мин. остаток</Label>
                    <Input id="minStock" name="minStock" type="number" value={formData.minStock} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStock">Макс. остаток</Label>
                    <Input id="maxStock" name="maxStock" type="number" value={formData.maxStock} onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="isActive">Товар активен</Label>
                <Select name="isActive" value={String(formData.isActive)} onValueChange={(value) => handleSelectChange('isActive', value === 'true')}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Да</SelectItem>
                    <SelectItem value="false">Нет</SelectItem>
                  </SelectContent>
                </Select>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Неактивные товары не будут отображаться в каталоге и доступны для заказа.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Навигация */}
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={() => activeTabIndex > 0 && setActiveTab(tabOrder[activeTabIndex - 1])} disabled={activeTabIndex === 0}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
        <Button onClick={() => activeTabIndex < tabOrder.length - 1 && setActiveTab(tabOrder[activeTabIndex + 1])} disabled={activeTabIndex === tabOrder.length - 1}>
          Далее
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
