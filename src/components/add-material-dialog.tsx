'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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

interface AddMaterialDialogProps {
  onAdd: (material: any) => void
}

export function AddMaterialDialog({ onAdd }: AddMaterialDialogProps) {
  const [open, setOpen] = useState(false)
  const [materials, setMaterials] = useState<Material[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const { toast } = useToast()

  // Загружаем материалы при открытии диалога
  useEffect(() => {
    if (open) {
      loadMaterials()
    }
  }, [open])

  // Фильтрация материалов по поисковому запросу
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMaterials(materials)
    } else {
      const filtered = materials.filter(material => 
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredMaterials(filtered)
    }
  }, [searchTerm, materials])

  const loadMaterials = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/materials')
      if (response.ok) {
        const data = await response.json()
        setMaterials(data)
        setFilteredMaterials(data)
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить материалы.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error loading materials:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить материалы.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddMaterial = () => {
    if (!selectedMaterial) return

    onAdd({
      materialItemId: selectedMaterial.id,
      quantity: quantity,
      materialItem: selectedMaterial,
    })
    
    toast({
      title: 'Успешно',
      description: `${selectedMaterial.name} добавлен в список.`,
    })

    // Сброс состояния
    setSelectedMaterial(null)
    setQuantity(1)
    setSearchTerm('')
    setOpen(false)
  }

  const handleSelectMaterial = (material: Material) => {
    setSelectedMaterial(material)
  }

  const formatCurrency = (amount: number, currency = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Добавить материал
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить материал к товару</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Поиск материалов */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск материалов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Список материалов */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {filteredMaterials.map((material) => (
                <Card 
                  key={material.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedMaterial?.id === material.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedMaterial(material)}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{material.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {material.category?.name} • {material.unit}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            {formatCurrency(material.price)}
                          </Badge>
                          <Badge variant={material.currentStock > 0 ? 'default' : 'destructive'}>
                            {material.currentStock} {material.unit}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Настройка количества */}
          {selectedMaterial && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Выбранный материал</Label>
                  <div className="text-sm font-medium">{selectedMaterial.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(selectedMaterial.price)} за {selectedMaterial.unit}
                  </div>
                </div>
                <div>
                  <Label htmlFor="quantity">Количество ({selectedMaterial.unit})</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span>Общая стоимость:</span>
                <span className="font-bold">
                  {formatCurrency(selectedMaterial.price * quantity)}
                </span>
              </div>

              <div className="mt-4 flex justify-end">
                <Button onClick={handleAddMaterial} disabled={!selectedMaterial || adding}>
                  {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Добавить
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
