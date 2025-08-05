'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormulaInterpreter } from '@/lib/formula-interpreter';
import { BannerVisualization } from './banner-visualization';
import { Calculator, Play, AlertCircle, CheckCircle2, Info } from 'lucide-react';

// Предустановленные примеры формул
const FORMULA_EXAMPLES = [
  {
    name: 'Расчет люверсов для баннера',
    description: 'Рассчитывает количество люверсов на основе размеров и шага',
    formula: 'Math.ceil((width / 1000 + height / 1000) * 2 / (stepSize / 100))',
    params: {
      width: 5000,    // мм
      height: 3000,   // мм  
      stepSize: 30,   // см
      foldSize: 25    // мм (для визуализации)
    },
    expectedResult: 'шт.'
  },
  {
    name: 'Площадь с подгибом',
    description: 'Рассчитывает площадь материала с учетом подгиба по периметру',
    formula: '((width + foldSize * 2) / 1000) * ((height + foldSize * 2) / 1000)',
    params: {
      width: 5000,     // мм
      height: 3000,    // мм
      foldSize: 25     // мм
    },
    expectedResult: 'м²'
  },
  {
    name: 'Расчет материала с отходами',
    description: 'Учитывает процент отходов при расчете материала',
    formula: '(width / 1000) * (height / 1000) * (1 + wastePercentage / 100)',
    params: {
      width: 3000,          // мм
      height: 2000,         // мм
      wastePercentage: 15   // %
    },
    expectedResult: 'м²'
  },
  {
    name: 'Время печати (условное)',
    description: 'Рассчитывает примерное время печати на основе площади и скорости',
    formula: 'Math.ceil((width / 1000) * (height / 1000) / printSpeed * 60)',
    params: {
      width: 2000,      // мм
      height: 1000,     // мм
      printSpeed: 10    // м²/час
    },
    expectedResult: 'мин'
  },
  {
    name: 'Количество погонных метров',
    description: 'Для рулонных материалов - расчет погонных метров',
    formula: 'Math.ceil(width / materialWidth) * (length / 1000)',
    params: {
      width: 3000,         // мм (ширина изделия)
      length: 5000,        // мм (длина изделия)
      materialWidth: 1500  // мм (ширина рулона)
    },
    expectedResult: 'пог.м'
  }
];

export default function FormulasTestPage() {
  const [formula, setFormula] = useState('');
  const [params, setParams] = useState<Record<string, string>>({});
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Загрузить пример формулы
  const loadExample = (example: typeof FORMULA_EXAMPLES[0]) => {
    setFormula(example.formula);
    const stringParams: Record<string, string> = {};
    Object.entries(example.params).forEach(([key, value]) => {
      stringParams[key] = value.toString();
    });
    setParams(stringParams);
    setResult(null);
    setError(null);
  };

  // Обновить параметр
  const updateParam = (key: string, value: string) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Добавить новый параметр
  const addParam = () => {
    const newKey = `param${Object.keys(params).length + 1}`;
    setParams(prev => ({
      ...prev,
      [newKey]: '0'
    }));
  };

  // Удалить параметр
  const removeParam = (key: string) => {
    setParams(prev => {
      const newParams = { ...prev };
      delete newParams[key];
      return newParams;
    });
  };

  // Вычислить формулу
  const calculateFormula = async () => {
    if (!formula.trim()) {
      setError('Введите формулу');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Преобразуем строковые параметры в числа
      const numericParams: Record<string, number> = {};
      Object.entries(params).forEach(([key, value]) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          throw new Error(`Параметр "${key}" должен быть числом`);
        }
        numericParams[key] = numValue;
      });

      // Вычисляем формулу
      const calculatedResult = FormulaInterpreter.evaluate(formula, numericParams);
      setResult(calculatedResult);
    } catch (err: any) {
      setError(err.message || 'Ошибка при вычислении формулы');
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Calculator className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Тестирование системы формул</h1>
      </div>

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList>
          <TabsTrigger value="calculator">Калькулятор</TabsTrigger>
          <TabsTrigger value="examples">Примеры</TabsTrigger>
          <TabsTrigger value="visualization">Визуализация</TabsTrigger>
          <TabsTrigger value="functions">Справка</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Левая колонка - редактор формулы */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Редактор формулы</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="formula">Формула</Label>
                  <Textarea
                    id="formula"
                    value={formula}
                    onChange={(e) => setFormula(e.target.value)}
                    placeholder="Например: Math.ceil((width + height) * 2 / stepSize)"
                    className="font-mono min-h-[120px]"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Используйте Math.функции и переменные из параметров
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Параметры</Label>
                    <Button size="sm" variant="outline" onClick={addParam}>
                      Добавить параметр
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(params).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Input
                          value={key}
                          onChange={(e) => {
                            const newKey = e.target.value;
                            const newParams = { ...params };
                            delete newParams[key];
                            newParams[newKey] = value;
                            setParams(newParams);
                          }}
                          className="w-32 font-mono"
                          placeholder="имя"
                        />
                        <span>=</span>
                        <Input
                          type="number"
                          step="any"
                          value={value}
                          onChange={(e) => updateParam(key, e.target.value)}
                          className="flex-1"
                          placeholder="значение"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeParam(key)}
                          className="text-red-500"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {Object.keys(params).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Добавьте параметры для использования в формуле
                    </p>
                  )}
                </div>

                <Button
                  onClick={calculateFormula}
                  disabled={isCalculating || !formula.trim()}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isCalculating ? 'Вычисляем...' : 'Вычислить'}
                </Button>
              </CardContent>
            </Card>

            {/* Правая колонка - результат */}
            <Card>
              <CardHeader>
                <CardTitle>Результат</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result !== null && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="text-lg font-mono">
                          Результат: <span className="text-2xl font-bold text-primary">{result}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Формула успешно вычислена
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium">Ошибка вычисления:</div>
                      <div className="text-sm mt-1">{error}</div>
                    </AlertDescription>
                  </Alert>
                )}

                {!result && !error && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Введите формулу и параметры, затем нажмите "Вычислить"
                    </AlertDescription>
                  </Alert>
                )}

                {/* Отладочная информация */}
                {(result !== null || error) && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Параметры:</Label>
                      <div className="mt-1 space-y-1">
                        {Object.entries(params).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <span className="font-mono">{key}</span>
                            <Badge variant="outline">{value}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Формула:</Label>
                      <div className="mt-1 p-2 bg-muted rounded text-sm font-mono break-all">
                        {formula}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Примеры формул</CardTitle>
              <p className="text-sm text-muted-foreground">
                Готовые примеры формул для разных типов расчетов
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {FORMULA_EXAMPLES.map((example, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{example.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {example.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Формула:</Label>
                          <div className="mt-1 p-2 bg-muted rounded text-sm font-mono break-all">
                            {example.formula}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Параметры:</Label>
                          <div className="mt-1 space-y-1">
                            {Object.entries(example.params).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between text-sm">
                                <span className="font-mono">{key}</span>
                                <Badge variant="outline">{value}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button 
                          onClick={() => loadExample(example)}
                          className="w-full"
                          variant="outline"
                        >
                          Загрузить пример
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Интерактивная визуализация</CardTitle>
              <p className="text-sm text-muted-foreground">
                Пример визуализации результатов формул на примере расчета баннера с люверсами
              </p>
            </CardHeader>
            <CardContent>
              {formula && result !== null && params.width && params.height && params.stepSize && (
                <BannerVisualization
                  width={parseFloat(params.width) || 5000}
                  height={parseFloat(params.height) || 3000}
                  stepSize={parseFloat(params.stepSize) || 30}
                  grommetsCount={Math.round(result)}
                  foldSize={parseFloat(params.foldSize) || 0}
                />
              )}
              
              {(!formula || result === null) && (
                <div className="text-center py-12">
                  <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Визуализация недоступна</h3>
                  <p className="text-muted-foreground">
                    Перейдите на вкладку "Калькулятор", загрузите пример с люверсами и выполните расчет
                  </p>
                </div>
              )}
              
              {formula && result !== null && (!params.width || !params.height) && (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Недостаточно данных</h3>
                  <p className="text-muted-foreground">
                    Для визуализации нужны параметры: width, height, stepSize
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="functions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Справка по функциям</CardTitle>
              <p className="text-sm text-muted-foreground">
                Доступные функции и операторы для использования в формулах
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Математические функции:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {FormulaInterpreter.getAvailableFunctions().map((func, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {func}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Примеры использования:</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-muted rounded">
                      <code className="text-sm">Math.ceil(5.3)</code>
                      <span className="text-muted-foreground ml-2">→ 6 (округление вверх)</span>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <code className="text-sm">Math.max(10, 20, 5)</code>
                      <span className="text-muted-foreground ml-2">→ 20 (максимальное значение)</span>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <code className="text-sm">width &gt; 1000 ? height * 2 : height</code>
                      <span className="text-muted-foreground ml-2">→ условный оператор</span>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <code className="text-sm">(width + height) * 2 / 1000</code>
                      <span className="text-muted-foreground ml-2">→ арифметические операции</span>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">Важные замечания:</div>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Все переменные должны быть определены в параметрах</li>
                        <li>Результат формулы всегда число</li>
                        <li>Деление на ноль вернет Infinity или NaN</li>
                        <li>Используйте скобки для контроля порядка операций</li>
                        <li>Недоступны циклы, функции и внешние вызовы</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
