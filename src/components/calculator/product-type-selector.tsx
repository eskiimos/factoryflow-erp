'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EntryPoint, ProductCalculationType } from '@/types/calculator';
import { Package, Layers, Archive, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductTypeSelectorProps {
  entryPoint: EntryPoint;
  onSelect: (type: ProductCalculationType) => void;
  onBack: () => void;
}

type ProductTypeOption = {
  id: ProductCalculationType;
  title: string;
  description: string;
  icon: React.ReactNode;
  complexity: 'simple' | 'medium' | 'complex';
};

export function ProductTypeSelector({ entryPoint, onSelect }: ProductTypeSelectorProps) {
  const productTypes: ProductTypeOption[] = [
    {
      id: 'STANDARD',
      title: 'Стандартный товар',
      description: 'Изделия с расчетом по параметрам, материалам и операциям.',
      icon: <Package className="h-6 w-6" />,
      complexity: 'medium',
    },
    {
      id: 'COMPOSITE',
      title: 'Сборный товар',
      description: 'Комплекты и наборы из нескольких компонентов.',
      icon: <Layers className="h-6 w-6" />,
      complexity: 'complex',
    },
    {
      id: 'WAREHOUSE',
      title: 'Товар со склада',
      description: 'Готовые товары с фиксированными ценами и учетом остатков.',
      icon: <Archive className="h-6 w-6" />,
      complexity: 'simple',
    },
  ];

  const getEntryPointName = (entry: EntryPoint): string => {
    switch (entry) {
      case 'DEAL': return 'сделки';
      case 'ORDER': return 'заказа';
      case 'CATALOG': return 'каталога';
      default: return 'источника';
    }
  };

  const getComplexityStyles = (complexity: 'simple' | 'medium' | 'complex') => {
    switch (complexity) {
      case 'simple': return { badge: 'bg-green-100 text-green-800 border-green-200', hover: 'hover:border-green-400' };
      case 'medium': return { badge: 'bg-yellow-100 text-yellow-800 border-yellow-200', hover: 'hover:border-yellow-400' };
      case 'complex': return { badge: 'bg-rose-100 text-rose-800 border-rose-200', hover: 'hover:border-rose-400' };
    }
  };
  
  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'Простой';
      case 'medium': return 'Средний';
      case 'complex': return 'Сложный';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Выберите тип товара</h2>
        <p className="text-muted-foreground">
          Создание расчета из {getEntryPointName(entryPoint)}.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        {productTypes.map((type) => {
          const styles = getComplexityStyles(type.complexity);
          return (
            <Card
              key={type.id}
              className={cn(
                "cursor-pointer transition-all duration-200 group flex flex-col",
                styles.hover
              )}
              onClick={() => onSelect(type.id)}
            >
              <CardHeader className="flex-grow">
                <div className="flex justify-between items-start">
                  <div className="text-muted-foreground">{type.icon}</div>
                  <Badge variant="outline" className={cn("text-xs", styles.badge)}>
                    {getComplexityLabel(type.complexity)}
                  </Badge>
                </div>
                <div className="pt-4">
                  <CardTitle className="text-base">{type.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">{type.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end items-center text-xs text-blue-600 font-medium">
                  Выбрать <ArrowRight className="h-3 w-3 ml-1 transform transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}