'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, ChevronDown, Package, Wrench, Calculator, DollarSign, FileText, Settings, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { AddMaterialDialog } from '@/components/add-material-dialog'
import { AddWorkTypeDialog } from '@/components/add-work-type-dialog'
import { AddFundDialog } from '@/components/add-fund-dialog'
import { ImageUpload } from '@/components/image-upload'
import { BaseUnitSelector } from '@/components/base-unit-selector'
import { BaseUnitCalculatorComponent } from '@/components/base-unit-calculator-component'

interface ProductWithDetails {
  id: string
  name: string
  description?: string
  sku: string
  unit: string
  baseCalculationUnit?: string
  variant: 'PRODUCT' | 'SERVICE'
  materialCost: number
  laborCost: number
  overheadCost: number
  totalCost: number
  sellingPrice: number
  margin: number
  currency: string
  productionTime: number
  currentStock: number
  minStock: number
  maxStock: number
  tags?: string
  specifications?: string
  images?: string
  isActive: boolean
  groupId?: string
  subgroupId?: string
  group?: {
    id: string
    name: string
    description?: string
  }
  subgroup?: {
    id: string
    name: string
    description?: string
  }
  materialUsages: Array<{
    id: string
    materialItemId: string
    quantity: number
    cost: number
    materialItem: {
      id: string
      name: string
      unit: string
      price: number
      currency: string
    }
  }>
  workTypeUsages: Array<{
    id: string
    workTypeId: string
    quantity: number
    cost: number
    sequence: number
    workType: {
      id: string
      name: string
      description?: string
      unit: string
      hourlyRate: number
      currency: string
      department?: {
        id: string
        name: string
      }
    }
  }>
  fundUsages?: Array<{
    id: string
    fundId: string
    categoryId: string
    itemId?: string
    allocatedAmount: number
    percentage?: number
    description?: string
    fund: {
      id: string
      name: string
      description?: string
      fundType: string
    }
    category: {
      id: string
      name: string
      emoji: string
      categoryType: string
    }
    item?: {
      id: string
      name: string
      amount: number
    }
  }>
}

interface EditProductPageProps {
  product: ProductWithDetails
}

export function EditProductPage({ product }: EditProductPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  // Все состояния должны быть объявлены в начале компонента
  const [isInitialized, setIsInitialized] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [previousTab, setPreviousTab] = useState<string | null>(null)
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | null>(null)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    sku: product.sku,
    unit: product.unit,
    baseCalculationUnit: product.baseCalculationUnit || '',
    variant: product.type,
    sellingPrice: product.sellingPrice,
    overheadCost: product.overheadCost,
    margin: product.margin,
    currency: product.currency,
    currentStock: product.currentStock,
    minStock: product.minStock,
    maxStock: product.maxStock,
    isActive: product.isActive,
  })
  const [materialUsages, setMaterialUsages] = useState(product.materialUsages)
  const [workTypeUsages, setWorkTypeUsages] = useState(product.workTypeUsages)
  const [fundUsages, setFundUsages] = useState(product.fundUsages || [])
  const [showFundDialog, setShowFundDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [productImages, setProductImages] = useState<Array<{
    filename: string
    thumbnail: string
    url: string
    thumbnailUrl: string
    size: number
    width: number
    height: number
    originalName: string
    uploadedAt: string
  }>>([])
  
  // Функция для расчета стоимости на базовую единицу
  const calculateCostPerBaseUnit = (totalCost: number) => {
    if (!formData.baseCalculationUnit || totalCost === 0) return null
    
    return {
      cost: totalCost,
      unit: formData.baseCalculationUnit,
      formatted: `${formatCurrency(totalCost)}/${formData.baseCalculationUnit}`
    }
  }
  
  // Определяем порядок вкладок для навигации
  const tabOrder = ['basic', 'materials', 'work', 'funds', 'pricing', 'settings']
  
  // Функция для анимированного переключения вкладок
  const switchTabWithAnimation = (newTab: string) => {
    if (newTab === activeTab || isTransitioning) return
    
    setIsTransitioning(true)
    setPreviousTab(activeTab)
    
    // Более быстрый переход для плавности
    setTimeout(() => {
      setActiveTab(newTab)
      setTimeout(() => {
        setIsTransitioning(false)
        setPreviousTab(null)
        setTransitionDirection(null)
      }, 200)
    }, 100)
  }
  
  // Функции навигации между вкладками
  const goToPreviousTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex > 0) {
      switchTabWithAnimation(tabOrder[currentIndex - 1])
    }
  }
  
  const goToNextTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex < tabOrder.length - 1) {
      switchTabWithAnimation(tabOrder[currentIndex + 1])
    }
  }
  
  // Функция для открытия товара в универсальном калькуляторе
  const openInCalculator = async (productId: string | undefined) => {
    if (!productId) return
    
    try {
      // Получаем данные товара для калькулятора
      const response = await fetch(`/api/products/${productId}/calculation-data`)
      if (!response.ok) throw new Error('Не удалось получить данные товара')
      
      const data = await response.json()
      
      if (data.calculation?.templateId) {
        // Если найден шаблон, открываем его с предзаполненными параметрами
        const url = new URL('/universal-calc', window.location.origin)
        url.searchParams.append('template', data.calculation.templateId)
        
        // Передаем ID товара для последующего обновления
        url.searchParams.append('productId', productId)
        
        if (data.calculation.calculationId) {
          url.searchParams.append('calculation', data.calculation.calculationId)
        }
        
        if (data.calculation.parameters) {
          url.searchParams.append('params', encodeURIComponent(JSON.stringify(data.calculation.parameters)))
        }
        
        // Открываем страницу калькулятора
        window.open(url.toString(), '_blank')
      } else {
        // Если шаблон не найден, переходим на страницу выбора шаблона
        toast({
          variant: 'info',
          title: 'Шаблон калькулятора не найден',
          description: 'Выберите подходящий шаблон для расчета этого товара'
        })
        router.push('/universal-calc')
      }
    } catch (error) {
      console.error('Ошибка при открытии товара в калькуляторе:', error)
      toast({
        variant: 'error',
        title: 'Ошибка',
        description: 'Не удалось открыть калькулятор для этого товара'
      })
    }
  }
  
  // Инициализируем компонент
  useEffect(() => {
    console.log('EditProductPage: Initializing with product:', product.id)
    setIsInitialized(true)
    // Загружаем существующие изображения
    loadProductImages()
  }, [product.id])

  // Функция для загрузки изображений товара
  const loadProductImages = async () => {
    try {
      const response = await fetch(`/api/products/${product.id}/images`)
      const result = await response.json()
      
      if (response.ok && result.success) {
        setProductImages(result.data.images || [])
      }
    } catch (error) {
      console.error('Failed to load product images:', error)
    }
  }

  // Функция для сохранения изображений в базу данных
  const saveProductImages = async (images: typeof productImages) => {
    try {
      const response = await fetch(`/api/products/${product.id}/images`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ images })
      })

      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save images')
      }
      
      return result.data
    } catch (error) {
      console.error('Failed to save product images:', error)
      throw error
    }
  }
  
  // Обработка клавиатурной навигации
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + стрелки для навигации между вкладками
      if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPreviousTab()
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowRight') {
        event.preventDefault()
        goToNextTab()
      }
      // Числовые клавиши 1-6 для быстрого переключения
      if (event.key >= '1' && event.key <= '6' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        const tabIndex = parseInt(event.key) - 1
        switchTabWithAnimation(tabOrder[tabIndex])
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, isTransitioning])
  
  // Показываем загрузку пока компонент не инициализирован
  if (!isInitialized) {
    return (
      <div className="compact-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка товара...</p>
          </div>
        </div>
      </div>
    )
  }
  
  const handleTouchStart = (event: React.TouchEvent) => {
    try {
      const touch = event.touches[0]
      setTouchStartX(touch.clientX)
      setTouchStartY(touch.clientY)
      
      // Добавляем тактильную обратную связь (только если элемент существует)
      const target = event.currentTarget as HTMLElement
      if (target && target.classList) {
        target.classList.add('touch-feedback')
        setTimeout(() => {
          if (target && target.classList) {
            target.classList.remove('touch-feedback')
          }
        }, 150)
      }
    } catch (error) {
      console.warn('Touch start error:', error)
    }
  }
  
  const handleTouchEnd = (event: React.TouchEvent) => {
    try {
      if (touchStartX === null || touchStartY === null) return
      
      const touch = event.changedTouches[0]
      if (!touch) return
      
      const deltaX = touch.clientX - touchStartX
      const deltaY = touch.clientY - touchStartY
      
      // Проверяем, что это горизонтальный свайп (а не вертикальный скролл)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // Свайп вправо - предыдущая вкладка
          goToPreviousTab()
        } else {
          // Свайп влево - следующая вкладка
          goToNextTab()
        }
      }
      
      setTouchStartX(null)
      setTouchStartY(null)
    } catch (error) {
      console.warn('Touch end error:', error)
      setTouchStartX(null)
      setTouchStartY(null)
    }
  }
  
  // Функция для перезагрузки данных товара
  const reloadProductData = async () => {
    try {
      const response = await fetch(`/api/products/${product.id}`)
      if (response.ok) {
        const updatedProduct = await response.json()
        setMaterialUsages(updatedProduct.materialUsages)
        setWorkTypeUsages(updatedProduct.workTypeUsages)
        setFundUsages(updatedProduct.fundUsages || [])
        // Обновляем основные данные товара если нужно
        setFormData(prev => ({
          ...prev,
          name: updatedProduct.name,
          description: updatedProduct.description || '',
          sku: updatedProduct.sku,
          unit: updatedProduct.unit,
          variant: updatedProduct.type,
        }))
      }
    } catch (error) {
      console.error('Error reloading product data:', error)
    }
  }

  // Функция удаления материала
  const handleRemoveMaterial = async (materialUsageId: string) => {
    try {
      const response = await fetch(`/api/products/${product.id}/materials?usageId=${materialUsageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          variant: 'success',
          title: 'Материал удален из товара',
        })
        reloadProductData()
      } else {
        toast({
          variant: 'error',
          title: 'Ошибка удаления материала',
        })
      }
    } catch (error) {
      console.error('Error removing material:', error)
      toast({
        variant: 'error',
        title: 'Ошибка удаления материала',
      })
    }
  }

  // Функция удаления вида работы
  const handleRemoveWorkType = async (workTypeUsageId: string) => {
    try {
      const response = await fetch(`/api/products/${product.id}/work-types?usageId=${workTypeUsageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          variant: 'success',
          title: 'Вид работы удален из товара',
        })
        reloadProductData()
      } else {
        toast({
          variant: 'error',
          title: 'Ошибка удаления вида работы',
        })
      }
    } catch (error) {
      console.error('Error removing work type:', error)
      toast({
        variant: 'error',
        title: 'Ошибка удаления вида работы',
      })
    }
  }

  // Функция добавления фонда
  const handleAddFund = async (fundId: string, categoryId: string, itemId?: string, allocatedAmount?: number, percentage?: number) => {
    try {
      const response = await fetch(`/api/products/${product.id}/funds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fundId,
          categoryId,
          itemId,
          allocatedAmount,
          percentage,
        }),
      })

      if (response.ok) {
        toast({
          variant: 'success',
          title: 'Фонд добавлен к товару',
        })
        reloadProductData()
      } else {
        const error = await response.json()
        toast({
          variant: 'error',
          title: 'Ошибка добавления фонда',
          description: error.error || 'Неизвестная ошибка',
        })
      }
    } catch (error) {
      console.error('Error adding fund:', error)
      toast({
        variant: 'error',
        title: 'Ошибка добавления фонда',
      })
    }
  }

  // Функция удаления фонда
  const handleRemoveFund = async (fundUsageId: string) => {
    try {
      const response = await fetch(`/api/products/${product.id}/funds?usageId=${fundUsageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          variant: 'success',
          title: 'Фонд удален из товара',
        })
        reloadProductData()
      } else {
        toast({
          variant: 'error',
          title: 'Ошибка удаления фонда',
        })
      }
    } catch (error) {
      console.error('Error removing fund:', error)
      toast({
        variant: 'error',
        title: 'Ошибка удаления фонда',
      })
    }
  }
  
  // Вычисляемые значения по этапам
  const materialCost = materialUsages.reduce((sum, usage) => sum + usage.cost, 0)
  const laborCost = workTypeUsages.reduce((sum, usage) => sum + usage.cost, 0)
  const fundsCost = fundUsages.reduce((sum: number, fund: any) => sum + (fund.allocatedAmount || 0), 0)
  const totalDirectCost = materialCost + laborCost
  const totalCost = totalDirectCost + fundsCost + formData.overheadCost
  const productionTime = workTypeUsages.reduce((sum, usage) => sum + usage.quantity, 0)
  
  // Этапы формирования себестоимости
  const costSteps = [
    { 
      id: 'materials', 
      name: 'Материалы', 
      cost: materialCost, 
      icon: Package,
      description: 'Сырье и материалы'
    },
    { 
      id: 'labor', 
      name: 'Работы', 
      cost: laborCost, 
      icon: Wrench,
      description: 'Технологические операции'
    },
    { 
      id: 'funds', 
      name: 'Фонды', 
      cost: fundsCost, 
      icon: DollarSign,
      description: 'Накладные расходы из фондов'
    },
    { 
      id: 'overhead', 
      name: 'Прочие', 
      cost: formData.overheadCost, 
      icon: Calculator,
      description: 'Дополнительные расходы'
    }
  ]
  
  const handleSave = async () => {
    try {
      setLoading(true)
      
      const updateData = {
        ...formData,
        materialCost,
        laborCost,
        totalCost,
        productionTime,
      }
      
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update product')
      }
      
      toast({
        variant: 'success',
        title: 'Товар обновлен успешно',
      })
      
      router.push('/products')
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        variant: 'error',
        title: 'Ошибка при обновлении товара',
      })
    } finally {
      setLoading(false)
    }
  }
  
  const formatCurrency = (amount: number, currency: string = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Обработчики изображений
  const handleImageUploaded = async (image: {
    filename: string
    thumbnail: string
    url: string
    thumbnailUrl: string
    size: number
    width: number
    height: number
    originalName: string
    uploadedAt: string
  }) => {
    const newImages = [...productImages, image]
    setProductImages(newImages)
    
    try {
      await saveProductImages(newImages)
      console.log('Product images saved successfully')
    } catch (error) {
      console.error('Failed to save product images:', error)
      // Можно показать уведомление об ошибке
    }
  }

  const handleImageRemoved = async (filename: string) => {
    const newImages = productImages.filter(img => img.filename !== filename)
    setProductImages(newImages)
    
    try {
      await saveProductImages(newImages)
      console.log('Product images updated successfully')
    } catch (error) {
      console.error('Failed to update product images:', error)
      // Можно показать уведомление об ошибке
    }
  }

  return (
    <div className="compact-container">
      {/* Header */}
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
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">SKU: {product.sku}</p>
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
            variant="outline"
            onClick={() => openInCalculator(product?.id)}
            disabled={loading}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Расчет в калькуляторе
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
        </div>
      </div>

      {/* Cost Formation Progress */}
      {/* Временно скрыто: блок "Формирование себестоимости товара" для упрощения UX */}
      {/* 
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Формирование себестоимости товара
          </CardTitle>
          <CardDescription>
            Этапы расчета полной стоимости производства
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {costSteps.map((step, index) => {
              const Icon = step.icon
              const percentage = totalCost > 0 ? (step.cost / totalCost) * 100 : 0
              
              return (
                <Card key={step.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">{step.name}</span>
                      </div>
                      <Badge variant="secondary">
                        {percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {formatCurrency(step.cost)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                    <Progress value={percentage} className="mt-2 h-2" />
                  </CardContent>
                  {index < costSteps.length - 1 && (
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 hidden md:block">
                      <div className="w-4 h-4 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center">
                        <Plus className="h-2 w-2 text-blue-600" />
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Итоговая себестоимость</h3>
                <p className="text-sm text-muted-foreground">
                  Материалы + Работы + Фонды + Прочие расходы
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(totalCost)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Время: {productionTime.toFixed(1)} ч
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      */}

      {/* Main Tabs - Switch Style */}
      <Tabs value={activeTab} onValueChange={switchTabWithAnimation} className="compact-tabs">
        <TabsList className="switch-tabs-container grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full mb-6 h-auto">
          {/* Switch Indicator */}
          <div 
            className="switch-indicator"
            style={{
              left: `calc(${(tabOrder.indexOf(activeTab) / tabOrder.length) * 100}% + 6px)`,
              width: `calc(${100 / tabOrder.length}% - 12px)`
            }}
          />
          <TabsTrigger 
            value="basic" 
            className="tab-trigger h-14 px-3 py-2"
          >
            <div className="tab-icon-group">
              <div className="tab-number w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs font-bold flex items-center justify-center">1</div>
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div className="tab-text-group">
              <div className="tab-text text-sm font-medium">Основное</div>
              <div className="tab-description text-xs text-muted-foreground">Инфо</div>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="materials" 
            className="tab-trigger h-14 px-3 py-2"
          >
            <div className="tab-icon-group">
              <div className="tab-number w-5 h-5 bg-green-100 text-green-600 rounded-full text-xs font-bold flex items-center justify-center">2</div>
              <Package className="h-4 w-4 text-green-600" />
            </div>
            <div className="tab-text-group">
              <div className="tab-text text-sm font-medium">Материалы</div>
              <div className="tab-description text-xs text-muted-foreground">Сырье</div>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="work" 
            className="tab-trigger h-14 px-3 py-2"
          >
            <div className="tab-icon-group">
              <div className="tab-number w-5 h-5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold flex items-center justify-center">3</div>
              <Wrench className="h-4 w-4 text-orange-600" />
            </div>
            <div className="tab-text-group">
              <div className="tab-text text-sm font-medium">Работы</div>
              <div className="tab-description text-xs text-muted-foreground">Труд</div>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="funds" 
            className="tab-trigger h-14 px-3 py-2"
          >
            <div className="tab-icon-group">
              <div className="tab-number w-5 h-5 bg-yellow-100 text-yellow-600 rounded-full text-xs font-bold flex items-center justify-center">4</div>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="tab-text-group">
              <div className="tab-text text-sm font-medium">Фонды</div>
              <div className="tab-description text-xs text-muted-foreground">Ресурсы</div>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="pricing" 
            className="tab-trigger h-14 px-3 py-2"
          >
            <div className="tab-icon-group">
              <div className="tab-number w-5 h-5 bg-purple-100 text-purple-600 rounded-full text-xs font-bold flex items-center justify-center">5</div>
              <Calculator className="h-4 w-4 text-purple-600" />
            </div>
            <div className="tab-text-group">
              <div className="tab-text text-sm font-medium">Цена</div>
              <div className="tab-description text-xs text-muted-foreground">Маржа</div>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="tab-trigger h-14 px-3 py-2"
          >
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

        {/* Tab Content with Animation Wrapper */}
        <div 
          className={`tab-content-wrapper transition-opacity duration-300 ${
            isTransitioning ? 'opacity-50' : 'opacity-100'
          }`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Basic Information Tab */}
          <TabsContent 
            value="basic" 
            className={`animate-tab-content ${activeTab === 'basic' && !isTransitioning ? 'animate-fade-in-up' : ''}`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Основная информация */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>📋 Основная информация</CardTitle>
                  <CardDescription>
                    Введите название, артикул и описание товара. Эти данные будут видны клиентам.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Название товара *</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Введите название товара"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sku">Артикул (SKU) *</Label>
                      <Input
                        id="sku"
                        value={formData.sku || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                        placeholder="ABC-001"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Описание товара</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      placeholder="Подробное описание товара, его характеристики и особенности"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Тип продукта</Label>
                      <Select 
                        value={formData.variant || 'PRODUCT'} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, variant: value as 'PRODUCT' | 'SERVICE' }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRODUCT">Товар</SelectItem>
                          <SelectItem value="SERVICE">Услуга</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="unit">Единица продажи</Label>
                      <Input
                        id="unit"
                        value={formData.unit || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                        placeholder="шт, кг, м, л"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Единица измерения для продажи клиентам
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      * Обязательные поля для создания товара
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Изображения товара */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>📸 Изображения товара</CardTitle>
                  <CardDescription>
                    Загрузите фотографии товара. Изображения автоматически конвертируются в формат WebP для оптимизации.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    onImageUploaded={handleImageUploaded}
                    onImageRemoved={handleImageRemoved}
                    currentImages={productImages}
                    maxFiles={5}
                    accept="image/*"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Базовая единица калькуляции - новый блок */}
            <div className="mt-6">
              <BaseUnitSelector
                value={formData.baseCalculationUnit}
                onChange={(value) => setFormData(prev => ({ ...prev, baseCalculationUnit: value }))}
              />
            </div>
          </TabsContent>

        {/* Materials Tab */}
        <TabsContent 
          value="materials" 
          className={`animate-tab-content ${activeTab === 'materials' && !isTransitioning ? 'animate-fade-in-up' : ''}`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Сырье</span>
                <div className="flex items-center space-x-2 ml-auto">
                  <Badge variant="secondary">
                    {formatCurrency(materialCost)}
                  </Badge>
                  {formData.baseCalculationUnit && materialCost > 0 && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {formatCurrency(materialCost)}/{formData.baseCalculationUnit}
                    </Badge>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Материалы, используемые для производства
                {formData.baseCalculationUnit && (
                  <span className="text-blue-600 ml-2">
                    • Расчет на 1 {formData.baseCalculationUnit}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Используемые материалы</h4>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" disabled>
                      Создать сырье
                    </Button>
                    <AddMaterialDialog 
                      productId={product.id} 
                      onMaterialAdded={reloadProductData}
                    />
                  </div>
                </div>
                
                {materialUsages?.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                      <div>Наименование</div>
                      <div>Группа сырья</div>
                      <div>Стоимость, руб.</div>
                      <div>Ед. измерения</div>
                      <div>Количество</div>
                      <div>Итого</div>
                      <div></div>
                    </div>
                    
                    {materialUsages.map((usage, index) => (
                      <div key={usage.id} className="grid grid-cols-7 gap-4 items-center py-2">
                        <div className="font-medium">
                          {usage.materialItem.name}
                        </div>
                        <div>
                          <Badge variant="secondary">Листовые материалы</Badge>
                        </div>
                        <div>
                          {formatCurrency(usage.materialItem.price)}
                        </div>
                        <div>{usage.materialItem.unit}</div>
                        <div>{usage.quantity}</div>
                        <div className="font-medium">
                          {formatCurrency(usage.cost)}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveMaterial(usage.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    
                    <Separator />
                    <div className="flex justify-between items-center font-medium">
                      <span>Итого материалов</span>
                      <span>{formatCurrency(materialCost)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Материалы не добавлены
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work Types Tab */}
        <TabsContent 
          value="work" 
          className={`animate-tab-content ${activeTab === 'work' && !isTransitioning ? 'animate-fade-in-up' : ''}`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5" />
                <span>Виды работ</span>
                <div className="flex items-center space-x-2 ml-auto">
                  <Badge variant="secondary">
                    {formatCurrency(laborCost)}
                  </Badge>
                  {formData.baseCalculationUnit && laborCost > 0 && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {formatCurrency(laborCost)}/{formData.baseCalculationUnit}
                    </Badge>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Трудозатраты для производства товара
                {formData.baseCalculationUnit && (
                  <span className="text-green-600 ml-2">
                    • Расчет на 1 {formData.baseCalculationUnit}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Необходимые работы</h4>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" disabled>
                      Создать вид работ
                    </Button>
                    <AddWorkTypeDialog 
                      productId={product.id} 
                      onWorkTypeAdded={reloadProductData}
                    />
                  </div>
                </div>
                
                {workTypeUsages?.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                      <div>Наименование</div>
                      <div>Группа</div>
                      <div>Стоимость, руб.</div>
                      <div>Ед. измерения</div>
                      <div>Количество</div>
                      <div>Итого</div>
                    </div>
                    
                    {workTypeUsages
                      .sort((a, b) => a.sequence - b.sequence)
                      .map((usage) => (
                        <div key={usage.id} className="grid grid-cols-6 gap-4 items-center py-2">
                          <div className="font-medium">
                            {usage.workType.name}
                          </div>
                          <div>
                            <Badge variant="outline">
                              {usage.workType.department?.name || 'Без отдела'}
                            </Badge>
                          </div>
                          <div>
                            {formatCurrency(usage.workType.hourlyRate)}
                          </div>
                          <div>{usage.workType.unit}</div>
                          <div>{usage.quantity}</div>
                          <div className="font-medium">
                            {formatCurrency(usage.cost)}
                          </div>
                        </div>
                      ))}
                    
                    <Separator />
                    <div className="flex justify-between items-center font-medium">
                      <span>Итого работ</span>
                      <span>{formatCurrency(laborCost)}</span>
                    </div>
                    <div className="flex justify-end space-x-4 pt-2">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Общее время работ:</div>
                        <div className="text-lg font-semibold">{productionTime.toFixed(1)} ч</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Виды работ не добавлены
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Funds Tab */}
        <TabsContent 
          value="funds" 
          className={`animate-tab-content ${activeTab === 'funds' && !isTransitioning ? 'animate-fade-in-up' : ''}`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Фонды</span>
                <div className="flex items-center space-x-2 ml-auto">
                  <Badge variant="secondary">
                    {formatCurrency(fundsCost)}
                  </Badge>
                  {formData.baseCalculationUnit && fundsCost > 0 && (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      {formatCurrency(fundsCost)}/{formData.baseCalculationUnit}
                    </Badge>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Распределение затрат по фондам предприятия
                {formData.baseCalculationUnit && (
                  <span className="text-orange-600 ml-2">
                    • Расчет на 1 {formData.baseCalculationUnit}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Распределение фондов</h4>
                  <Button onClick={() => setShowFundDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить фонд
                  </Button>
                </div>
                
                {fundUsages?.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                      <div>Фонд</div>
                      <div>Категория</div>
                      <div>Элемент</div>
                      <div>Сумма</div>
                      <div>Процент</div>
                      <div>Действия</div>
                    </div>
                    
                    {fundUsages.map((usage) => (
                      <div key={usage.id} className="grid grid-cols-6 gap-4 items-center py-2">
                        <div className="font-medium">
                          {usage.fund.name}
                          <div className="text-xs text-gray-500">
                            <Badge variant="outline">
                              {usage.fund.fundType}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-lg mr-1">{usage.category.emoji}</span>
                          {usage.category.name}
                          <div className="text-xs text-gray-500">
                            {usage.category.categoryType}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {usage.item ? usage.item.name : 'Общая категория'}
                        </div>
                        <div className="font-medium text-green-600">
                          {formatCurrency(usage.allocatedAmount)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {usage.percentage ? `${usage.percentage}%` : '-'}
                        </div>
                        <div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFund(usage.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Фонды не добавлены</p>
                    <p className="text-sm">Используйте кнопку выше для добавления фондов</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab - Революционный калькулятор */}
        <TabsContent 
          value="pricing" 
          className={`animate-tab-content ${activeTab === 'pricing' && !isTransitioning ? 'animate-fade-in-up' : ''}`}
        >
          {formData.baseCalculationUnit ? (
            <div className="space-y-6">
              {/* Заголовок с информацией о базовой единице */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">
                        🔥 Интеллектуальное ценообразование
                      </h3>
                      <p className="text-blue-700 text-sm">
                        Расчет ведется на базовую единицу: <strong>{formData.baseCalculationUnit}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-blue-600">Общая себестоимость</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {formatCurrency(totalCost)}/{formData.baseCalculationUnit}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Революционный калькулятор */}
              <BaseUnitCalculatorComponent
                productId={product.id}
                baseUnit={formData.baseCalculationUnit}
                onCalculationUpdate={(calculation) => {
                  // Обновляем данные формы на основе расчетов
                  console.log('Расчет обновлен:', calculation)
                }}
              />

              {/* Блок быстрых действий для маржи */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Быстрая настройка маржи
                  </CardTitle>
                  <CardDescription>
                    Установите желаемую маржу одним кликом
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { margin: 15, label: '15%', desc: 'Минимальная', color: 'bg-red-50 border-red-200 text-red-700' },
                      { margin: 20, label: '20%', desc: 'Базовая', color: 'bg-orange-50 border-orange-200 text-orange-700' },
                      { margin: 25, label: '25%', desc: 'Хорошая', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                      { margin: 30, label: '30%', desc: 'Отличная', color: 'bg-green-50 border-green-200 text-green-700' }
                    ].map((item) => (
                      <button
                        key={item.margin}
                        onClick={() => {
                          const recommendedPrice = totalCost * (1 + item.margin / 100)
                          setFormData(prev => ({ 
                            ...prev, 
                            margin: item.margin,
                            sellingPrice: Math.round(recommendedPrice)
                          }))
                        }}
                        className={`p-3 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                          formData.margin === item.margin 
                            ? 'ring-2 ring-blue-500 ' + item.color
                            : item.color
                        }`}
                      >
                        <div className="font-bold text-lg">{item.label}</div>
                        <div className="text-xs">{item.desc}</div>
                        <div className="text-xs mt-1">
                          {formatCurrency(Math.round(totalCost * (1 + item.margin / 100)))}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Выберите базовую единицу измерения</h3>
                <p className="text-muted-foreground mb-4">
                  Для расчета стоимости сначала выберите базовую единицу измерения на вкладке "Основное"
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('basic')}
                >
                  Перейти к основным настройкам
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
                    <Label>Финальная цена продажи, руб</Label>
                    <Input
                      type="number"
                      value={formData.sellingPrice || 0}
                      onChange={(e) => {
                        const sellingPrice = parseFloat(e.target.value) || 0
                        const actualMargin = totalCost > 0 ? ((sellingPrice - totalCost) / totalCost * 100) : 0
                        setFormData(prev => ({ 
                          ...prev, 
                          sellingPrice,
                          margin: Math.round(actualMargin * 100) / 100
                        }))
                      }}
                      className="font-medium text-lg"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Цена, которую увидит клиент
                    </div>
                  </div>
                  <div>
                    <Label>Прибыль с единицы</Label>
                    <div className="space-y-2">
                      <Input
                        type="text"
                        readOnly
                        value={formatCurrency(Math.max(0, (formData.sellingPrice || 0) - totalCost))}
                        className={`font-medium text-lg ${
                          (formData.sellingPrice || 0) > totalCost ? 'text-green-600' : 'text-red-600'
                        }`}
                      />
                      <div className={`text-xs ${
                        (formData.sellingPrice || 0) > totalCost ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(formData.sellingPrice || 0) > totalCost 
                          ? `Прибыльность: ${((((formData.sellingPrice || 0) - totalCost) / totalCost * 100) || 0).toFixed(1)}%`
                          : (formData.sellingPrice || 0) < totalCost 
                            ? `Убыток: ${(((totalCost - (formData.sellingPrice || 0)) / totalCost * 100) || 0).toFixed(1)}%`
                            : 'Без прибыли'
                        }
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Анализ прибыльности */}
                <div className="pt-4 border-t space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Время производства</div>
                      <div className="text-xl font-semibold">{productionTime.toFixed(1)} ч</div>
                    </div>
                    <div className={`text-center p-4 rounded-lg ${
                      (formData.sellingPrice || 0) > totalCost ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <div className="text-sm text-muted-foreground">Прибыль за час</div>
                      <div className={`text-xl font-semibold ${
                        (formData.sellingPrice || 0) > totalCost ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {productionTime > 0 
                          ? formatCurrency(Math.max(0, (formData.sellingPrice || 0) - totalCost) / productionTime)
                          : formatCurrency(0)
                        }
                      </div>
                    </div>
                  </div>

                  {/* Рекомендации по ценообразованию */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">💡 Рекомендации:</h4>
                    <div className="text-xs text-blue-700 space-y-1">
                      {(formData.sellingPrice || 0) <= totalCost && (
                        <p>• ⚠️ Цена продажи не покрывает себестоимость. Увеличьте цену или оптимизируйте затраты.</p>
                      )}
                      {(formData.sellingPrice || 0) > totalCost && ((((formData.sellingPrice || 0) - totalCost) / totalCost * 100) < 15) && (
                        <p>• 📈 Низкая маржа (&lt;15%). Рассмотрите увеличение цены для стабильной прибыли.</p>
                      )}
                      {(formData.sellingPrice || 0) > totalCost && ((((formData.sellingPrice || 0) - totalCost) / totalCost * 100) >= 15) && ((((formData.sellingPrice || 0) - totalCost) / totalCost * 100) <= 30) && (
                        <p>• ✅ Оптимальная маржа (15-30%). Хороший баланс прибыльности и конкурентоспособности.</p>
                      )}
                      {(formData.sellingPrice || 0) > totalCost && ((((formData.sellingPrice || 0) - totalCost) / totalCost * 100) > 30) && (
                        <p>• 🎯 Высокая маржа (&gt;30%). Убедитесь в конкурентоспособности цены на рынке.</p>
                      )}
                      <p>• 📊 Средняя маржа в отрасли: 15-25%. Отслеживайте цены конкурентов.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent 
          value="settings" 
          className={`animate-tab-content ${activeTab === 'settings' && !isTransitioning ? 'animate-fade-in-up' : ''}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timing & Workflow */}
            <Card>
              <CardHeader>
                <CardTitle>Производственные параметры</CardTitle>
                <CardDescription>
                  Настройки времени производства и процессов
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded">
                    <Label className="text-sm">Дни</Label>
                    <div className="text-2xl font-bold text-gray-600">
                      {Math.floor(productionTime / 24)}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded">
                    <Label className="text-sm">Часы</Label>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.floor(productionTime % 24)}
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <Label className="text-sm">Минуты</Label>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((productionTime % 1) * 60)}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Label className="text-sm font-medium">Общее время производства</Label>
                  <div className="text-3xl font-bold text-center py-4">
                    {productionTime.toFixed(1)} часов
                  </div>
                </div>
                
                <div>
                  <Label>По окончанию тарифа, перенести на воронку</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Выбрать воронку" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="funnel1">Воронка 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Теги</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тег" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tag1">Тег 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Additional Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Дополнительные настройки</CardTitle>
                <CardDescription>
                  Складские остатки и другие параметры
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Текущий остаток</Label>
                    <Input
                      type="number"
                      value={formData.currentStock || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentStock: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Минимальный остаток</Label>
                    <Input
                      type="number"
                      value={formData.minStock || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, minStock: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Максимальный остаток</Label>
                  <Input
                    type="number"
                    value={formData.maxStock || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxStock: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                
                <div className="pt-4 border-t">
                  <Label>Статус товара</Label>
                  <Select 
                    value={formData.isActive ? 'active' : 'inactive'} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value === 'active' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Активный</SelectItem>
                      <SelectItem value="inactive">Неактивный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        </div>

      </Tabs>

      {/* Диалог добавления фонда */}
      <AddFundDialog
        open={showFundDialog}
        onOpenChange={setShowFundDialog}
        onAdd={handleAddFund}
        productId={product.id}
      />
    </div>
  )
}

export default EditProductPage
