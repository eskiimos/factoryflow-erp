'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  CalculationResult, 
  EntryPoint, 
  CompositeCalculation,
  CompositeComponent,
  CalculationMetrics
} from '@/types/calculator';
import { 
  Plus,
  Trash2,
  Copy,
  ArrowDown,
  ArrowUp,
  Loader2
} from 'lucide-react';

// Импорт компонентов
import { StandardProductFlow } from '@/components/calculator/standard-product-flow';
import { WarehouseProductFlow } from '@/components/calculator/warehouse-product-flow';
import { PricingDetails } from '@/components/calculator/pricing-details';

interface CompositeProductFlowProps {
  entryPoint: EntryPoint;
  sourceId?: string;
  initialData?: Partial<CalculationResult>;
  onComplete: (result: CalculationResult) => void;
  onBack: () => void;
  onMetricsUpdate: (update: Partial<CalculationMetrics>) => void;
}

type FlowStep = 'components' | 'calculation' | 'pricing';
type ComponentType = 'STANDARD' | 'WAREHOUSE';

export function CompositeProductFlow({
  entryPoint,
  sourceId,
  initialData,
  onComplete,
  onBack,
  onMetricsUpdate
}: CompositeProductFlowProps) {
  const { toast } = useToast();
  
  // Состояние
  const [step, setStep] = useState<FlowStep>('components');
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState<CompositeComponent[]>([]);
  const [activeComponent, setActiveComponent] = useState<CompositeComponent | null>(null);
  const [compositeCalc, setCompositeCalc] = useState<CompositeCalculation | undefined>();

  // Инициализация
  useEffect(() => {
    if (initialData?.parameters) {
      // Assuming parameters are passed for the components
    }
  }, [initialData]);

  // Управление компонентами
  const addComponent = (type: ComponentType) => {
    const newComponent: CompositeComponent = {
      id: `comp_${Date.now()}`,
      type,
      name: `Новый ${type === 'STANDARD' ? 'стандартный' : 'складской'} компонент`,
      quantity: 1,
      position: components.length + 1
    };
    setComponents([...components, newComponent]);
    setActiveComponent(newComponent);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const duplicateComponent = (id: string) => {
    const original = components.find(c => c.id === id);
    if (original) {
      const newComponent = {
        ...original,
        id: `comp_${Date.now()}`,
        position: components.length + 1
      };
      setComponents([...components, newComponent]);
    }
  };

  const moveComponent = (id: string, direction: 'up' | 'down') => {
    const index = components.findIndex(c => c.id === id);
    if (index === -1) return;

    const newComponents = [...components];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newComponents.length) {
      [newComponents[index], newComponents[targetIndex]] = [newComponents[targetIndex], newComponents[index]];
      setComponents(newComponents);
    }
  };

  const handleComponentCalculationComplete = (result: CalculationResult) => {
    if (activeComponent) {
      const updatedComponents = components.map(c => 
        c.id === activeComponent.id ? { ...c, calculation: result, name: result.templateId } : c
      );
      setComponents(updatedComponents);
      setActiveComponent(null);
    }
  };

  // Расчет сборного товара
  const handleRunCompositeCalculation = async () => {
    setLoading(true);
    setStep('calculation');
    
    try {
      // API вызов для расчета сборки
      // const response = await fetch('/api/calculator/composite-calculate', { ... });
      // const data = await response.json();
      
      // Моковые данные
      const mockCompositeCalc: CompositeCalculation = {
        id: `composite_${Date.now()}`,
        name: 'Сборный товар',
        template: 'default_composite',
        components,
        rules: { sharedOverhead: true, vatTreatment: 'consolidated' },
        summary: {
          totalCost: components.reduce((sum, c) => sum + (c.calculation?.pricing?.totalCost || 0), 0),
          totalPrice: components.reduce((sum, c) => sum + (c.calculation?.pricing?.finalPrice || 0), 0),
          criticalPath: [],
          bom: []
        }
      };
      setCompositeCalc(mockCompositeCalc);
      setStep('pricing');
      toast({ title: 'Расчет сборного товара выполнен' });
    } catch (error) {
      console.error('Composite calculation error:', error);
      toast({ title: 'Ошибка расчета сборки', variant: 'destructive' });
      setStep('components');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    if (!compositeCalc) return;

    const result: CalculationResult = {
      id: `calc_${Date.now()}`,
      name: compositeCalc.name,
      templateId: compositeCalc.template,
      productType: 'COMPOSITE',
      entryPoint,
      sourceId,
      parameters: { basic: {}, advanced: {}, quantity: 1 },
      pricing: {
        costItems: [],
        totalCost: compositeCalc.summary.totalCost,
        marginPercentage: 0,
        marginAmount: 0,
        discountPercentage: 0,
        discountAmount: 0,
        taxPercentage: 0,
        taxAmount: 0,
        finalPrice: compositeCalc.summary.totalPrice,
      },
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [],
      metrics: {},
    };
    onComplete(result);
  };

  // Рендеринг
  if (activeComponent) {
    return (
      <div>
        <Button variant="ghost" onClick={() => setActiveComponent(null)}>Назад к списку компонентов</Button>
        {activeComponent.type === 'STANDARD' ? (
          <StandardProductFlow
            entryPoint={entryPoint}
            productType="STANDARD"
            onComplete={handleComponentCalculationComplete}
            onBack={() => setActiveComponent(null)}
            onMetricsUpdate={onMetricsUpdate}
          />
        ) : (
          <WarehouseProductFlow
            entryPoint={entryPoint}
            onComplete={handleComponentCalculationComplete}
            onBack={() => setActiveComponent(null)}
            onMetricsUpdate={onMetricsUpdate}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Сборный товар: Компоненты</CardTitle>
          <CardDescription>
            Добавьте компоненты, из которых состоит товар. Для каждого компонента будет выполнен отдельный расчет.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Список компонентов */}
          <div className="space-y-2">
            {components.map((component, index) => (
              <Card key={component.id} className="flex items-center p-3">
                <div className="flex-1">
                  <p className="font-medium">{component.name}</p>
                  <p className="text-sm text-gray-600">
                    Тип: {component.type} | Количество: {component.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => moveComponent(component.id, 'up')} disabled={index === 0}><ArrowUp className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => moveComponent(component.id, 'down')} disabled={index === components.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => setActiveComponent(component)}>Ред.</Button>
                  <Button variant="ghost" size="sm" onClick={() => duplicateComponent(component.id)}><Copy className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => removeComponent(component.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Кнопки добавления */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => addComponent('STANDARD')}>
              <Plus className="mr-2 h-4 w-4" /> Добавить стандартный
            </Button>
            <Button variant="outline" onClick={() => addComponent('WAREHOUSE')}>
              <Plus className="mr-2 h-4 w-4" /> Добавить со склада
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Действия */}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>Назад</Button>
        <Button onClick={handleRunCompositeCalculation} disabled={loading || components.length === 0}>
          {loading ? <Loader2 className="animate-spin" /> : 'Рассчитать сборку'}
        </Button>
      </div>

      {/* Результаты */}
      {step === 'pricing' && compositeCalc && (
        <Card>
          <CardHeader>
            <CardTitle>Результат расчета сборного товара</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Итоговая стоимость: {compositeCalc.summary.totalPrice.toLocaleString('ru-RU')} ₽</p>
            <div className="flex justify-between mt-4">
              <Button variant="ghost" onClick={() => setStep('components')}>Изменить компоненты</Button>
              <Button onClick={handleComplete}>Завершить</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
