'use client'

import { Package, Layers, Warehouse } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export type ProductType = 'STANDARD' | 'ASSEMBLY' | 'WAREHOUSE'

interface ProductTypeSelectorProps {
  selectedType: ProductType
  onTypeChange: (type: ProductType) => void
  className?: string
}

const productTypes = [
  {
    value: 'STANDARD' as const,
    title: 'Стандартный товар',
    description: 'Товар с расчетом за единицу измерения (см, мм, м², м³)',
    icon: Package,
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    selectedColor: 'bg-blue-500 text-white border-blue-500',
    badgeColor: 'bg-blue-100 text-blue-800',
    features: ['Расчет по материалам', 'Виды работ', 'Накладные расходы']
  },
  {
    value: 'ASSEMBLY' as const,
    title: 'Сборный товар',
    description: 'Товар, состоящий из других товаров и компонентов',
    icon: Layers,
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
    selectedColor: 'bg-green-500 text-white border-green-500',
    badgeColor: 'bg-green-100 text-green-800',
    features: ['Компоненты из каталога', 'Автоматический расчет', 'Управление сборкой']
  },
  {
    value: 'WAREHOUSE' as const,
    title: 'Товар со склада',
    description: 'Готовый товар с фиксированной стоимостью за единицу',
    icon: Warehouse,
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    selectedColor: 'bg-orange-500 text-white border-orange-500',
    badgeColor: 'bg-orange-100 text-orange-800',
    features: ['Фиксированная цена', 'Учет остатков', 'Быстрое оформление']
  }
]

export function ProductTypeSelector({ selectedType, onTypeChange, className }: ProductTypeSelectorProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {productTypes.map((type) => {
        const Icon = type.icon
        const isSelected = selectedType === type.value
        
        return (
          <Card
            key={type.value}
            className={`cursor-pointer transition-all duration-200 ${
              isSelected 
                ? type.selectedColor 
                : `${type.color} hover:shadow-md`
            }`}
            onClick={() => onTypeChange(type.value)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  isSelected 
                    ? 'bg-white/20' 
                    : 'bg-white'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    isSelected 
                      ? 'text-white' 
                      : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold text-sm ${
                      isSelected ? 'text-white' : 'text-gray-900'
                    }`}>
                      {type.title}
                    </h3>
                    {isSelected && (
                      <Badge className="bg-white/20 text-white border-white/30 text-xs">
                        Выбрано
                      </Badge>
                    )}
                  </div>
                  <p className={`text-xs mb-3 ${
                    isSelected ? 'text-white/80' : 'text-gray-600'
                  }`}>
                    {type.description}
                  </p>
                  <div className="space-y-1">
                    {type.features.map((feature, index) => (
                      <div 
                        key={index}
                        className={`text-xs flex items-center ${
                          isSelected ? 'text-white/70' : 'text-gray-500'
                        }`}
                      >
                        <div className={`w-1 h-1 rounded-full mr-2 ${
                          isSelected ? 'bg-white/50' : 'bg-gray-400'
                        }`} />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
