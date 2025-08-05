'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Package2, ShoppingCart, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

interface Material {
  id: string
  name: string
  unit: string
  price: number
  currency: string
  currentStock: number
  category?: {
    id: string
    name: string
  }
}

interface MaterialSelectorProps {
  productId: string
  baseCalculationUnit?: string
  onMaterialSelected: (materialId: string, quantity: number) => void
}

export function MaterialSelector({ productId, baseCalculationUnit, onMaterialSelected }: MaterialSelectorProps) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { toast } = useToast()

  // Загружаем материалы
  useEffect(() => {
    loadMaterials()
  }, [])

  // Фильтрация материалов
  useEffect(() => {
    let filtered = materials

    // Фильтр по поиску
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Фильтр по категории
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(material => 
        material.category?.name === selectedCategory
      )
    }

    setFilteredMaterials(filtered)
  }, [materials, searchTerm, selectedCategory])

  const loadMaterials = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/materials')
      if (response.ok) {
        const data = await response.json()
        setMaterials(data)
        setFilteredMaterials(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки материалов:', error)
      toast({
        variant: 'error',
        title: 'Ошибка загрузки материалов',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMaterial = (material: Material) => {
    setSelectedMaterial(material)
    setQuantity(1)
  }

  const handleAddMaterial = () => {
    if (selectedMaterial && quantity > 0) {
      onMaterialSelected(selectedMaterial.id, quantity)
      setSelectedMaterial(null)
      setQuantity(1)
      toast({
        variant: 'success',
        title: 'Материал добавлен',
        description: `${selectedMaterial.name} добавлен к товару`
      })
    }
  }

  const formatCurrency = (amount: number, currency: string = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const categories = Array.from(new Set(materials.map(m => m.category?.name).filter(Boolean)))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package2 className="h-5 w-5" />
          Выбор материалов
        </CardTitle>
        <div className="space-y-3">
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск материалов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Фильтр по категориям */}
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category || ''}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Кнопка создания материала */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать материал
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Создание нового материала</DialogTitle>
                </DialogHeader>
                <div className="text-center py-6">
                  <Package2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Функция создания материалов будет доступна в следующем обновлении
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {baseCalculationUnit && (
            <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
              💡 Расчет ведется на базовую единицу: <strong>{baseCalculationUnit}</strong>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[500px] px-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredMaterials.length > 0 ? (
            <div className="space-y-2">
              {filteredMaterials.map((material) => (
                <Card 
                  key={material.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedMaterial?.id === material.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleSelectMaterial(material)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{material.name}</h4>
                        {material.category && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {material.category.name}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">
                          {formatCurrency(material.price)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          за {material.unit}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Остаток: {material.currentStock} {material.unit}</span>
                      {selectedMaterial?.id === material.id && (
                        <Badge variant="secondary">Выбран</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Материалы не найдены</p>
              <p className="text-sm">Попробуйте изменить критерии поиска</p>
            </div>
          )}
        </ScrollArea>

        {/* Панель добавления выбранного материала */}
        {selectedMaterial && (
          <div className="border-t p-4 bg-blue-50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{selectedMaterial.name}</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(selectedMaterial.price)}/{selectedMaterial.unit}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="quantity" className="text-xs">Количество</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    placeholder="1"
                    min="0"
                    step="0.01"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Итого</Label>
                  <div className="h-8 flex items-center text-sm font-medium text-green-600">
                    {formatCurrency(selectedMaterial.price * quantity)}
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleAddMaterial}
                disabled={quantity <= 0}
                className="w-full h-8 text-sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Добавить материал
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
