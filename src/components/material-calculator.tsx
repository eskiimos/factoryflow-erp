'use client'

import { useState, useEffect } from 'react'
import { Trash2, Calculator, Edit3, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'

interface MaterialUsage {
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
}

interface MaterialCalculatorProps {
  productId: string
  materialUsages: MaterialUsage[]
  baseCalculationUnit?: string
  onMaterialRemoved: (usageId: string) => void
  onMaterialUpdated: () => void
}

export function MaterialCalculator({ 
  productId, 
  materialUsages, 
  baseCalculationUnit, 
  onMaterialRemoved, 
  onMaterialUpdated 
}: MaterialCalculatorProps) {
  const [editingUsage, setEditingUsage] = useState<string | null>(null)
  const [editQuantity, setEditQuantity] = useState<number>(0)
  const [updating, setUpdating] = useState<string | null>(null)
  const { toast } = useToast()

  const formatCurrency = (amount: number, currency: string = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const totalMaterialCost = materialUsages.reduce((sum, usage) => sum + usage.cost, 0)

  const handleEditStart = (usage: MaterialUsage) => {
    setEditingUsage(usage.id)
    setEditQuantity(usage.quantity)
  }

  const handleEditCancel = () => {
    setEditingUsage(null)
    setEditQuantity(0)
  }

  const handleEditSave = async (usageId: string) => {
    try {
      setUpdating(usageId)
      
      const response = await fetch(`/api/products/${productId}/materials/${usageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: editQuantity
        }),
      })

      if (response.ok) {
        toast({
          variant: 'success',
          title: 'Количество обновлено',
        })
        onMaterialUpdated()
        setEditingUsage(null)
      } else {
        toast({
          variant: 'error',
          title: 'Ошибка обновления количества',
        })
      }
    } catch (error) {
      console.error('Error updating material quantity:', error)
      toast({
        variant: 'error',
        title: 'Ошибка обновления количества',
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleRemove = async (usageId: string) => {
    if (confirm('Удалить материал из товара?')) {
      onMaterialRemoved(usageId)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Выбранные материалы
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {formatCurrency(totalMaterialCost)}
            </Badge>
            {baseCalculationUnit && totalMaterialCost > 0 && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {formatCurrency(totalMaterialCost)}/{baseCalculationUnit}
              </Badge>
            )}
          </div>
        </CardTitle>
        {baseCalculationUnit && (
          <div className="text-sm text-blue-600">
            💡 Расчет стоимости материалов на 1 {baseCalculationUnit}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {materialUsages.length > 0 ? (
          <div className="space-y-4">
            {/* Заголовки таблицы */}
            <div className="grid grid-cols-12 gap-3 text-sm font-medium text-muted-foreground border-b pb-2">
              <div className="col-span-4">Материал</div>
              <div className="col-span-2 text-center">Цена за ед.</div>
              <div className="col-span-2 text-center">Количество</div>
              <div className="col-span-2 text-center">Ед. изм.</div>
              <div className="col-span-1 text-center">Итого</div>
              <div className="col-span-1 text-center">Действия</div>
            </div>

            {/* Строки материалов */}
            {materialUsages.map((usage) => (
              <div key={usage.id} className="grid grid-cols-12 gap-3 items-center py-3 border-b border-gray-100 hover:bg-gray-50 rounded transition-colors">
                <div className="col-span-4">
                  <div className="font-medium">{usage.materialItem.name}</div>
                  <div className="text-xs text-muted-foreground">
                    ID: {usage.materialItem.id.slice(0, 8)}...
                  </div>
                </div>

                <div className="col-span-2 text-center">
                  <div className="font-medium">
                    {formatCurrency(usage.materialItem.price)}
                  </div>
                </div>

                <div className="col-span-2 text-center">
                  {editingUsage === usage.id ? (
                    <Input
                      type="number"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(parseFloat(e.target.value) || 0)}
                      className="h-8 w-full text-center"
                      step="0.01"
                      min="0"
                      autoFocus
                    />
                  ) : (
                    <div className="font-medium">{usage.quantity}</div>
                  )}
                </div>

                <div className="col-span-2 text-center">
                  <Badge variant="outline" className="text-xs">
                    {usage.materialItem.unit}
                  </Badge>
                </div>

                <div className="col-span-1 text-center">
                  <div className="font-bold text-green-600">
                    {formatCurrency(usage.cost)}
                  </div>
                </div>

                <div className="col-span-1 text-center">
                  <div className="flex justify-center gap-1">
                    {editingUsage === usage.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSave(usage.id)}
                          disabled={updating === usage.id}
                        >
                          <Save className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleEditCancel}
                          disabled={updating === usage.id}
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStart(usage)}
                        >
                          <Edit3 className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(usage.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <Separator />

            {/* Итоговая строка */}
            <div className="grid grid-cols-12 gap-3 items-center py-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg px-4">
              <div className="col-span-8 font-bold text-lg">
                Итого материалов:
              </div>
              <div className="col-span-4 text-right">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalMaterialCost)}
                </div>
                {baseCalculationUnit && (
                  <div className="text-sm text-muted-foreground">
                    на 1 {baseCalculationUnit}
                  </div>
                )}
              </div>
            </div>

            {/* Дополнительная информация */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Количество материалов:</span>
                  <span className="ml-2 font-medium">{materialUsages.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Средняя стоимость:</span>
                  <span className="ml-2 font-medium">
                    {materialUsages.length > 0 
                      ? formatCurrency(totalMaterialCost / materialUsages.length)
                      : formatCurrency(0)
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2 text-muted-foreground">
              Материалы не выбраны
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Выберите материалы из списка слева для расчета стоимости
            </p>
            <div className="text-xs text-muted-foreground bg-gray-100 p-2 rounded">
              💡 Добавленные материалы будут автоматически рассчитаны 
              {baseCalculationUnit && ` на базовую единицу: ${baseCalculationUnit}`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
