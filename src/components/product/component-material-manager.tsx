'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Trash2, Edit3, Package2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface Material {
  id: string
  name: string
  unit: string
  price: number
  wasteFactor: number
}

interface ComponentMaterialUsage {
  id: string
  materialId: string
  quantityFormula: string
  quantityPerUnit: number
  wasteFactor: number
  notes?: string
  material: Material
}

interface ComponentMaterialFormData {
  materialId: string
  quantityFormula: string
  quantityPerUnit: number
  wasteFactor: number
  notes: string
}

interface ComponentMaterialManagerProps {
  productId: string
  componentId: string
  componentName: string
}

export function ComponentMaterialManager({ 
  productId, 
  componentId, 
  componentName 
}: ComponentMaterialManagerProps) {
  const [materialUsages, setMaterialUsages] = useState<ComponentMaterialUsage[]>([])
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingUsage, setEditingUsage] = useState<ComponentMaterialUsage | null>(null)
  const [formData, setFormData] = useState<ComponentMaterialFormData>({
    materialId: '',
    quantityFormula: '',
    quantityPerUnit: 0,
    wasteFactor: 0,
    notes: ''
  })

  // Загрузка материалов компонента
  const loadComponentMaterials = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${productId}/components/${componentId}/materials`)
      if (response.ok) {
        const result = await response.json()
        setMaterialUsages(result.data || [])
      } else {
        console.error('Ошибка загрузки материалов компонента')
      }
    } catch (error) {
      console.error('Ошибка загрузки материалов компонента:', error)
    } finally {
      setLoading(false)
    }
  }

  // Загрузка доступных материалов
  const loadAvailableMaterials = async () => {
    try {
      const response = await fetch('/api/materials')
      if (response.ok) {
        const result = await response.json()
        setAvailableMaterials(result.data || [])
      } else {
        console.error('Ошибка загрузки материалов')
      }
    } catch (error) {
      console.error('Ошибка загрузки материалов:', error)
    }
  }

  useEffect(() => {
    loadComponentMaterials()
    loadAvailableMaterials()
  }, [productId, componentId])

  // Сброс формы
  const resetForm = () => {
    setFormData({
      materialId: '',
      quantityFormula: '',
      quantityPerUnit: 0,
      wasteFactor: 0,
      notes: ''
    })
    setEditingUsage(null)
  }

  // Открытие диалога добавления
  const handleAddMaterial = () => {
    resetForm()
    setShowAddDialog(true)
  }

  // Открытие диалога редактирования
  const handleEditMaterial = (usage: ComponentMaterialUsage) => {
    setFormData({
      materialId: usage.materialId,
      quantityFormula: usage.quantityFormula,
      quantityPerUnit: usage.quantityPerUnit,
      wasteFactor: usage.wasteFactor,
      notes: usage.notes || ''
    })
    setEditingUsage(usage)
    setShowAddDialog(true)
  }

  // Сохранение материала
  const handleSaveMaterial = async () => {
    try {
      const data = {
        ...formData,
        quantityFormula: formData.quantityFormula || undefined,
        notes: formData.notes || undefined
      }

      const url = editingUsage 
        ? `/api/products/${productId}/components/${componentId}/materials/${editingUsage.id}`
        : `/api/products/${productId}/components/${componentId}/materials`
      
      const method = editingUsage ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setShowAddDialog(false)
        resetForm()
        await loadComponentMaterials()
      } else {
        const error = await response.json()
        console.error('Ошибка сохранения материала:', error)
        alert(error.message || 'Ошибка сохранения материала')
      }
    } catch (error) {
      console.error('Ошибка сохранения материала:', error)
      alert('Ошибка сохранения материала')
    }
  }

  // Удаление материала
  const handleDeleteMaterial = async (usageId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот материал?')) return

    try {
      const response = await fetch(
        `/api/products/${productId}/components/${componentId}/materials/${usageId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        await loadComponentMaterials()
      } else {
        const error = await response.json()
        console.error('Ошибка удаления материала:', error)
        alert(error.message || 'Ошибка удаления материала')
      }
    } catch (error) {
      console.error('Ошибка удаления материала:', error)
      alert('Ошибка удаления материала')
    }
  }

  // Получение доступных материалов для выбора
  const getAvailableMaterialsForSelect = () => {
    const usedMaterialIds = materialUsages.map(usage => usage.materialId)
    return availableMaterials.filter(material => 
      !usedMaterialIds.includes(material.id) || 
      (editingUsage && material.id === editingUsage.materialId)
    )
  }

  if (loading) {
    return <div className="p-4">Загрузка материалов...</div>
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package2 className="h-5 w-5" />
          <h4 className="text-md font-semibold">Материалы: {componentName}</h4>
          <Badge variant="outline">{materialUsages.length}</Badge>
        </div>
        <Button size="sm" onClick={handleAddMaterial}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить материал
        </Button>
      </div>

      {/* Список материалов */}
      <div className="space-y-3">
        {materialUsages.map(usage => (
          <Card key={usage.id}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-medium">{usage.material.name}</h5>
                    <Badge variant="secondary">{usage.material.unit}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Количество на единицу:</span> {usage.quantityPerUnit}
                    </div>
                    <div>
                      <span className="font-medium">Коэффициент отходов:</span> {usage.wasteFactor}%
                    </div>
                    {usage.quantityFormula && (
                      <div className="col-span-2">
                        <span className="font-medium">Формула:</span>
                        <code className="ml-1 px-1 py-0.5 bg-muted rounded text-xs">
                          {usage.quantityFormula}
                        </code>
                      </div>
                    )}
                    {usage.notes && (
                      <div className="col-span-2">
                        <span className="font-medium">Примечания:</span> {usage.notes}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditMaterial(usage)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDeleteMaterial(usage.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {materialUsages.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-6 text-muted-foreground">
              <Package2 className="h-6 w-6 mb-2" />
              <p>Материалы не добавлены</p>
              <p className="text-sm">Добавьте материалы для этого компонента</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Диалог добавления/редактирования */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingUsage ? 'Редактировать материал' : 'Добавить материал'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Выбор материала */}
            <div>
              <Label htmlFor="materialId">Материал *</Label>
              <Select 
                value={formData.materialId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, materialId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите материал" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableMaterialsForSelect().map(material => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name} ({material.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Количество и коэффициент отходов */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantityPerUnit">Количество на единицу *</Label>
                <Input
                  id="quantityPerUnit"
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.quantityPerUnit}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    quantityPerUnit: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="wasteFactor">Отходы (%)</Label>
                <Input
                  id="wasteFactor"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.wasteFactor}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    wasteFactor: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
            </div>

            {/* Формула */}
            <div>
              <Label htmlFor="quantityFormula">Формула количества</Label>
              <Input
                id="quantityFormula"
                value={formData.quantityFormula}
                onChange={(e) => setFormData(prev => ({ ...prev, quantityFormula: e.target.value }))}
                placeholder="Например: (width * height) / 1000000"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Доступные переменные: width, height, depth, thickness, baseQuantity
              </p>
            </div>

            {/* Примечания */}
            <div>
              <Label htmlFor="notes">Примечания</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Дополнительная информация"
              />
            </div>

            {/* Кнопки */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Отмена
              </Button>
              <Button onClick={handleSaveMaterial}>
                {editingUsage ? 'Сохранить' : 'Добавить'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
