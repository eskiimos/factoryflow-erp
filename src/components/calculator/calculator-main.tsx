'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  CalculationResult, 
  EntryPoint, 
  ProductCalculationType,
  CalculationMetrics
} from '@/types/calculator';
import { Calculator, Clock, ArrowLeft, ChevronsUpDown } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Импорт компонентов шагов
import { formatCurrency } from '@/lib/utils';
import { ProductTypeSelector } from '@/components/calculator/product-type-selector';
import { StandardProductFlow } from '@/components/calculator/standard-product-flow';
import { CompositeProductFlow } from '@/components/calculator/composite-product-flow';
import { WarehouseProductFlow } from '@/components/calculator/warehouse-product-flow';
import { CalculationResults } from '@/components/calculator/calculation-results';

interface CalculatorMainProps {
  sourceId?: string;
  initialData?: Partial<CalculationResult>;
  // entryPoint is kept for potential future use but is not actively selected by the user
  entryPoint?: EntryPoint; 
}

type FlowStep = 'product_type' | 'calculation' | 'results';

export function CalculatorMain({ sourceId, initialData, entryPoint = 'CATALOG' }: CalculatorMainProps) {
  const { toast } = useToast();
  
  // Основное состояние
  const [currentStep, setCurrentStep] = useState<FlowStep>('product_type');
  const [selectedEntryPoint] = useState<EntryPoint>(entryPoint);
  const [selectedProductType, setSelectedProductType] = useState<ProductCalculationType | undefined>();
  const [calculation, setCalculation] = useState<CalculationResult | undefined>();
  
  // Метрики UX
  const [metrics, setMetrics] = useState<CalculationMetrics>({
    templateSelectionTime: 0,
    timeToFirstCalculation: 0,
    advancedFieldsOpened: false,
    presetsUsed: [],
    calculationCount: 0,
    validationErrors: 0,
    approvalSubmitted: false,
    convertedToQuote: false,
    convertedToOrder: false,
    sessionDuration: 0,
  });
  
  const [sessionStartTime] = useState(Date.now());

  // Трекинг времени сессии
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        sessionDuration: Math.floor((Date.now() - sessionStartTime) / 1000)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Обработчики навигации
  const handleProductTypeSelect = (type: ProductCalculationType) => {
    setSelectedProductType(type);
    setCurrentStep('calculation');
  };

  const handleCalculationComplete = (result: CalculationResult) => {
    setCalculation(result);
    setCurrentStep('results');
    
    // Обновляем метрики
    const calculationTime = Math.floor((Date.now() - sessionStartTime) / 1000);
    setMetrics(prev => ({
      ...prev,
      timeToFirstCalculation: prev.calculationCount === 0 ? calculationTime : prev.timeToFirstCalculation,
      calculationCount: prev.calculationCount + 1
    }));

    toast({
      title: 'Расчет выполнен',
      description: `Стоимость: ${result.pricing ? formatCurrency(result.pricing.finalPrice) : 'N/A'}`,
    });
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'calculation':
        setCurrentStep('product_type');
        setSelectedProductType(undefined);
        break;
      case 'results':
        setCurrentStep('calculation');
        setCalculation(undefined);
        break;
    }
  };

  // Рендеринг шагов
  const renderStep = () => {
    switch (currentStep) {
      case 'product_type':
        return (
          <ProductTypeSelector
            entryPoint={selectedEntryPoint}
            onSelect={handleProductTypeSelect}
            onBack={handleBack}
          />
        );
      
      case 'calculation':
        switch (selectedProductType) {
          case 'STANDARD':
            return (
              <StandardProductFlow
                entryPoint={selectedEntryPoint}
                productType="STANDARD"
                sourceId={sourceId}
                initialData={initialData}
                onComplete={handleCalculationComplete}
                onBack={handleBack}
                onMetricsUpdate={(update: Partial<CalculationMetrics>) => setMetrics(prev => ({ ...prev, ...update }))}
              />
            );
          
          case 'COMPOSITE':
            return (
              <CompositeProductFlow
                entryPoint={selectedEntryPoint}
                sourceId={sourceId}
                initialData={initialData}
                onComplete={handleCalculationComplete}
                onBack={handleBack}
                onMetricsUpdate={(update: Partial<CalculationMetrics>) => setMetrics(prev => ({ ...prev, ...update }))}
              />
            );
          
          case 'WAREHOUSE':
            return (
              <WarehouseProductFlow
                entryPoint={selectedEntryPoint}
                sourceId={sourceId}
                initialData={initialData}
                onComplete={handleCalculationComplete}
                onBack={handleBack}
                onMetricsUpdate={(update: Partial<CalculationMetrics>) => setMetrics(prev => ({ ...prev, ...update }))}
              />
            );
          
          default:
            return <div>Неизвестный тип товара</div>;
        }
      
      case 'results':
        return (
          <CalculationResults
            calculation={calculation!}
            onEdit={() => setCurrentStep('calculation')}
            onSave={async () => {
              // Реализация сохранения
              toast({ title: 'Расчет сохранен' });
            }}
            onCreateQuote={async () => {
              setMetrics(prev => ({ ...prev, convertedToQuote: true }));
              toast({ title: 'Коммерческое предложение создано' });
            }}
            onCreateOrder={async () => {
              setMetrics(prev => ({ ...prev, convertedToOrder: true }));
              toast({ title: 'Заказ создан' });
            }}
            metrics={metrics}
          />
        );
      
      default:
        return <div>Неизвестный шаг</div>;
    }
  };

  // Прогресс-индикатор
  const getStepNumber = () => {
    switch (currentStep) {
      case 'product_type': return 1;
      case 'calculation': return 2;
      case 'results': return 3;
      default: return 1;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'product_type': return 'Тип товара';
      case 'calculation': return 'Параметры';
      case 'results': return 'Результат';
      default: return '';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок и прогресс */}
        <div className="flex items-center gap-4 mb-6">
          {currentStep !== 'product_type' && (
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 flex-shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="w-full">
            <div className="flex justify-between items-baseline mb-1">
              <h1 className="text-2xl font-bold tracking-tight">Калькулятор стоимости</h1>
              <p className="text-sm text-muted-foreground">
                Шаг {getStepNumber()}: {getStepTitle()}
              </p>
            </div>
            <Progress value={(getStepNumber() / 3) * 100} className="h-2" />
          </div>
        </div>

        {/* Основной контент */}
        <div className="min-h-[550px] bg-white rounded-xl border shadow-sm">
          <div className="p-6 sm:p-8">
            {renderStep()}
          </div>
        </div>

        {/* UX метрики (только в dev режиме) */}
        {process.env.NODE_ENV === 'development' && (
          <Collapsible className="mt-6">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer rounded-lg border bg-white p-3 shadow-sm hover:bg-accent hover:text-accent-foreground">
                <h4 className="text-sm font-semibold">Показать/скрыть UX Метрики (dev)</h4>
                <ChevronsUpDown className="h-4 w-4" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="py-4">
                <div className="text-xs text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
                  <div><span className="font-semibold">Длительность:</span> {Math.floor(metrics.sessionDuration / 60)}:{(metrics.sessionDuration % 60).toString().padStart(2, '0')}</div>
                  <div><span className="font-semibold">Расчетов:</span> {metrics.calculationCount}</div>
                  <div><span className="font-semibold">Время до 1-го расчета:</span> {metrics.timeToFirstCalculation}с</div>
                  <div><span className="font-semibold">Ошибки валидации:</span> {metrics.validationErrors}</div>
                  <div><span className="font-semibold">Расширенные поля:</span> {metrics.advancedFieldsOpened ? 'Да' : 'Нет'}</div>
                  <div><span className="font-semibold">Пресеты:</span> {metrics.presetsUsed.join(', ') || 'Нет'}</div>
                  <div><span className="font-semibold">Конверсия в КП:</span> {metrics.convertedToQuote ? 'Да' : 'Нет'}</div>
                  <div><span className="font-semibold">Конверсия в заказ:</span> {metrics.convertedToOrder ? 'Да' : 'Нет'}</div>
                </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
