'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  TreePine,
  Wrench,
  Paintbrush,
  Settings,
  Plus,
  X,
  Eye,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Package,
  Hammer,
  Cog,
  Calculator,
  GripVertical
} from 'lucide-react'
import { ProductBlock, SelectedBlock, BlockType, BLOCK_CATEGORIES } from '@/lib/types/product-constructor'

// Иконки для типов блоков
const TYPE_ICONS = {
  MATERIALS: Package,
  WORK_TYPES: Hammer,
  OPTIONS: Cog,
  FORMULAS: Calculator
}

// Цвета для типов блоков
const TYPE_COLORS = {
  MATERIALS: 'bg-blue-50 border-blue-200 text-blue-800',
  WORK_TYPES: 'bg-green-50 border-green-200 text-green-800',
  OPTIONS: 'bg-purple-50 border-purple-200 text-purple-800',
  FORMULAS: 'bg-orange-50 border-orange-200 text-orange-800'
}

interface ProductConstructorProps {
  onComplete?: (templateId: string) => void
  onCancel?: () => void
}

export function ProductConstructor({ onComplete, onCancel }: ProductConstructorProps) {
  const [availableBlocks, setAvailableBlocks] = useState<ProductBlock[]>([])
  const [selectedBlocks, setSelectedBlocks] = useState<SelectedBlock[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [metadata, setMetadata] = useState({
    name: '',
    description: '',
    category: 'custom'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Загрузка блоков при монтировании
  useEffect(() => {
    loadAvailableBlocks()
  }, [])

  // Загрузка доступных блоков
  const loadAvailableBlocks = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/constructor/blocks?active=true')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setAvailableBlocks(result.data)
      } else {
        console.error('API Error:', result.error)
        toast({
          variant: 'error',
          title: 'Ошибка API',
          description: result.error || 'Неизвестная ошибка API'
        })
      }
    } catch (error) {
      console.error('Ошибка загрузки блоков:', error)
      toast({
        variant: 'error',
        title: 'Ошибка',
        description: 'Не удалось загрузить блоки конструктора'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Фильтрация блоков
  const filteredBlocks = availableBlocks.filter(block => {
    const matchesCategory = activeCategory === 'all' || block.category === activeCategory
    const matchesSearch = block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         block.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const notAlreadySelected = !selectedBlocks.find(sb => sb.blockId === block.id)
    
    return matchesCategory && matchesSearch && notAlreadySelected
  })

  // Добавление блока
  const addBlock = (block: ProductBlock) => {
    const newSelectedBlock: SelectedBlock = {
      blockId: block.id,
      block,
      position: selectedBlocks.length,
      isEnabled: true
    }
    
    setSelectedBlocks(prev => [...prev, newSelectedBlock])
    
    toast({
      variant: 'success',
      title: 'Блок добавлен',
      description: `Блок "${block.name}" добавлен в конструктор`
    })
  }

  // Удаление блока
  const removeBlock = (blockId: string) => {
    setSelectedBlocks(prev => prev.filter(sb => sb.blockId !== blockId))
    
    toast({
      variant: 'info',
      title: 'Блок удален',
      description: 'Блок удален из конструктора'
    })
  }

  // Перетаскивание блоков
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setSelectedBlocks((items) => {
        const oldIndex = items.findIndex(item => item.blockId === active.id)
        const newIndex = items.findIndex(item => item.blockId === over?.id)

        const newItems = arrayMove(items, oldIndex, newIndex)
        return newItems.map((item, index) => ({ ...item, position: index }))
      })
    }
  }

  // Генерация превью
  const generatePreview = () => {
    if (selectedBlocks.length === 0) {
      setPreview(null)
      return
    }

    let totalParameters = 0
    let totalFormulas = 0
    let totalBomItems = 0
    const issues: string[] = []

    selectedBlocks.forEach(sb => {
      switch (sb.block.type) {
        case 'OPTIONS':
          const optionsConfig = sb.block.config as any
          totalParameters += optionsConfig.parameters?.length || 0
          break
        case 'MATERIALS':
          const materialsConfig = sb.block.config as any
          totalBomItems += materialsConfig.materials?.length || 0
          totalFormulas += materialsConfig.materials?.length || 0
          break
        case 'WORK_TYPES':
          const workConfig = sb.block.config as any
          totalBomItems += workConfig.workTypes?.length || 0
          totalFormulas += workConfig.workTypes?.length || 0
          break
        case 'FORMULAS':
          const formulasConfig = sb.block.config as any
          totalFormulas += formulasConfig.formulas?.length || 0
          break
      }
    })

    // Базовые параметры всегда добавляются
    totalParameters += 4 // length, width, height, quantity

    // Проверки
    if (totalParameters === 0) {
      issues.push('Нет параметров для настройки')
    }
    if (totalBomItems === 0) {
      issues.push('Нет материалов или работ для расчета')
    }

    setPreview({
      totalParameters,
      totalFormulas,
      totalBomItems,
      issues,
      complexity: totalParameters + totalFormulas > 20 ? 'HIGH' : 
                  totalParameters + totalFormulas > 10 ? 'MEDIUM' : 'LOW'
    })
  }

  // Генерация шаблона
  const generateTemplate = async () => {
    if (selectedBlocks.length === 0) {
      toast({
        variant: 'error',
        title: 'Ошибка',
        description: 'Необходимо выбрать хотя бы один блок'
      })
      return
    }

    if (!metadata.name.trim()) {
      toast({
        variant: 'error',
        title: 'Ошибка',
        description: 'Необходимо указать название товара'
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/constructor/generate-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: selectedBlocks.map(sb => ({
            blockId: sb.blockId,
            position: sb.position,
            customConfig: sb.customConfig,
            isEnabled: sb.isEnabled
          })),
          metadata
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Создаем продукт из шаблона
        const productResponse = await fetch('/api/products/from-template', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            templateId: result.data.templateId,
            productData: {
              name: metadata.name,
              description: metadata.description,
              variant: 'PRODUCT'
            }
          })
        })

        const productResult = await productResponse.json()
        
        if (productResult.success) {
          toast({
            variant: 'success',
            title: 'Продукт создан!',
            description: `Продукт "${metadata.name}" успешно создан из блоков`
          })
          
          if (onComplete) {
            onComplete(productResult.data.productId) // Передаем ID продукта, а не шаблона
          }
        } else {
          // Если продукт не создался, но шаблон создался
          toast({
            variant: 'warning',
            title: 'Шаблон создан',
            description: `Шаблон создан, но продукт не создался: ${productResult.error}`
          })
          
          if (onComplete) {
            onComplete(result.data.templateId)
          }
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Ошибка генерации шаблона:', error)
      toast({
        variant: 'error',
        title: 'Ошибка',
        description: (error as Error)?.message || 'Не удалось создать шаблон'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    generatePreview()
  }, [selectedBlocks])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Конструктор товара</h1>
          <p className="text-gray-600 mt-2">
            Создайте товар из готовых блоков материалов, работ и параметров
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Библиотека блоков */}
          <div className="lg:col-span-1">
            <Card className="h-[calc(100vh-200px)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Библиотека блоков
                </CardTitle>
                <div className="space-y-3">
                  <Input
                    placeholder="Поиск блоков..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                    <TabsList className="grid grid-cols-2 lg:grid-cols-1 lg:h-auto lg:flex-col">
                      <TabsTrigger value="all">Все</TabsTrigger>
                      <TabsTrigger value="wood">🌲 Дерево</TabsTrigger>
                      <TabsTrigger value="metal">🔧 Металл</TabsTrigger>
                      <TabsTrigger value="universal">⚙️ Универсальные</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="p-4 space-y-3">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      filteredBlocks.map(block => {
                        const TypeIcon = TYPE_ICONS[block.type as BlockType]
                        return (
                          <Card 
                            key={block.id} 
                            className={`cursor-pointer hover:shadow-md transition-shadow ${TYPE_COLORS[block.type as BlockType]}`}
                            onClick={() => addBlock(block)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <TypeIcon className="h-4 w-4" />
                                    <span className="font-medium text-sm">{block.name}</span>
                                  </div>
                                  {block.description && (
                                    <p className="text-xs opacity-75 line-clamp-2">
                                      {block.description}
                                    </p>
                                  )}
                                  <Badge variant="outline" className="mt-2 text-xs">
                                    {block.type.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Рабочая область */}
          <div className="lg:col-span-1">
            <Card className="h-[calc(100vh-200px)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5" />
                  Конструктор
                  <Badge variant="secondary">{selectedBlocks.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  {selectedBlocks.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Добавьте блоки из библиотеки</p>
                      </div>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext 
                        items={selectedBlocks.map(sb => sb.blockId)} 
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="p-4 space-y-3">
                          {selectedBlocks.map((selectedBlock, index) => (
                            <SortableBlockItem
                              key={selectedBlock.blockId}
                              selectedBlock={selectedBlock}
                              index={index}
                              onRemove={() => removeBlock(selectedBlock.blockId)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Настройки и превью */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Настройки товара */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Настройки товара
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="product-name">Название товара *</Label>
                    <Input
                      id="product-name"
                      placeholder="Например: Лестница деревянная"
                      value={metadata.name}
                      onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-description">Описание</Label>
                    <Textarea
                      id="product-description"
                      placeholder="Краткое описание товара..."
                      value={metadata.description}
                      onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Превью результата */}
              {preview && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Превью калькулятора
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-600">{preview.totalParameters}</div>
                        <div className="text-xs text-blue-600">Параметров</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-600">{preview.totalFormulas}</div>
                        <div className="text-xs text-green-600">Формул</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-purple-600">{preview.totalBomItems}</div>
                        <div className="text-xs text-purple-600">Ресурсов</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Сложность:</span>
                      <Badge 
                        variant={preview.complexity === 'HIGH' ? 'destructive' : 
                                preview.complexity === 'MEDIUM' ? 'default' : 'secondary'}
                      >
                        {preview.complexity === 'HIGH' ? 'Высокая' :
                         preview.complexity === 'MEDIUM' ? 'Средняя' : 'Низкая'}
                      </Badge>
                    </div>
                    
                    {preview.issues.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">Предупреждения:</span>
                        </div>
                        {preview.issues.map((issue: string, index: number) => (
                          <div key={index} className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                            {issue}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Действия */}
              <div className="space-y-3">
                <Button 
                  onClick={generateTemplate}
                  disabled={selectedBlocks.length === 0 || !metadata.name.trim() || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Создание шаблона...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Создать товар
                    </>
                  )}
                </Button>
                
                {onCancel && (
                  <Button variant="outline" onClick={onCancel} className="w-full">
                    Отмена
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Компонент перетаскиваемого блока
function SortableBlockItem({ 
  selectedBlock, 
  index, 
  onRemove 
}: { 
  selectedBlock: SelectedBlock
  index: number
  onRemove: () => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: selectedBlock.blockId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const TypeIcon = TYPE_ICONS[selectedBlock.block.type as BlockType]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${TYPE_COLORS[selectedBlock.block.type as BlockType]} border rounded-lg p-3`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <TypeIcon className="h-4 w-4" />
          <span className="font-medium text-sm">{selectedBlock.block.name}</span>
          <Badge variant="outline" className="text-xs">
            #{index + 1}
          </Badge>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onRemove}
          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      {selectedBlock.block.description && (
        <p className="text-xs mt-2 opacity-75 line-clamp-2">
          {selectedBlock.block.description}
        </p>
      )}
    </div>
  )
}
