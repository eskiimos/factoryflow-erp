'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EntryPoint } from '@/types/calculator';
import { 
  Briefcase, 
  ShoppingCart, 
  BookOpen, 
  History, 
  Star, 
  FileText,
  Plus
} from 'lucide-react';

interface EntryPointSelectorProps {
  onSelect: (entryPoint: EntryPoint) => void;
  sourceId?: string;
}

type EntryPointOption = {
  id: EntryPoint;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  popular?: boolean;
};

export function EntryPointSelector({ onSelect, sourceId }: EntryPointSelectorProps) {
  const [selectedEntry, setSelectedEntry] = useState<EntryPoint | null>(null);

  const entryPoints: EntryPointOption[] = [
    {
      id: 'DEAL',
      title: 'Из сделки',
      description: 'Добавить позицию к существующей сделке или создать расчет для потенциального клиента',
      icon: <Briefcase className="h-6 w-6" />,
      badge: 'CRM',
      popular: true
    },
    {
      id: 'ORDER',
      title: 'Из заказа',
      description: 'Добавить позицию к текущему заказу или создать новый заказ',
      icon: <ShoppingCart className="h-6 w-6" />,
      badge: 'Производство'
    },
    {
      id: 'CATALOG',
      title: 'Из каталога',
      description: 'Рассчитать стоимость товара из каталога с индивидуальными параметрами',
      icon: <BookOpen className="h-6 w-6" />,
      badge: 'Каталог'
    },
    {
      id: 'HISTORY',
      title: 'Дублировать расчет',
      description: 'Создать новый расчет на основе уже выполненного ранее',
      icon: <History className="h-6 w-6" />,
      badge: 'История'
    },
    {
      id: 'TEMPLATE',
      title: 'Шаблон клиента',
      description: 'Использовать сохраненный шаблон для конкретного клиента или проекта',
      icon: <Star className="h-6 w-6" />,
      badge: 'Шаблон'
    },
    {
      id: 'BRIEF',
      title: 'Импорт из брифа',
      description: 'Создать расчет на основе данных из заявки или технического задания',
      icon: <FileText className="h-6 w-6" />,
      badge: 'Бриф'
    }
  ];

  const handleSelect = (entryPoint: EntryPoint) => {
    setSelectedEntry(entryPoint);
  };

  const handleContinue = () => {
    if (selectedEntry) {
      onSelect(selectedEntry);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Создать расчет
          </CardTitle>
          <CardDescription>
            Выберите, откуда будет создан расчет стоимости. Это поможет системе 
            подготовить нужные данные и настроить оптимальный рабочий процесс.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entryPoints.map((entry) => (
              <Card
                key={entry.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedEntry === entry.id
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSelect(entry.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 ${
                      selectedEntry === entry.id ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {entry.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm">{entry.title}</h3>
                        {entry.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {entry.badge}
                          </Badge>
                        )}
                        {entry.popular && (
                          <Badge variant="default" className="text-xs">
                            Популярное
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedEntry && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-green-900">
                    Выбрано: {entryPoints.find(e => e.id === selectedEntry)?.title}
                  </h4>
                  <p className="text-sm text-green-700">
                    {entryPoints.find(e => e.id === selectedEntry)?.description}
                  </p>
                </div>
                <Button onClick={handleContinue}>
                  Продолжить
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Быстрые действия для частых сценариев */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Быстрые действия</CardTitle>
          <CardDescription>
            Часто используемые сценарии для ускорения работы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start"
              onClick={() => onSelect('CATALOG')}
            >
              <div className="text-left">
                <div className="font-medium">Стандартный расчет</div>
                <div className="text-sm text-gray-600">Быстрый расчет из каталога</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start"
              onClick={() => onSelect('DEAL')}
            >
              <div className="text-left">
                <div className="font-medium">Для клиента</div>
                <div className="text-sm text-gray-600">Расчет в рамках сделки</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
