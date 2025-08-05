'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Trash2, Edit3, Package, Settings, Calculator } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ProductComponent {
  id: string
  name: string
  description?: string
  componentType: 'MAIN' | 'OPTIONAL' | 'VARIANT'
  baseQuantity: number
  quantityFormula?: string
  width?: number
  height?: number
  depth?: number
  thickness?: number
  sortOrder: number
  parentId?: string
  includeCondition?: string
  isActive: boolean
  parent?: { id: string; name: string }
  children?: { id: string; name: string; componentType: string }[]
  materialUsages?: any[]
  workTypeUsages?: any[]
}

interface ComponentFormData {
  name: string
  description: string
  componentType: 'MAIN' | 'OPTIONAL' | 'VARIANT'
  baseQuantity: number
  quantityFormula: string
  width: string
  height: string
  depth: string
  thickness: string
  sortOrder: number
  parentId: string
  includeCondition: string
}

interface ProductComponentManagerProps {
  productId: string
}

export function ProductComponentManager({ productId }: ProductComponentManagerProps) {
  const [components, setComponents] = useState<ProductComponent[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingComponent, setEditingComponent] = useState<ProductComponent | null>(null)
  const [formData, setFormData] = useState<ComponentFormData>({
    name: '',
    description: '',
    componentType: 'MAIN',
    baseQuantity: 1,
    quantityFormula: '',
    width: '',
    height: '',
    depth: '',
    thickness: '',
    sortOrder: 0,
    parentId: '',
    includeCondition: ''
  })

  // Загрузка компонентов
  const loadComponents = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${productId}/components`)
      if (response.ok) {
        const result = await response.json()
        setComponents(result.data || [])
      } else {
        console.error('Ошибка загрузки компонентов')
      }
    } catch (error) {
      console.error('Ошибка загрузки компонентов:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComponents()
  }, [productId])

  // Сброс формы
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      componentType: 'MAIN',
      baseQuantity: 1,
      quantityFormula: '',
      width: '',
      height: '',
      depth: '',
      thickness: '',
      sortOrder: 0,
      parentId: '',
      includeCondition: ''
    })
    setEditingComponent(null)
  }

  // Открытие диалога добавления
  const handleAddComponent = () => {
    resetForm()
    setShowAddDialog(true)
  }

  // Открытие диалога редактирования
  const handleEditComponent = (component: ProductComponent) => {
    setFormData({
      name: component.name,
      description: component.description || '',
      componentType: component.componentType,
      baseQuantity: component.baseQuantity,
      quantityFormula: component.quantityFormula || '',
      width: component.width?.toString() || '',
      height: component.height?.toString() || '',
      depth: component.depth?.toString() || '',
      thickness: component.thickness?.toString() || '',
      sortOrder: component.sortOrder,
      parentId: component.parentId || '',
      includeCondition: component.includeCondition || ''
    })
    setEditingComponent(component)
    setShowAddDialog(true)
  }

  // Сохранение компонента
  const handleSaveComponent = async () => {
    try {
      const data = {
        ...formData,
        width: formData.width ? parseFloat(formData.width) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        depth: formData.depth ? parseFloat(formData.depth) : undefined,
        thickness: formData.thickness ? parseFloat(formData.thickness) : undefined,
        parentId: formData.parentId || undefined,
        quantityFormula: formData.quantityFormula || undefined,
        includeCondition: formData.includeCondition || undefined
      }

      const url = editingComponent 
        ? `/api/products/${productId}/components/${editingComponent.id}`
        : `/api/products/${productId}/components`
      
      const method = editingComponent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setShowAddDialog(false)
        resetForm()
        await loadComponents()
      } else {
        const error = await response.json()
        console.error('Ошибка сохранения компонента:', error)
      }
    } catch (error) {
      console.error('Ошибка сохранения компонента:', error)
    }
  }

  // Удаление компонента
  const handleDeleteComponent = async (componentId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот компонент?')) return

    try {
      const response = await fetch(`/api/products/${productId}/components/${componentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadComponents()
      } else {
        const error = await response.json()
        console.error('Ошибка удаления компонента:', error)
      }
    } catch (error) {
      console.error('Ошибка удаления компонента:', error)
    }
  }

  // Получение цвета бейджа по типу компонента
  const getComponentTypeBadge = (type: string) => {
    switch (type) {
      case 'MAIN':
        return <Badge variant="default">Основной</Badge>
      case 'OPTIONAL':
        return <Badge variant="secondary">Опциональный</Badge>
      case 'VARIANT':
        return <Badge variant="outline">Вариант</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  // Группировка компонентов по уровням
  const getRootComponents = () => components.filter(c => !c.parentId)
  const getChildComponents = (parentId: string) => 
    components.filter(c => c.parentId === parentId)

  if (loading) {
    return <div className="p-4">Загрузка компонентов...</div>
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Компоненты изделия</h3>
          <Badge variant="outline">{components.length}</Badge>
        </div>
        <Button onClick={handleAddComponent}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить компонент
        </Button>
      </div>

      {/* Список компонентов */}
      <div className="space-y-4">
        {getRootComponents().map(component => (
          <ComponentCard
            key={component.id}
            component={component}
            childComponents={getChildComponents(component.id)}
            onEdit={handleEditComponent}
            onDelete={handleDeleteComponent}
          />
        ))}
        
        {components.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Package className="h-8 w-8 mb-2" />
              <p>Компоненты не созданы</p>
              <p className="text-sm">Добавьте первый компонент для начала</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Диалог добавления/редактирования */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingComponent ? 'Редактировать компонент' : 'Добавить компонент'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Основная информация */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Название *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Например: Корпус, Дверь левая"
                />
              </div>
              <div>
                <Label htmlFor="componentType">Тип компонента</Label>
                <Select 
                  value={formData.componentType} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, componentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAIN">Основной</SelectItem>
                    <SelectItem value="OPTIONAL">Опциональный</SelectItem>
                    <SelectItem value="VARIANT">Вариант</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Описание компонента"
                rows={2}
              />
            </div>

            {/* Количество и формулы */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="baseQuantity">Базовое количество</Label>
                <Input
                  id="baseQuantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.baseQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, baseQuantity: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="sortOrder">Порядок сортировки</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="quantityFormula">Формула количества</Label>
              <Input
                id="quantityFormula"
                value={formData.quantityFormula}
                onChange={(e) => setFormData(prev => ({ ...prev, quantityFormula: e.target.value }))}
                placeholder="Например: (height - 20) / 350"
              />
            </div>

            {/* Размеры */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="width">Ширина (мм)</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.width}
                  onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="height">Высота (мм)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="depth">Глубина (мм)</Label>
                <Input
                  id="depth"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.depth}
                  onChange={(e) => setFormData(prev => ({ ...prev, depth: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="thickness">Толщина (мм)</Label>
                <Input
                  id="thickness"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.thickness}
                  onChange={(e) => setFormData(prev => ({ ...prev, thickness: e.target.value }))}
                />
              </div>
            </div>

            {/* Родительский компонент */}
            <div>
              <Label htmlFor="parentId">Родительский компонент</Label>
              <Select 
                value={formData.parentId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value === 'none' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите родительский компонент" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Нет (корневой компонент)</SelectItem>
                  {components
                    .filter(c => c.id !== editingComponent?.id)
                    .map(component => (
                      <SelectItem key={component.id} value={component.id}>
                        {component.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Условие включения */}
            <div>
              <Label htmlFor="includeCondition">Условие включения</Label>
              <Input
                id="includeCondition"
                value={formData.includeCondition}
                onChange={(e) => setFormData(prev => ({ ...prev, includeCondition: e.target.value }))}
                placeholder="Например: hasHandrail === true"
              />
            </div>

            {/* Кнопки */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Отмена
              </Button>
              <Button onClick={handleSaveComponent}>
                {editingComponent ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Карточка компонента
function ComponentCard({ 
  component, 
  childComponents, 
  onEdit, 
  onDelete 
}: {
  component: ProductComponent
  childComponents: ProductComponent[]
  onEdit: (component: ProductComponent) => void
  onDelete: (componentId: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold">{component.name}</h4>
            {getComponentTypeBadge(component.componentType)}
            {component.parent && (
              <Badge variant="outline">↳ {component.parent.name}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(component)}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onDelete(component.id)}
              disabled={childComponents.length > 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {component.description && (
            <p className="text-sm text-muted-foreground">{component.description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Количество:</span> {component.baseQuantity}
              {component.quantityFormula && (
                <div className="text-xs text-muted-foreground mt-1">
                  Формула: {component.quantityFormula}
                </div>
              )}
            </div>
            
            {(component.width || component.height || component.depth) && (
              <div>
                <span className="font-medium">Размеры:</span>
                <div className="text-xs text-muted-foreground">
                  {[component.width, component.height, component.depth]
                    .filter(Boolean)
                    .join(' × ')} мм
                </div>
              </div>
            )}
          </div>

          {component.includeCondition && (
            <div className="text-xs">
              <span className="font-medium">Условие:</span>
              <code className="ml-1 px-1 py-0.5 bg-muted rounded">
                {component.includeCondition}
              </code>
            </div>
          )}

          {/* Статистика */}
          <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
            <span>Материалов: {component.materialUsages?.length || 0}</span>
            <span>Работ: {component.workTypeUsages?.length || 0}</span>
            {childComponents.length > 0 && (
              <span>Подкомпонентов: {childComponents.length}</span>
            )}
          </div>

          {/* Дочерние компоненты */}
          {childComponents.length > 0 && (
            <div className="mt-3 pl-4 border-l-2 border-muted">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Подкомпоненты:
              </div>
              {childComponents.map(child => (
                <div key={child.id} className="flex items-center gap-2 text-sm">
                  <span>{child.name}</span>
                  {getComponentTypeBadge(child.componentType)}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  function getComponentTypeBadge(type: string) {
    switch (type) {
      case 'MAIN':
        return <Badge variant="default" className="text-xs">Основной</Badge>
      case 'OPTIONAL':
        return <Badge variant="secondary" className="text-xs">Опциональный</Badge>
      case 'VARIANT':
        return <Badge variant="outline" className="text-xs">Вариант</Badge>
      default:
        return <Badge className="text-xs">{type}</Badge>
    }
  }
}
