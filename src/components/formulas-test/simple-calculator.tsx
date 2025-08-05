'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Package, Clock, Ruler, DollarSign } from 'lucide-react';

interface CalculatorItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  inputs: Array<{
    key: string;
    label: string;
    unit: string;
    defaultValue: number;
  }>;
  calculate: (inputs: Record<string, number>) => {
    result: number;
    unit: string;
    explanation: string;
  };
}

const calculators: CalculatorItem[] = [
  {
    id: 'banner-grommets',
    name: 'Люверсы для баннера',
    description: 'Рассчитать количество люверсов',
    icon: <Package className="w-5 h-5" />,
    inputs: [
      { key: 'width', label: 'Ширина', unit: 'м', defaultValue: 3 },
      { key: 'height', label: 'Высота', unit: 'м', defaultValue: 2 },
      { key: 'step', label: 'Шаг', unit: 'см', defaultValue: 20 }
    ],
    calculate: ({ width, height, step }) => {
      const perimeter = (width + height) * 2 * 100; // в см
      const count = Math.ceil(perimeter / step);
      return {
        result: count,
        unit: 'шт',
        explanation: `Периметр ${perimeter/100}м ÷ шаг ${step}см = ${count} люверсов`
      };
    }
  },
  {
    id: 'material-waste',
    name: 'Материал с отходами',
    description: 'Учесть отходы при расчете',
    icon: <Calculator className="w-5 h-5" />,
    inputs: [
      { key: 'base', label: 'Базовое количество', unit: 'м²', defaultValue: 10 },
      { key: 'waste', label: 'Отходы', unit: '%', defaultValue: 15 }
    ],
    calculate: ({ base, waste }) => {
      const total = base * (1 + waste / 100);
      return {
        result: total,
        unit: 'м²',
        explanation: `${base}м² + ${waste}% отходов = ${total.toFixed(2)}м²`
      };
    }
  },
  {
    id: 'print-time',
    name: 'Время печати',
    description: 'Рассчитать время на печать',
    icon: <Clock className="w-5 h-5" />,
    inputs: [
      { key: 'area', label: 'Площадь', unit: 'м²', defaultValue: 5 },
      { key: 'speed', label: 'Скорость', unit: 'м²/ч', defaultValue: 12 }
    ],
    calculate: ({ area, speed }) => {
      const hours = area / speed;
      return {
        result: hours,
        unit: 'ч',
        explanation: `${area}м² ÷ ${speed}м²/ч = ${hours.toFixed(1)} часов`
      };
    }
  },
  {
    id: 'linear-meters',
    name: 'Линейные метры',
    description: 'Перевести площадь в погонные метры',
    icon: <Ruler className="w-5 h-5" />,
    inputs: [
      { key: 'area', label: 'Площадь', unit: 'м²', defaultValue: 20 },
      { key: 'width', label: 'Ширина рулона', unit: 'м', defaultValue: 1.6 }
    ],
    calculate: ({ area, width }) => {
      const length = area / width;
      return {
        result: length,
        unit: 'пог.м',
        explanation: `${area}м² ÷ ${width}м ширины = ${length.toFixed(1)} пог.м`
      };
    }
  },
  {
    id: 'price-with-tax',
    name: 'Цена с НДС',
    description: 'Добавить НДС к стоимости',
    icon: <DollarSign className="w-5 h-5" />,
    inputs: [
      { key: 'price', label: 'Цена без НДС', unit: '₽', defaultValue: 1000 },
      { key: 'tax', label: 'НДС', unit: '%', defaultValue: 20 }
    ],
    calculate: ({ price, tax }) => {
      const total = price * (1 + tax / 100);
      return {
        result: total,
        unit: '₽',
        explanation: `${price}₽ + ${tax}% НДС = ${total.toFixed(0)}₽`
      };
    }
  }
];

export function SimpleCalculator() {
  const [selectedCalculator, setSelectedCalculator] = useState<string>(calculators[0].id);
  const [inputs, setInputs] = useState<Record<string, number>>({});

  const currentCalculator = calculators.find(c => c.id === selectedCalculator)!;
  
  // Инициализируем значения по умолчанию
  React.useEffect(() => {
    const defaultInputs: Record<string, number> = {};
    currentCalculator.inputs.forEach(input => {
      defaultInputs[input.key] = input.defaultValue;
    });
    setInputs(defaultInputs);
  }, [selectedCalculator]);

  const result = currentCalculator.calculate(inputs);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Калькуляторы для производства
        </h1>
        <p className="text-muted-foreground">
          Простые расчеты для повседневных задач
        </p>
      </div>

      {/* Выбор калькулятора */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {calculators.map((calc) => (
          <Card 
            key={calc.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedCalculator === calc.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : ''
            }`}
            onClick={() => setSelectedCalculator(calc.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  {calc.icon}
                </div>
                <div>
                  <h3 className="font-medium">{calc.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {calc.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Калькулятор */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ввод данных */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentCalculator.icon}
              {currentCalculator.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentCalculator.inputs.map((input) => (
              <div key={input.key} className="space-y-2">
                <Label>{input.label}</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={inputs[input.key] || ''}
                    onChange={(e) => setInputs({
                      ...inputs,
                      [input.key]: parseFloat(e.target.value) || 0
                    })}
                    placeholder="0"
                  />
                  <div className="flex items-center px-3 text-sm text-muted-foreground bg-muted rounded-md">
                    {input.unit}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Результат */}
        <Card>
          <CardHeader>
            <CardTitle>Результат</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary">
                {typeof result.result === 'number' ? result.result.toFixed(1) : '0'}
                <span className="text-lg text-muted-foreground ml-2">
                  {result.unit}
                </span>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {result.explanation}
                </p>
              </div>

              <Button 
                onClick={() => {
                  const text = `${currentCalculator.name}: ${result.result.toFixed(1)} ${result.unit}\n${result.explanation}`;
                  navigator.clipboard.writeText(text);
                }}
                variant="outline"
                size="sm"
              >
                Скопировать результат
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
