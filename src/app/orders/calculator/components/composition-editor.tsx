'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Package, Wrench, DollarSign } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface OrderItem {
  id: string
  itemName: string
  quantity: number
  materials: OrderItemMaterial[]
  workTypes: OrderItemWorkType[]
  funds: OrderItemFund[]
}

interface OrderItemMaterial {
  id: string
  nameSnapshot: string
  unitSnapshot: string
  priceSnapshot: number
  quantity: number
  calcCost: number
}

interface OrderItemWorkType {
  id: string
  nameSnapshot: string
  unitSnapshot: string
  priceSnapshot: number
  quantity: number
  calcCost: number
  sequence: number
}

interface OrderItemFund {
  id: string
  nameSnapshot: string
  fundType: 'percent' | 'fixed'
  fundValue: number
  calcCost: number
}

interface CompositionEditorProps {
  item: OrderItem
  onUpdate: (updatedItem: OrderItem) => void
}

export function CompositionEditor({ item, onUpdate }: CompositionEditorProps) {
  // Обновление материала
  const updateMaterial = (materialId: string, field: string, value: any) => {
    const updatedMaterials = item.materials.map(material => {
      if (material.id === materialId) {
        const updated = { ...material, [field]: value }
        if (field === 'quantity' || field === 'priceSnapshot') {
          updated.calcCost = updated.quantity * updated.priceSnapshot
        }
        return updated
      }
      return material
    })

    onUpdate({
      ...item,
      materials: updatedMaterials
    })
  }

  // Удаление материала
  const removeMaterial = (materialId: string) => {
    const updatedMaterials = item.materials.filter(material => material.id !== materialId)
    onUpdate({
      ...item,
      materials: updatedMaterials
    })
  }

  // Добавление нового материала
  const addMaterial = () => {
    const newMaterial: OrderItemMaterial = {
      id: `temp_${Date.now()}`,
      nameSnapshot: 'Новый материал',
      unitSnapshot: 'шт',
      priceSnapshot: 0,
      quantity: 1,
      calcCost: 0
    }

    onUpdate({
      ...item,
      materials: [...item.materials, newMaterial]
    })
  }

  // Обновление работы
  const updateWorkType = (workTypeId: string, field: string, value: any) => {
    const updatedWorkTypes = item.workTypes.map(workType => {
      if (workType.id === workTypeId) {
        const updated = { ...workType, [field]: value }
        if (field === 'quantity' || field === 'priceSnapshot') {
          updated.calcCost = updated.quantity * updated.priceSnapshot
        }
        return updated
      }
      return workType
    })

    onUpdate({
      ...item,
      workTypes: updatedWorkTypes
    })
  }

  // Удаление работы
  const removeWorkType = (workTypeId: string) => {
    const updatedWorkTypes = item.workTypes.filter(workType => workType.id !== workTypeId)
    onUpdate({
      ...item,
      workTypes: updatedWorkTypes
    })
  }

  // Добавление новой работы
  const addWorkType = () => {
    const newWorkType: OrderItemWorkType = {
      id: `temp_${Date.now()}`,
      nameSnapshot: 'Новая работа',
      unitSnapshot: 'час',
      priceSnapshot: 0,
      quantity: 1,
      calcCost: 0,
      sequence: item.workTypes.length + 1
    }

    onUpdate({
      ...item,
      workTypes: [...item.workTypes, newWorkType]
    })
  }

  // Обновление фонда
  const updateFund = (fundId: string, field: string, value: any) => {
    const updatedFunds = item.funds.map(fund => {
      if (fund.id === fundId) {
        const updated = { ...fund, [field]: value }
        
        // Пересчет стоимости фонда
        if (field === 'fundValue' || field === 'fundType') {
          const materialsCost = item.materials.reduce((sum, m) => sum + m.calcCost, 0)
          const worksCost = item.workTypes.reduce((sum, w) => sum + w.calcCost, 0)
          const baseCost = materialsCost + worksCost
          
          if (updated.fundType === 'percent') {
            updated.calcCost = baseCost * (updated.fundValue / 100)
          } else {
            updated.calcCost = updated.fundValue
          }
        }
        
        return updated
      }
      return fund
    })

    onUpdate({
      ...item,
      funds: updatedFunds
    })
  }

  // Удаление фонда
  const removeFund = (fundId: string) => {
    const updatedFunds = item.funds.filter(fund => fund.id !== fundId)
    onUpdate({
      ...item,
      funds: updatedFunds
    })
  }

  // Добавление нового фонда
  const addFund = () => {
    const newFund: OrderItemFund = {
      id: `temp_${Date.now()}`,
      nameSnapshot: 'Новый фонд',
      fundType: 'percent',
      fundValue: 0,
      calcCost: 0
    }

    onUpdate({
      ...item,
      funds: [...item.funds, newFund]
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Материалы
          </TabsTrigger>
          <TabsTrigger value="work-types" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Работы
          </TabsTrigger>
          <TabsTrigger value="funds" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Фонды
          </TabsTrigger>
        </TabsList>

        {/* Материалы */}
        <TabsContent value="materials">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Материалы</CardTitle>
              <Button size="sm" onClick={addMaterial}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить материал
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {item.materials.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Материалы не добавлены</p>
                  </div>
                ) : (
                  item.materials.map((material, index) => (
                    <Card key={material.id}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-6 gap-4 items-center">
                          <div className="col-span-2">
                            <Label className="text-xs">Наименование</Label>
                            <Input
                              value={material.nameSnapshot}
                              onChange={(e) => updateMaterial(material.id, 'nameSnapshot', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Количество</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={material.quantity}
                              onChange={(e) => updateMaterial(material.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Единица</Label>
                            <Input
                              value={material.unitSnapshot}
                              onChange={(e) => updateMaterial(material.id, 'unitSnapshot', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Цена</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={material.priceSnapshot}
                              onChange={(e) => updateMaterial(material.id, 'priceSnapshot', parseFloat(e.target.value) || 0)}
                              className="mt-1"
                            />
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <Label className="text-xs">Стоимость</Label>
                              <div className="mt-1 text-sm font-medium">
                                {material.calcCost.toLocaleString('ru-RU')} ₽
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeMaterial(material.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                
                {item.materials.length > 0 && (
                  <div className="flex justify-end pt-4 border-t">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Итого материалов:</div>
                      <div className="text-lg font-semibold">
                        {item.materials.reduce((sum, m) => sum + m.calcCost, 0).toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Работы */}
        <TabsContent value="work-types">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Виды работ</CardTitle>
              <Button size="sm" onClick={addWorkType}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить работу
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {item.workTypes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Виды работ не добавлены</p>
                  </div>
                ) : (
                  item.workTypes.map((workType, index) => (
                    <Card key={workType.id}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-6 gap-4 items-center">
                          <div className="col-span-2">
                            <Label className="text-xs">Наименование</Label>
                            <Input
                              value={workType.nameSnapshot}
                              onChange={(e) => updateWorkType(workType.id, 'nameSnapshot', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Количество</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={workType.quantity}
                              onChange={(e) => updateWorkType(workType.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Единица</Label>
                            <Input
                              value={workType.unitSnapshot}
                              onChange={(e) => updateWorkType(workType.id, 'unitSnapshot', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Ставка</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={workType.priceSnapshot}
                              onChange={(e) => updateWorkType(workType.id, 'priceSnapshot', parseFloat(e.target.value) || 0)}
                              className="mt-1"
                            />
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <Label className="text-xs">Стоимость</Label>
                              <div className="mt-1 text-sm font-medium">
                                {workType.calcCost.toLocaleString('ru-RU')} ₽
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeWorkType(workType.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                
                {item.workTypes.length > 0 && (
                  <div className="flex justify-end pt-4 border-t">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Итого работ:</div>
                      <div className="text-lg font-semibold">
                        {item.workTypes.reduce((sum, w) => sum + w.calcCost, 0).toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Фонды */}
        <TabsContent value="funds">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Фонды и накладные расходы</CardTitle>
              <Button size="sm" onClick={addFund}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить фонд
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {item.funds.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Фонды не добавлены</p>
                  </div>
                ) : (
                  item.funds.map((fund, index) => (
                    <Card key={fund.id}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-5 gap-4 items-center">
                          <div className="col-span-2">
                            <Label className="text-xs">Наименование</Label>
                            <Input
                              value={fund.nameSnapshot}
                              onChange={(e) => updateFund(fund.id, 'nameSnapshot', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Тип</Label>
                            <select
                              value={fund.fundType}
                              onChange={(e) => updateFund(fund.id, 'fundType', e.target.value)}
                              className="mt-1 w-full h-9 px-3 border border-input bg-background rounded-md text-sm"
                            >
                              <option value="percent">Процент</option>
                              <option value="fixed">Фиксированная сумма</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-xs">
                              {fund.fundType === 'percent' ? 'Процент (%)' : 'Сумма (₽)'}
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={fund.fundValue}
                              onChange={(e) => updateFund(fund.id, 'fundValue', parseFloat(e.target.value) || 0)}
                              className="mt-1"
                            />
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <Label className="text-xs">Стоимость</Label>
                              <div className="mt-1 text-sm font-medium">
                                {fund.calcCost.toLocaleString('ru-RU')} ₽
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFund(fund.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                
                {item.funds.length > 0 && (
                  <div className="flex justify-end pt-4 border-t">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Итого фондов:</div>
                      <div className="text-lg font-semibold">
                        {item.funds.reduce((sum, f) => sum + f.calcCost, 0).toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
