'use client'

import { useState } from 'react'
import { BaseUnitSelector } from '@/components/base-unit-selector'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestMeasurementUnits() {
  const [selectedUnit, setSelectedUnit] = useState('')

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🔥 Тестирование системы единиц измерения</h1>
        <p className="text-muted-foreground">
          Проверяем работу революционной системы ценообразования
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🎯 Демонстрация BaseUnitSelector</CardTitle>
          <CardDescription>
            Это основной компонент для выбора базовой единицы калькуляции товара
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BaseUnitSelector
            value={selectedUnit}
            onChange={(value) => {
              console.log('Выбрана единица:', value)
              setSelectedUnit(value)
            }}
          />
          
          {selectedUnit && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✅ Выбрана единица: <strong>{selectedUnit}</strong>
              </p>
              <p className="text-green-600 text-sm mt-1">
                Теперь все расчеты будут вестись на 1 {selectedUnit}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 Информация о системе</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">5</div>
              <div className="text-sm text-blue-800">Типов единиц</div>
              <div className="text-xs text-blue-600">длина, площадь, объем, вес, количество</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">16</div>
              <div className="text-sm text-green-800">Единиц измерения</div>
              <div className="text-xs text-green-600">от мм до м³</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">∞</div>
              <div className="text-sm text-purple-800">Гибкость расчетов</div>
              <div className="text-xs text-purple-600">любые комбинации</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">⚡</div>
              <div className="text-sm text-orange-800">Скорость расчета</div>
              <div className="text-xs text-orange-600">мгновенно</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg border">
              <div className="text-2xl font-bold text-red-600">🔥</div>
              <div className="text-sm text-red-800">Эффект на пользователей</div>
              <div className="text-xs text-red-600">отвалится челюсть!</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
