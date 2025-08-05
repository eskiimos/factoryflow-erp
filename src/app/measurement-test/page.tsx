'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UnitSelector } from '@/components/measurement/unit-selector'
import { UnitConverter } from '@/components/measurement/unit-converter'
import { Calculator, Ruler, Gauge } from 'lucide-react'

export default function MeasurementTestPage() {
  const [selectedUnit, setSelectedUnit] = useState<string>('м')
  const [lengthUnit, setLengthUnit] = useState<string>('м')
  const [areaUnit, setAreaUnit] = useState<string>('м²')
  const [volumeUnit, setVolumeUnit] = useState<string>('м³')
  const [weightUnit, setWeightUnit] = useState<string>('кг')

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Тестирование системы единиц измерения</h1>
          <p className="text-gray-600">
            Проверка работы API, конвертеров и селекторов единиц измерения
          </p>
        </div>

        <Tabs defaultValue="selector" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="selector">Выбор единиц</TabsTrigger>
            <TabsTrigger value="converter">Конвертер</TabsTrigger>
            <TabsTrigger value="calculator">Калькулятор</TabsTrigger>
          </TabsList>

          <TabsContent value="selector" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="h-5 w-5" />
                    Длина
                  </CardTitle>
                  <CardDescription>Единицы измерения длины</CardDescription>
                </CardHeader>
                <CardContent>
                  <UnitSelector
                    value={lengthUnit}
                    onChange={setLengthUnit}
                    type="length"
                    showConversion={true}
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    Выбрано: <span className="font-medium">{lengthUnit}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Площадь
                  </CardTitle>
                  <CardDescription>Единицы измерения площади</CardDescription>
                </CardHeader>
                <CardContent>
                  <UnitSelector
                    value={areaUnit}
                    onChange={setAreaUnit}
                    type="area"
                    showConversion={true}
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    Выбрано: <span className="font-medium">{areaUnit}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    Объем
                  </CardTitle>
                  <CardDescription>Единицы измерения объема</CardDescription>
                </CardHeader>
                <CardContent>
                  <UnitSelector
                    value={volumeUnit}
                    onChange={setVolumeUnit}
                    type="volume"
                    showConversion={true}
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    Выбрано: <span className="font-medium">{volumeUnit}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    Вес
                  </CardTitle>
                  <CardDescription>Единицы измерения веса</CardDescription>
                </CardHeader>
                <CardContent>
                  <UnitSelector
                    value={weightUnit}
                    onChange={setWeightUnit}
                    type="weight"
                    showConversion={true}
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    Выбрано: <span className="font-medium">{weightUnit}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Все единицы измерения</CardTitle>
                <CardDescription>Выбор из всех доступных единиц</CardDescription>
              </CardHeader>
              <CardContent>
                <UnitSelector
                  value={selectedUnit}
                  onChange={setSelectedUnit}
                  type="all"
                  showConversion={true}
                  placeholder="Выберите любую единицу измерения"
                />
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Выбранная единица: <span className="font-medium">{selectedUnit || 'не выбрана'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="converter" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UnitConverter
                showFormula={true}
                allowUnitSwap={true}
                onChange={(result) => {
                  console.log('Conversion result:', result)
                }}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Примеры конвертации</CardTitle>
                  <CardDescription>Популярные преобразования</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Длина:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>1 м = 100 см = 1000 мм</div>
                      <div>1 км = 1000 м</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Площадь:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>1 м² = 10000 см²</div>
                      <div>1 га = 10000 м²</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Объем:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>1 м³ = 1000 л</div>
                      <div>1 л = 1000 см³</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Вес:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>1 кг = 1000 г</div>
                      <div>1 т = 1000 кг</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Калькулятор площади</CardTitle>
                  <CardDescription>Расчет площади по длине и ширине</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Длина</label>
                        <input 
                          type="number" 
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Ширина</label>
                        <input 
                          type="number" 
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    <UnitSelector
                      value={lengthUnit}
                      onChange={setLengthUnit}
                      type="length"
                      label="Единица измерения"
                    />
                    
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">
                        Результат: 0 {areaUnit}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Калькулятор объема</CardTitle>
                  <CardDescription>Расчет объема по размерам</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-sm font-medium">Длина</label>
                        <input 
                          type="number" 
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Ширина</label>
                        <input 
                          type="number" 
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Высота</label>
                        <input 
                          type="number" 
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    <UnitSelector
                      value={lengthUnit}
                      onChange={setLengthUnit}
                      type="length"
                      label="Единица измерения"
                    />
                    
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-800">
                        Результат: 0 {volumeUnit}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
