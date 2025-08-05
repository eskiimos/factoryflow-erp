'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Minus, 
  X, 
  Divide, 
  Trash2,
  Play,
  Save,
  Copy,
  Download,
  RefreshCw
} from 'lucide-react';

interface FormulaBlock {
  id: string;
  type: 'number' | 'variable' | 'operator' | 'function';
  value: string;
  label?: string;
}

interface Variable {
  name: string;
  label: string;
  value: number;
  unit: string;
}

interface SavedFormula {
  id?: string;
  name: string;
  description?: string;
  formula: FormulaBlock[];
  variables: Variable[];
  category?: string;
}

const OPERATORS = [
  { symbol: '+', label: 'Сложение', icon: Plus },
  { symbol: '-', label: 'Вычитание', icon: Minus },
  { symbol: '*', label: 'Умножение', icon: X },
  { symbol: '/', label: 'Деление', icon: Divide },
];

const FUNCTIONS = [
  { name: 'Math.ceil', label: 'Округлить вверх', example: 'ceil(4.2) = 5' },
  { name: 'Math.floor', label: 'Округлить вниз', example: 'floor(4.8) = 4' },
  { name: 'Math.round', label: 'Округлить', example: 'round(4.6) = 5' },
  { name: 'Math.max', label: 'Максимум', example: 'max(5, 3) = 5' },
  { name: 'Math.min', label: 'Минимум', example: 'min(5, 3) = 3' },
];

export function FormulaConstructor() {
  const [formula, setFormula] = useState<FormulaBlock[]>([]);
  const [variables, setVariables] = useState<Variable[]>([
    { name: 'width', label: 'Ширина', value: 3, unit: 'м' },
    { name: 'height', label: 'Высота', value: 2, unit: 'м' },
    { name: 'step', label: 'Шаг', value: 20, unit: 'см' },
  ]);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [savedFormulas, setSavedFormulas] = useState<SavedFormula[]>([]);

  // Загружаем сохраненные формулы при инициализации
  useEffect(() => {
    loadFormulasFromAPI();
  }, []);

  const loadFormulasFromAPI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/formulas');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setSavedFormulas(data.data);
      } else {
        // Fallback к локальным формулам если API недоступно
        setSavedFormulas([
          {
            name: '🏷️ Люверсы в баннере',
            description: 'Расчет количества люверсов по периметру баннера',
            category: 'Баннеры',
            formula: [
              { id: '1', type: 'function', value: 'Math.ceil', label: 'Округлить вверх' },
              { id: '2', type: 'variable', value: 'width', label: 'Ширина' },
              { id: '3', type: 'operator', value: '+', label: 'Сложение' },
              { id: '4', type: 'variable', value: 'height', label: 'Высота' },
              { id: '5', type: 'operator', value: '*', label: 'Умножение' },
              { id: '6', type: 'number', value: '2' },
              { id: '7', type: 'operator', value: '/', label: 'Деление' },
              { id: '8', type: 'variable', value: 'step', label: 'Шаг' },
            ],
            variables: [
              { name: 'width', label: 'Ширина', value: 3, unit: 'м' },
              { name: 'height', label: 'Высота', value: 2, unit: 'м' },
              { name: 'step', label: 'Шаг', value: 0.2, unit: 'м' },
            ]
          },
          {
            name: '📦 Материал с отходами',
            description: 'Расчет количества материала с учетом отходов',
            category: 'Материалы',
            formula: [
              { id: '1', type: 'variable', value: 'base', label: 'Базовое количество' },
              { id: '2', type: 'operator', value: '*', label: 'Умножение' },
              { id: '3', type: 'number', value: '1' },
              { id: '4', type: 'operator', value: '+', label: 'Сложение' },
              { id: '5', type: 'variable', value: 'waste', label: 'Отходы' },
              { id: '6', type: 'operator', value: '/', label: 'Деление' },
              { id: '7', type: 'number', value: '100' },
            ],
            variables: [
              { name: 'base', label: 'Базовое количество', value: 10, unit: 'м²' },
              { name: 'waste', label: 'Отходы', value: 15, unit: '%' },
            ]
          }
        ]);
      }
    } catch (error) {
      console.error('Ошибка загрузки формул:', error);
      setError('Не удалось загрузить формулы из базы данных');
    } finally {
      setIsLoading(false);
    }
  };

  const addBlock = (block: Omit<FormulaBlock, 'id'>) => {
    const newBlock: FormulaBlock = {
      ...block,
      id: Math.random().toString(36).substr(2, 9)
    };
    setFormula([...formula, newBlock]);
  };

  const removeBlock = (id: string) => {
    setFormula(formula.filter(block => block.id !== id));
  };

  const addVariable = () => {
    const name = `var${variables.length + 1}`;
    setVariables([...variables, {
      name,
      label: `Переменная ${variables.length + 1}`,
      value: 0,
      unit: ''
    }]);
  };

  const updateVariable = (index: number, field: keyof Variable, value: string | number) => {
    const newVariables = [...variables];
    (newVariables[index] as any)[field] = value;
    setVariables(newVariables);
  };

  const calculateFormula = () => {
    if (formula.length === 0) {
      setError('Формула пуста');
      return;
    }

    try {
      // Строим строку формулы
      let formulaString = '';
      let openBrackets = 0;
      let needsClosing = false;

      for (let i = 0; i < formula.length; i++) {
        const block = formula[i];
        
        switch (block.type) {
          case 'number':
            formulaString += block.value;
            break;
          case 'variable':
            const variable = variables.find(v => v.name === block.value);
            if (variable) {
              formulaString += variable.value;
            } else {
              throw new Error(`Переменная ${block.value} не найдена`);
            }
            break;
          case 'operator':
            formulaString += ` ${block.value} `;
            break;
          case 'function':
            formulaString += `${block.value}(`;
            openBrackets++;
            needsClosing = true;
            break;
        }
      }

      // Закрываем незакрытые скобки
      if (needsClosing) {
        formulaString += ')'.repeat(openBrackets);
      }

      console.log('Формула для вычисления:', formulaString);

      // Создаем безопасную функцию для вычисления
      const mathContext = {
        Math: {
          ceil: Math.ceil,
          floor: Math.floor,
          round: Math.round,
          max: Math.max,
          min: Math.min,
          abs: Math.abs,
          sqrt: Math.sqrt,
          pow: Math.pow
        }
      };

      // Создаем функцию в безопасном контексте
      const func = new Function('Math', `"use strict"; return (${formulaString})`);
      const result = func(mathContext.Math);
      
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Неверный результат вычисления');
      }

      setResult(result);
      setError('');
    } catch (err) {
      console.error('Ошибка вычисления:', err);
      setError('Ошибка в формуле: ' + (err as Error).message);
      setResult(null);
    }
  };

  const getFormulaText = () => {
    return formula.map(block => {
      switch (block.type) {
        case 'variable':
          return block.label || block.value;
        case 'function':
          return block.label || block.value;
        default:
          return block.value;
      }
    }).join(' ');
  };

  const saveFormulaToAPI = async () => {
    const name = prompt('Название формулы:');
    if (!name) return;

    const description = prompt('Описание формулы (необязательно):') || '';
    const category = prompt('Категория формулы (необязательно):') || '';

    setIsLoading(true);
    try {
      const formulaData = {
        name,
        description,
        category,
        formula: formula,
        variables: variables,
        isPublic: true
      };

      const response = await fetch('/api/formulas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulaData)
      });

      const data = await response.json();

      if (data.success) {
        alert(`Формула "${name}" успешно сохранена в базе данных!`);
        await loadFormulasFromAPI(); // Перезагружаем список
      } else {
        throw new Error(data.error || 'Неизвестная ошибка');
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert(`Ошибка при сохранении: ${error}`);
      
      // Добавляем локально как fallback
      setSavedFormulas([...savedFormulas, {
        name,
        formula: [...formula],
        variables: [...variables]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFormula = (saved: SavedFormula) => {
    setFormula(saved.formula);
    setVariables(saved.variables);
    setResult(null);
    setError('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Конструктор формул
        </h1>
        <p className="text-muted-foreground">
          Создавайте формулы простым перетаскиванием блоков
        </p>
        {isLoading && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Загрузка...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Блоки для построения */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Числа и переменные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Переменные */}
              {variables.map((variable) => (
                <Button
                  key={variable.name}
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => addBlock({
                    type: 'variable',
                    value: variable.name,
                    label: variable.label
                  })}
                >
                  <div>
                    <div className="font-medium">{variable.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {variable.value} {variable.unit}
                    </div>
                  </div>
                </Button>
              ))}
              
              {/* Ручной ввод числа */}
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Число"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      if (input.value) {
                        addBlock({
                          type: 'number',
                          value: input.value
                        });
                        input.value = '';
                      }
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                    if (input?.value) {
                      addBlock({
                        type: 'number',
                        value: input.value
                      });
                      input.value = '';
                    }
                  }}
                >
                  +
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Операторы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {OPERATORS.map((op) => (
                  <Button
                    key={op.symbol}
                    variant="outline"
                    onClick={() => addBlock({
                      type: 'operator',
                      value: op.symbol,
                      label: op.label
                    })}
                    className="flex items-center gap-2"
                  >
                    <op.icon className="w-4 h-4" />
                    {op.symbol}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Функции</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {FUNCTIONS.map((func) => (
                <Button
                  key={func.name}
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => addBlock({
                    type: 'function',
                    value: func.name,
                    label: func.label
                  })}
                >
                  <div>
                    <div className="font-medium">{func.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {func.example}
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Конструктор формулы */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Формула</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[200px] p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                {formula.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    Нажмите на блоки слева чтобы добавить в формулу
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formula.map((block) => (
                      <Badge
                        key={block.id}
                        variant={block.type === 'operator' ? 'destructive' : 'default'}
                        className="relative group cursor-pointer"
                      >
                        {block.label || block.value}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute -top-2 -right-2 w-4 h-4 p-0 opacity-0 group-hover:opacity-100"
                          onClick={() => removeBlock(block.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={calculateFormula} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Вычислить
                </Button>
                <Button 
                  onClick={() => {
                    setFormula([]);
                    setResult(null);
                    setError('');
                  }} 
                  variant="outline"
                  title="Очистить формулу"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={saveFormulaToAPI} 
                  variant="outline"
                  title="Сохранить в базу данных"
                  disabled={isLoading || formula.length === 0}
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>

              {result !== null && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    Результат: {result.toFixed(2)}
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    {getFormulaText()}
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <div className="text-red-700">{error}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Сохраненные формулы */}
          {savedFormulas.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Сохраненные формулы</CardTitle>
                  <Button 
                    onClick={loadFormulasFromAPI} 
                    variant="ghost" 
                    size="sm"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {savedFormulas.map((saved, index) => (
                  <Button
                    key={saved.id || index}
                    variant="outline"
                    className="w-full justify-between text-left"
                    onClick={() => loadFormula(saved)}
                  >
                    <div>
                      <div className="font-medium">{saved.name}</div>
                      {saved.description && (
                        <div className="text-xs text-muted-foreground">
                          {saved.description}
                        </div>
                      )}
                      {saved.category && (
                        <div className="text-xs text-blue-600">
                          {saved.category}
                        </div>
                      )}
                    </div>
                    <Download className="w-4 h-4" />
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Переменные */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Переменные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {variables.map((variable, index) => (
                <div key={variable.name} className="space-y-2 p-3 border rounded-lg">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Название</Label>
                      <Input
                        value={variable.label}
                        onChange={(e) => updateVariable(index, 'label', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Единица</Label>
                      <Input
                        value={variable.unit}
                        onChange={(e) => updateVariable(index, 'unit', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Значение</Label>
                    <Input
                      type="number"
                      value={variable.value}
                      onChange={(e) => updateVariable(index, 'value', parseFloat(e.target.value) || 0)}
                      className="h-8"
                    />
                  </div>
                </div>
              ))}
              
              <Button onClick={addVariable} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Добавить переменную
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
