'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Save, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddMaterialDialog } from '@/components/add-material-dialog'
import { AddWorkTypeDialog } from '@/components/add-work-type-dialog'
import { AddFundDialog } from '@/components/add-fund-dialog'
import { ImageUpload } from '@/components/image-upload'

// Types
interface MaterialUsage {
  id?: string
  materialItemId?: string
  quantity: number
  cost: number
  materialItem: {
    id: string
    name: string
    unit: string
    price: number
    currency: string
  }
}

interface WorkTypeUsage {
  id?: string
  workTypeId?: string
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
}

interface FundUsage {
  id?: string
  fundId?: string
  categoryId?: string
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
}

interface ProductImage {
  filename: string
  thumbnail: string
  url: string
  thumbnailUrl: string
  size: number
  width: number
  height: number
  originalName: string
  uploadedAt: string
}

type ProductType = 'PRODUCT' | 'SERVICE'

interface FormState {
  name: string
  description: string
  sku: string
  unit: string
  variant: ProductType
  sellingPrice: number
  overheadCost: number
  margin: number
  currency: string
  currentStock: number
  minStock: number
  maxStock: number
  isActive: boolean
}

const initialFormState: FormState = {
  name: '',
  description: '',
  sku: '',
  unit: 'шт',
  variant: 'PRODUCT',
  sellingPrice: 0,
  overheadCost: 0,
  margin: 30,
  currency: 'RUB',
  currentStock: 0,
  minStock: 0,
  maxStock: 0,
  isActive: true,
}

export default function CreateProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // State
  const [formData, setFormData] = useState<FormState>(initialFormState)
  const [activeTab, setActiveTab] = useState('basic')
  
  // Usage states
  const [materialUsages, setMaterialUsages] = useState<MaterialUsage[]>([])
  const [workTypeUsages, setWorkTypeUsages] = useState<WorkTypeUsage[]>([])
  const [fundUsages, setFundUsages] = useState<FundUsage[]>([])
  const [productImages, setProductImages] = useState<ProductImage[]>([])

  // Dialog states
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false)
  const [workTypeDialogOpen, setWorkTypeDialogOpen] = useState(false)
  const [fundDialogOpen, setFundDialogOpen] = useState(false)

  // UI states
  const [loading, setLoading] = useState(false)

  // Handlers
  const handleMaterialAdd = (material: MaterialUsage) => {
    setMaterialUsages(prev => [...prev, material])
    setMaterialDialogOpen(false)
  }

  const handleWorkTypeAdd = (workType: WorkTypeUsage) => {
    setWorkTypeUsages(prev => [...prev, workType])
    setWorkTypeDialogOpen(false)
  }

  const handleFundAdd = (fund: FundUsage) => {
    setFundUsages(prev => [...prev, fund])
    setFundDialogOpen(false)
  }

  // Save handler
  const handleSave = async () => {
    try {
      setLoading(true)
      
      const productData = {
        ...formData,
        materialUsages: materialUsages.map(m => ({
          materialItemId: m.materialItemId || m.materialItem.id,
          quantity: m.quantity
        })),
        workTypeUsages: workTypeUsages.map(w => ({
          workTypeId: w.workTypeId || w.workType.id,
          quantity: w.quantity,
          sequence: w.sequence || 0
        })),
        fundUsages: fundUsages.map(f => ({
          fundId: f.fundId || f.fund.id,
          categoryId: f.categoryId || f.category.id,
          allocatedAmount: f.allocatedAmount,
          percentage: f.percentage || 0
        })),
        images: productImages.map(img => img.url).join(',')
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        throw new Error('Ошибка при создании товара')
      }

      const result = await response.json()

      toast({
        description: `Товар "${result.name}" был создан`,
      })

      router.push('/products')
    } catch (error: any) {
      console.error('Error creating product:', error)
      toast({
        variant: 'destructive',
        description: error?.message || 'Не удалось создать товар',
      })
    } finally {
      setLoading(false)
    }
  }
    }
  }
}

interface FundUsage {
  id?: string
  fundId?: string
  categoryId?: string
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
}

interface ProductImage {
  filename: string
  thumbnail: string
  url: string
  thumbnailUrl: string
  size: number
  width: number
  height: number
  originalName: string
  uploadedAt: string
}

type ProductType = 'PRODUCT' | 'SERVICE'

interface FormState {
  name: string
  description: string
  sku: string
  unit: string
  variant: ProductType
  sellingPrice: number
  overheadCost: number
  margin: number
  currency: string
  currentStock: number
  minStock: number
  maxStock: number
  isActive: boolean
}

const initialFormState: FormState = {
  name: '',
  description: '',
  sku: '',
  unit: 'шт',
  variant: 'PRODUCT',
  sellingPrice: 0,
  overheadCost: 0,
  margin: 30,
  currency: 'RUB',
  currentStock: 0,
  minStock: 0,
  maxStock: 0,
  isActive: true,
}

export default function CreateProductPage() {
  const router = useRouter()
  const { toast } = useToast()

  // State
  const [formData, setFormData] = useState<FormState>(initialFormState)
  const [activeTab, setActiveTab] = useState('basic')
  
  // Usage states
  const [materialUsages, setMaterialUsages] = useState<MaterialUsage[]>([])
  const [workTypeUsages, setWorkTypeUsages] = useState<WorkTypeUsage[]>([])
  const [fundUsages, setFundUsages] = useState<FundUsage[]>([])
  const [productImages, setProductImages] = useState<ProductImage[]>([])

  // Dialog states
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false)
  const [workTypeDialogOpen, setWorkTypeDialogOpen] = useState(false)
  const [fundDialogOpen, setFundDialogOpen] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)

  // UI states
  const [loading, setLoading] = useState(false)

  // Dialog handlers
  const handleMaterialAdd = (material: MaterialUsage) => {
    setMaterialUsages(prev => [...prev, material])
    setMaterialDialogOpen(false)
  }

  const handleWorkTypeAdd = (workType: WorkTypeUsage) => {
    setWorkTypeUsages(prev => [...prev, workType])
    setWorkTypeDialogOpen(false)
  }

  const handleFundAdd = (fund: FundUsage) => {
    setFundUsages(prev => [...prev, fund])
    setFundDialogOpen(false)
  }
  
  // Dialog states
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false)
  const [workTypeDialogOpen, setWorkTypeDialogOpen] = useState(false)
  const [fundDialogOpen, setFundDialogOpen] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)

  // Usage states
  const [materialUsages, setMaterialUsages] = useState<MaterialUsage[]>([])
  const [workTypeUsages, setWorkTypeUsages] = useState<WorkTypeUsage[]>([])
  const [fundUsages, setFundUsages] = useState<FundUsage[]>([])
  const [productImages, setProductImages] = useState<ProductImage[]>([])

  // UI states
  const [loading, setLoading] = useState(false)

  // Save handler
  const handleSave = async () => {
  const [formData, setFormData] = useState<FormData>({
    ...initialFormState,
    variant: initialFormState.type as 'PRODUCT' | 'SERVICE'
  })
  const [materialUsages, setMaterialUsages] = useState<MaterialUsage[]>([])
  const [workTypeUsages, setWorkTypeUsages] = useState<WorkTypeUsage[]>([])
  const [fundUsages, setFundUsages] = useState<FundUsage[]>([])
  const [showAddMaterialDialog, setShowAddMaterialDialog] = useState(false)
  const [showAddWorkTypeDialog, setShowAddWorkTypeDialog] = useState(false)
  const [showAddFundDialog, setShowAddFundDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [productImages, setProductImages] = useState<ProductImage[]>([])

  // Обработчик сохранения
  const handleSave = async () => {
    try {
      setLoading(true)

      const productData = {
        ...formData,
        materialUsages: materialUsages.map(m => ({
          materialItemId: m.materialItemId || m.materialItem.id,
          quantity: m.quantity
        })),
        workTypeUsages: workTypeUsages.map(w => ({
          workTypeId: w.workTypeId || w.workType.id,
          quantity: w.quantity,
          sequence: w.sequence || 0
        })),
        fundUsages: fundUsages.map(f => ({
          fundId: f.fundId || f.fund.id,
          categoryId: f.categoryId || f.category.id,
          allocatedAmount: f.allocatedAmount,
          percentage: f.percentage || 0
        })),
        images: productImages.map(img => img.url).join(',')
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        throw new Error('Ошибка при создании товара')
      }

      const result = await response.json()

      toast({
        description: `Товар "${result.name}" был создан`,
      })

      router.push('/products')
    } catch (error: any) {
      console.error('Error creating product:', error)
      toast({
        variant: 'destructive',
        description: error?.message || 'Не удалось создать товар',
      })
    } finally {
      setLoading(false)
    }
  }

  // Обработчики диалогов
  const handleMaterialAdd = (material: MaterialUsage) => {
    setMaterialUsages(prev => [...prev, material])
    setShowAddMaterialDialog(false)
  }

  const handleWorkTypeAdd = (workType: WorkTypeUsage) => {
    setWorkTypeUsages(prev => [...prev, workType])
    setShowAddWorkTypeDialog(false)
  }

  const handleFundAdd = (fund: FundUsage) => {
    setFundUsages(prev => [...prev, fund])
    setShowAddFundDialog(false)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Заголовок и навигация */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-2xl font-bold">Создание нового товара</h1>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
        </div>
      </div>

      {/* Основная форма */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic">Основное</TabsTrigger>
              <TabsTrigger value="materials">Материалы</TabsTrigger>
              <TabsTrigger value="work">Работы</TabsTrigger>
              <TabsTrigger value="funds">Фонды</TabsTrigger>
              <TabsTrigger value="pricing">Цены</TabsTrigger>
              <TabsTrigger value="settings">Настройки</TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-6">
              {/* Основная информация */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Название товара</Label>
                    <Input 
                      placeholder="Введите название товара"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Артикул (SKU)</Label>
                    <Input 
                      placeholder="Введите артикул"
                      value={formData.sku}
                      onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Описание</Label>
                    <Textarea 
                      placeholder="Введите описание товара"
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Тип</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, variant: value as 'PRODUCT' | 'SERVICE' }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRODUCT">Товар</SelectItem>
                        <SelectItem value="SERVICE">Услуга</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Единица измерения</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите единицу" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="шт">Штука</SelectItem>
                        <SelectItem value="м">Метр</SelectItem>
                        <SelectItem value="м2">Метр²</SelectItem>
                        <SelectItem value="м3">Метр³</SelectItem>
                        <SelectItem value="кг">Килограмм</SelectItem>
                        <SelectItem value="л">Литр</SelectItem>
                        <SelectItem value="компл">Комплект</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Валюта</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите валюту" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RUB">Рубль (₽)</SelectItem>
                        <SelectItem value="USD">Доллар ($)</SelectItem>
                        <SelectItem value="EUR">Евро (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <Label>Изображения товара</Label>
                    <ImageUpload 
                      value={productImages}
                      onChange={setProductImages}
                      accept="image/*"
                      multiple
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Материалы */}
              <TabsContent value="materials">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Материалы</Label>
                    <Button onClick={() => setShowAddMaterialDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить материал
                    </Button>
                  </div>
                  
                  {materialUsages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Материалы пока не добавлены
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {materialUsages.map((material, index) => (
                        <Card key={index}>
                          <CardContent className="p-4 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{material.materialItem.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {material.quantity} {material.materialItem.unit} × {material.materialItem.price} {material.materialItem.currency}
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setMaterialUsages(prev => prev.filter((_, i) => i !== index))}
                            >
                              Удалить
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Работы */}
              <TabsContent value="work">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Виды работ</Label>
                    <Button onClick={() => setShowAddWorkTypeDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить работу
                    </Button>
                  </div>

                  {workTypeUsages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Виды работ пока не добавлены
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {workTypeUsages.map((work, index) => (
                        <Card key={index}>
                          <CardContent className="p-4 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{work.workType.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {work.quantity} {work.workType.unit} × {work.workType.hourlyRate} {work.workType.currency}/час
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setWorkTypeUsages(prev => prev.filter((_, i) => i !== index))}
                            >
                              Удалить
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Фонды */}
              <TabsContent value="funds">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Фонды</Label>
                    <Button onClick={() => setShowAddFundDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить фонд
                    </Button>
                  </div>

                  {fundUsages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Фонды пока не добавлены
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {fundUsages.map((fund, index) => (
                        <Card key={index}>
                          <CardContent className="p-4 flex justify-between items-center">
                            <div>
                              <p className="font-medium">
                                {fund.category.emoji} {fund.fund.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {fund.allocatedAmount} ₽ ({fund.percentage || 0}%)
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setFundUsages(prev => prev.filter((_, i) => i !== index))}
                            >
                              Удалить
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Цены */}
              <TabsContent value="pricing">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Себестоимость</Label>
                      <Input 
                        type="number"
                        value={formData.overheadCost}
                        onChange={e => setFormData(prev => ({ ...prev, overheadCost: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Цена продажи</Label>
                      <Input
                        type="number"
                        value={formData.sellingPrice}
                        onChange={e => setFormData(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Маржа (%)</Label>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="number"
                        value={formData.margin}
                        onChange={e => setFormData(prev => ({ ...prev, margin: parseFloat(e.target.value) || 0 }))}
                      />
                      <Progress value={formData.margin} className="w-1/2" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Настройки */}
              <TabsContent value="settings">
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Текущий остаток</Label>
                      <Input
                        type="number"
                        value={formData.currentStock}
                        onChange={e => setFormData(prev => ({ ...prev, currentStock: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Минимальный остаток</Label>
                      <Input
                        type="number"
                        value={formData.minStock}
                        onChange={e => setFormData(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Максимальный остаток</Label>
                      <Input
                        type="number"
                        value={formData.maxStock}
                        onChange={e => setFormData(prev => ({ ...prev, maxStock: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="isActive">Товар активен</Label>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Диалоги */}
      {showAddMaterialDialog && (
        <AddMaterialDialog
          open={showAddMaterialDialog}
          onOpenChange={setShowAddMaterialDialog}
          onAdd={(material) => {
            setMaterialUsages(prev => [...prev, material])
            setShowAddMaterialDialog(false)
          }}
        />
      )}

      {showAddWorkTypeDialog && (
        <AddWorkTypeDialog
          open={showAddWorkTypeDialog}
          onOpenChange={setShowAddWorkTypeDialog}
          onAdd={(workType) => {
            setWorkTypeUsages(prev => [...prev, workType])
            setShowAddWorkTypeDialog(false)
          }}
        />
      )}

      {showAddFundDialog && (
        <AddFundDialog
          open={showAddFundDialog}
          onOpenChange={setShowAddFundDialog}
          onAdd={(fund) => {
            setFundUsages(prev => [...prev, fund])
            setShowAddFundDialog(false)
          }}
        />
      )}
    </div>
  )

  const [materialUsages, setMaterialUsages] = useState(emptyProduct.materialUsages)
  const [workTypeUsages, setWorkTypeUsages] = useState(emptyProduct.workTypeUsages)
  const [fundUsages, setFundUsages] = useState(emptyProduct.fundUsages || [])
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

  // Определяем порядок вкладок для навигации
  const tabOrder = ['basic', 'materials', 'work', 'funds', 'pricing', 'settings']

  // Функция для анимированного переключения вкладок
  const switchTabWithAnimation = (newTab: string) => {
    if (newTab === activeTab || isTransitioning) return
    
    setIsTransitioning(true)
    setPreviousTab(activeTab)
    
    setTimeout(() => {
      setActiveTab(newTab)
      setTimeout(() => {
        setIsTransitioning(false)
        setPreviousTab(null)
        setTransitionDirection(null)
      }, 200)
    }, 100)
  }

  // Навигация между вкладками
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

  // Обработчик сохранения
  const handleSave = async () => {
    try {
      setLoading(true)

      const productData = {
        ...formData,
        materialUsages: materialUsages.map(m => ({
          materialItemId: m.materialItemId || m.materialItem.id,
          quantity: m.quantity
        })),
        workTypeUsages: workTypeUsages.map(w => ({
          workTypeId: w.workTypeId || w.workType.id,
          quantity: w.quantity,
          sequence: w.sequence || 0
        })),
        fundUsages: fundUsages.map(f => ({
          fundId: f.fundId || f.fund.id,
          categoryId: f.categoryId || f.category.id,
          allocatedAmount: f.allocatedAmount,
          percentage: f.percentage || 0
        })),
        images: productImages.map(img => img.url).join(',')
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        throw new Error('Ошибка при создании товара')
      }

      const result = await response.json()

      toast({
        title: 'Успешно',
        description: `Товар "${result.name}" был создан`,
        variant: 'success'
      })

      router.push('/products')
    } catch (error: any) {
      console.error('Error creating product:', error)
      toast({
        title: 'Ошибка',
        description: error?.message || 'Не удалось создать товар',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const [materialUsages, setMaterialUsages] = useState<Array<{
    id?: string;
    materialItemId?: string;
    quantity: number;
    cost: number;
    materialItem: {
      id: string;
      name: string;
      unit: string;
      price: number;
      currency: string;
    };
  }>>([])
  
  const [workTypeUsages, setWorkTypeUsages] = useState<Array<{
    id?: string;
    workTypeId?: string;
    quantity: number;
    cost: number;
    sequence: number;
    workType: {
      id: string;
      name: string;
      description?: string;
      unit: string;
      hourlyRate: number;
      currency: string;
      department?: {
        id: string;
        name: string;
      }
    }
  }>>([])
  
  const [fundUsages, setFundUsages] = useState<Array<{
    id?: string;
    fundId?: string;
    categoryId?: string;
    allocatedAmount: number;
    percentage?: number;
    description?: string;
    fund: {
      id: string;
      name: string;
      description?: string;
      fundType: string;
    };
    category: {
      id: string;
      name: string;
      emoji: string;
      categoryType: string;
    }
  }>>([])
  
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
  
  // Обработчик сохранения нового продукта
  const handleSaveProduct = async () => {
    try {
      setLoading(true)
      
      // Подготовка данных для отправки на сервер
      const productData = {
        ...formData,
        materialUsages: materialUsages.map(m => ({
          materialItemId: m.materialItemId || m.materialItem.id,
          quantity: m.quantity
        })),
        workTypeUsages: workTypeUsages.map(w => ({
          workTypeId: w.workTypeId || w.workType.id,
          quantity: w.quantity,
          sequence: w.sequence || 0
        })),
        fundUsages: fundUsages.map(f => ({
          fundId: f.fundId || f.fund.id,
          categoryId: f.categoryId || f.category.id,
          allocatedAmount: f.allocatedAmount,
          percentage: f.percentage || 0
        })),
        images: productImages.map(img => img.url).join(',')
      }
      
      // Отправка данных на сервер
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка при создании товара')
      }
      
      const result = await response.json()
      
      toast({
        title: 'Товар успешно создан',
        description: `Товар "${result.name}" был успешно создан`,
        variant: 'success'
      })
      
      router.push('/products')
    } catch (error: any) {
      console.error('Error creating product:', error)
      toast({
        title: 'Ошибка',
        description: error?.message || 'Не удалось создать товар',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Заголовок и навигация */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-2xl font-bold">Создание нового товара</h1>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>
            Сохранить товар
          </Button>
        </div>
      </div>

      {/* Основная форма */}
      <Card>
        <CardHeader>
          <CardTitle>Информация о товаре</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="basic">Основное</TabsTrigger>
              <TabsTrigger value="images">Изображения</TabsTrigger>
              <TabsTrigger value="materials">Материалы</TabsTrigger>
              <TabsTrigger value="workTypes">Виды работ</TabsTrigger>
              <TabsTrigger value="pricing">Ценообразование</TabsTrigger>
              <TabsTrigger value="analytics">Аналитика</TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value="basic">
                <ProductBasicInfo
                  data={formData}
                  onChange={handleBasicInfoChange}
                />
              </TabsContent>

              <TabsContent value="images">
                <ProductImageUpload
                  images={formData.images}
                  onChange={handleImagesChange}
                />
              </TabsContent>

              <TabsContent value="materials">
                <ProductMaterialsSelector
                  materials={formData.materials}
                  onChange={handleMaterialsChange}
                />
              </TabsContent>

              <TabsContent value="workTypes">
                <ProductWorkTypesSelector
                  workTypes={formData.workTypes}
                  onChange={handleWorkTypesChange}
                />
              </TabsContent>

              <TabsContent value="pricing">
                <ProductPricing
                  data={formData}
                  onChange={handlePricingChange}
                />
              </TabsContent>

              <TabsContent value="analytics">
                <ProductAnalytics data={formData} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
