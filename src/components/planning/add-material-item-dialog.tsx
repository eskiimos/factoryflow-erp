'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Package, Plus, Minus } from "lucide-react"

interface Material {
  id: string
  name: string
  unit: string
  price: number
  currency: string
  category?: {
    name: string
  }
}

interface SelectedMaterial extends Material {
  plannedQuantity: number
  plannedAmount: number
}

interface AddMaterialItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: {
    name: string
    materials: {
      materialId: string
      plannedQuantity: number
      plannedAmount: number
    }[]
    totalAmount: number
    description?: string
  }) => Promise<void>
}

export function AddMaterialItemDialog({ isOpen, onClose, onAdd }: AddMaterialItemDialogProps) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterial[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Загружаем материалы
  useEffect(() => {
    if (isOpen) {
      fetchMaterials()
    }
  }, [isOpen])

  const fetchMaterials = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/materials')
      if (response.ok) {
        const result = await response.json()
        // API может возвращать { success: true, data: materials } или просто массив
        const data = result.success ? result.data : result
        const materials = Array.isArray(data) ? data.filter((m: Material) => m.price > 0) : []
        setMaterials(materials)
      } else {
        setMaterials([])
      }
    } catch (error) {
      console.error('Error fetching materials:', error)
      setMaterials([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMaterials = (materials || []).filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addMaterial = (material: Material) => {
    if (selectedMaterials.find(sm => sm.id === material.id)) {
      return // Уже добавлен
    }
    
    const newSelected: SelectedMaterial = {
      ...material,
      plannedQuantity: 1,
      plannedAmount: material.price
    }
    
    setSelectedMaterials(prev => [...prev, newSelected])
  }

  const removeMaterial = (materialId: string) => {
    setSelectedMaterials(prev => prev.filter(sm => sm.id !== materialId))
  }

  const updateMaterialQuantity = (materialId: string, quantity: number) => {
    if (quantity <= 0) return
    
    setSelectedMaterials(prev => prev.map(sm => 
      sm.id === materialId 
        ? { ...sm, plannedQuantity: quantity, plannedAmount: sm.price * quantity }
        : sm
    ))
  }

  const getTotalAmount = () => {
    return selectedMaterials.reduce((sum, sm) => sum + sm.plannedAmount, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedMaterials.length === 0) {
      alert('Выберите хотя бы один материал')
      return
    }

    setIsSubmitting(true)
    try {
      await onAdd({
        name: formData.name || `Материалы (${selectedMaterials.length} поз.)`,
        materials: selectedMaterials.map(sm => ({
          materialId: sm.id,
          plannedQuantity: sm.plannedQuantity,
          plannedAmount: sm.plannedAmount
        })),
        totalAmount: getTotalAmount(),
        description: formData.description
      })
      
      // Сброс формы
      setFormData({ name: '', description: '' })
      setSelectedMaterials([])
      setSearchTerm('')
      onClose()
    } catch (error) {
      console.error('Error adding material item:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📦 Добавить материалы
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Левая колонка - поиск и выбор материалов */}
            <div className="xl:col-span-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search">Поиск материалов</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Название или категория..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <ScrollArea className="h-80 border rounded-lg">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="text-gray-500">Загрузка материалов...</div>
                    </div>
                  ) : (
                    <div className="p-3 space-y-2">
                      {filteredMaterials.map((material) => {
                        const isSelected = selectedMaterials.find(sm => sm.id === material.id)
                        
                        return (
                          <div
                            key={material.id}
                            className={`flex items-center justify-between p-3 rounded border ${
                              isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="font-medium">{material.name}</div>
                                {material.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {material.category.name}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {material.price.toLocaleString('ru-RU')} {material.currency}/{material.unit}
                              </div>
                            </div>
                            
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => isSelected ? removeMaterial(material.id) : addMaterial(material)}
                              variant={isSelected ? "destructive" : "outline"}
                            >
                              {isSelected ? (
                                <>
                                  <Minus className="w-4 h-4 mr-1" />
                                  Убрать
                                </>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4 mr-1" />
                                  Добавить
                                </>
                              )}
                            </Button>
                          </div>
                        )
                      })}
                      
                      {filteredMaterials.length === 0 && !isLoading && (
                        <div className="text-center text-gray-500 py-8">
                          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Материалы не найдены</p>
                          {searchTerm && (
                            <Button
                              type="button"
                              variant="link"
                              onClick={() => setSearchTerm('')}
                              className="text-sm"
                            >
                              Сбросить поиск
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

            {/* Правая колонка - выбранные материалы и настройки */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Название статьи</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Автоматически из материалов"
                />
              </div>

              <div>
                <Label htmlFor="description">Описание</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Дополнительная информация"
                />
              </div>

              <div>
                <Label>Выбранные материалы</Label>
                {selectedMaterials.length === 0 ? (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center text-gray-500 py-4">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Материалы не выбраны</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <ScrollArea className="h-60">
                    <div className="space-y-2">
                      {selectedMaterials.map((material) => (
                        <Card key={material.id}>
                          <CardContent className="pt-3 pb-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">{material.name}</div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMaterial(material.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={material.plannedQuantity}
                                  onChange={(e) => updateMaterialQuantity(
                                    material.id, 
                                    parseFloat(e.target.value) || 1
                                  )}
                                  className="h-8 text-xs"
                                />
                                <span className="text-xs text-gray-500">{material.unit}</span>
                              </div>
                              
                              <div className="text-xs text-gray-600">
                                {material.price.toLocaleString('ru-RU')} × {material.plannedQuantity} = {' '}
                                <span className="font-medium text-black">
                                  {material.plannedAmount.toLocaleString('ru-RU')} ₽
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {selectedMaterials.length > 0 && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Общая стоимость</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {getTotalAmount().toLocaleString('ru-RU')} ₽
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedMaterials.length} позиций
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || selectedMaterials.length === 0}
            >
              {isSubmitting ? 'Добавление...' : 'Добавить материалы'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
