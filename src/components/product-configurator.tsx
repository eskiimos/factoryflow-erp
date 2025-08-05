"use client"

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'

type Product = {
  id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
}

type Material = {
  id: string
  name: string
  price: number
  unit: string
  quantity: number
}

type WorkType = {
  id: string
  name: string
  price: number
  unit: string
  quantity: number
}

type Fund = {
  id: string
  name: string
  percentage: number
}

type Configuration = {
  totalPrice: number
  materials: Material[]
  workTypes: WorkType[]
  funds: Fund[]
}

type ProductConfiguratorProps = {
  product: Product
  onSave: (config: Configuration) => void
  onCancel: () => void
}

export function ProductConfigurator({ product, onSave, onCancel }: ProductConfiguratorProps) {
  // Состояния для материалов, работ и накладных расходов
  const [materials, setMaterials] = useState<Material[]>([])
  const [workTypes, setWorkTypes] = useState<WorkType[]>([])
  const [funds, setFunds] = useState<Fund[]>([])
  const [totalPrice, setTotalPrice] = useState(product.price)

  // Загрузка данных
  useEffect(() => {
    // TODO: Загрузка с сервера
    setMaterials([
      { id: '1', name: 'Пластик ПВХ 3мм', price: 1200, unit: 'м²', quantity: 1 },
      { id: '2', name: 'Светодиодная лента', price: 800, unit: 'м', quantity: 1 }
    ])
    setWorkTypes([
      { id: '1', name: 'Резка пластика', price: 500, unit: 'м²', quantity: 1 },
      { id: '2', name: 'Монтаж светодиодов', price: 300, unit: 'м', quantity: 1 }
    ])
    setFunds([
      { id: '1', name: 'Общепроизводственные', percentage: 15 },
      { id: '2', name: 'Управленческие', percentage: 10 }
    ])
  }, [])

  // Расчет итоговой цены
  useEffect(() => {
    let total = 0

    // Сумма материалов
    const materialsTotal = materials.reduce((sum, material) => 
      sum + material.price * material.quantity, 0)
    
    // Сумма работ
    const workTotal = workTypes.reduce((sum, work) => 
      sum + work.price * work.quantity, 0)

    // Базовая сумма
    total = materialsTotal + workTotal

    // Накладные расходы
    const fundsTotal = funds.reduce((sum, fund) => 
      sum + (total * fund.percentage / 100), 0)

    total += fundsTotal

    setTotalPrice(total)
  }, [materials, workTypes, funds])

  // Обновление количества материала
  const updateMaterialQuantity = (id: string, quantity: number) => {
    setMaterials(prev => prev.map(material =>
      material.id === id ? { ...material, quantity } : material
    ))
  }

  // Обновление количества работы
  const updateWorkQuantity = (id: string, quantity: number) => {
    setWorkTypes(prev => prev.map(work =>
      work.id === id ? { ...work, quantity } : work
    ))
  }

  // Обновление процента накладных расходов
  const updateFundPercentage = (id: string, percentage: number) => {
    setFunds(prev => prev.map(fund =>
      fund.id === id ? { ...fund, percentage } : fund
    ))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="materials">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="materials">Материалы</TabsTrigger>
          <TabsTrigger value="work">Работы</TabsTrigger>
          <TabsTrigger value="funds">Накладные расходы</TabsTrigger>
        </TabsList>

        {/* Материалы */}
        <TabsContent value="materials">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Материал</TableHead>
                <TableHead>Цена за ед.</TableHead>
                <TableHead>Ед. изм.</TableHead>
                <TableHead>Кол-во</TableHead>
                <TableHead>Сумма</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map(material => (
                <TableRow key={material.id}>
                  <TableCell>{material.name}</TableCell>
                  <TableCell>{material.price.toLocaleString()} ₽</TableCell>
                  <TableCell>{material.unit}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={material.quantity}
                      onChange={e => updateMaterialQuantity(material.id, Number(e.target.value))}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    {(material.price * material.quantity).toLocaleString()} ₽
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Работы */}
        <TabsContent value="work">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Вид работ</TableHead>
                <TableHead>Цена за ед.</TableHead>
                <TableHead>Ед. изм.</TableHead>
                <TableHead>Кол-во</TableHead>
                <TableHead>Сумма</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workTypes.map(work => (
                <TableRow key={work.id}>
                  <TableCell>{work.name}</TableCell>
                  <TableCell>{work.price.toLocaleString()} ₽</TableCell>
                  <TableCell>{work.unit}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={work.quantity}
                      onChange={e => updateWorkQuantity(work.id, Number(e.target.value))}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    {(work.price * work.quantity).toLocaleString()} ₽
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Накладные расходы */}
        <TabsContent value="funds">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Статья расходов</TableHead>
                <TableHead>Процент</TableHead>
                <TableHead>Сумма</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funds.map(fund => {
                const base = materials.reduce((sum, m) => sum + m.price * m.quantity, 0) +
                           workTypes.reduce((sum, w) => sum + w.price * w.quantity, 0)
                const amount = base * fund.percentage / 100

                return (
                  <TableRow key={fund.id}>
                    <TableCell>{fund.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={fund.percentage}
                        onChange={e => updateFundPercentage(fund.id, Number(e.target.value))}
                        className="w-20"
                      />
                      %
                    </TableCell>
                    <TableCell>{amount.toLocaleString()} ₽</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {/* Итог и кнопки */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-lg font-semibold">
          Итого: {totalPrice.toLocaleString()} ₽
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button onClick={() => onSave({ totalPrice, materials, workTypes, funds })}>
            Добавить в заказ
          </Button>
        </div>
      </div>
    </div>
  )
}
