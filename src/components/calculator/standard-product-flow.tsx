'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  CalculationResult, 
  EntryPoint, 
  CalculationTemplate,
  CalculationParameters,
  CalculationMetrics,
  AutoCalculationResult,
  PricingBreakdown,
  CalculationStatus,
  ProductCalculationType,
  ParameterCategory
} from '@/types/calculator';
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Loader2, 
  SlidersHorizontal,
  Zap,
  ArrowLeft,
  ArrowRight,
  Calculator,
  RotateCw
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Импорт компонентов
import { ProductSelector } from '@/components/calculator/product-selector';
import { ParameterInput } from '@/components/calculator/parameter-input';
import { AutoCalculationView } from '@/components/calculator/auto-calculation-view';
import { PricingDetails } from '@/components/calculator/pricing-details';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StandardProductFlowProps {
  entryPoint: EntryPoint;
  productType: ProductCalculationType;
  sourceId?: string;
  initialData?: Partial<CalculationResult>;
  onComplete: (result: CalculationResult) => void;
  onBack: () => void;
  onMetricsUpdate: (update: Partial<CalculationMetrics>) => void;
}

// Add a type for our products for auto-filling
// Удалено: ProductPrototype - больше не используется

// Тип для продукта из API
interface Product {
  id: string;
  name: string;
  description?: string;
  unit: string;
  sellingPrice: number;
  group: {
    id: string;
    name: string;
  } | null;
  subgroup: {
    id: string;
    name: string;
  } | null;
  currentStock: number;
  // Данные для калькулятора (может быть в specifications или отдельно)
  specifications?: any;
  calculationData?: {
    width?: number;
    height?: number;
    thickness?: number;
    material?: string;
    [key: string]: any;
  };
}

type FlowStep = 'product' | 'parameters' | 'results';

// Mock API function for calculation
const calculateAPI = async (template: CalculationTemplate, parameters: CalculationParameters): Promise<{ pricing: PricingBreakdown, autoCalculations: AutoCalculationResult }> => {
    console.log("Performing calculation with:", { template, parameters });
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    const { quantity } = parameters;
    const { calculation_type, width, height, length, waste_percentage } = parameters.basic;
    
    // Рассчитываем основную величину в зависимости от типа расчета
    let calculatedValue = 0;
    let calculationDescription = '';
    let unit = 'м²';
    
    switch (calculation_type) {
      case 'area':
        calculatedValue = (width as number * height as number) / 1000000; // в м²
        calculationDescription = `Площадь: ${width}мм × ${height}мм = ${calculatedValue.toFixed(2)} м²`;
        unit = 'м²';
        break;
      case 'area_with_waste':
        const baseArea = (width as number * height as number) / 1000000;
        const wastePercent = waste_percentage as number || 15;
        calculatedValue = baseArea * (1 + wastePercent / 100);
        calculationDescription = `Площадь с отходами: ${baseArea.toFixed(2)} м² + ${wastePercent}% = ${calculatedValue.toFixed(2)} м²`;
        unit = 'м²';
        break;
      case 'perimeter':
        calculatedValue = 2 * ((width as number + height as number) / 1000); // в м
        calculationDescription = `Периметр: 2 × (${width}мм + ${height}мм) = ${calculatedValue.toFixed(2)} м`;
        unit = 'м';
        break;
      case 'linear_meters':
        calculatedValue = (length as number || width as number) / 1000; // в м
        const usedLength = length || width;
        calculationDescription = `Погонные метры: ${usedLength}мм = ${calculatedValue.toFixed(2)} м`;
        unit = 'п.м';
        break;
      case 'height_quantity':
        calculatedValue = (height as number / 1000) * quantity; // в м × количество
        calculationDescription = `Высота × Количество: ${height}мм × ${quantity} = ${calculatedValue.toFixed(2)} м`;
        unit = 'м';
        break;
      default:
        calculatedValue = 1;
        unit = 'ед';
    }

    // Базовая стоимость зависит от типа расчета и величины
    const unitPrice = 1500; // рублей за единицу (м², м, или м×кол-во)
    const baseCost = calculatedValue * unitPrice;
    const totalCost = baseCost * (calculation_type === 'height_quantity' ? 1 : quantity);
    
    const marginAmount = totalCost * 0.25; // 25% margin
    const priceBeforeDiscount = totalCost + marginAmount;
    const discountAmount = priceBeforeDiscount * 0.05; // 5% discount
    const priceAfterDiscount = priceBeforeDiscount - discountAmount;
    const taxAmount = priceAfterDiscount * 0.20; // 20% VAT
    const finalPrice = priceAfterDiscount + taxAmount;

    return {
        pricing: {
            costItems: [
                { name: 'Основной расчет', amount: totalCost * 0.7, description: calculationDescription },
                { name: 'Трудозатраты', amount: totalCost * 0.2, description: 'Работа основного персонала' },
                { name: 'Накладные расходы', amount: totalCost * 0.1, description: 'Амортизация, аренда и пр.' },
            ],
            totalCost,
            marginPercentage: 25,
            marginAmount,
            discountPercentage: 5,
            discountAmount,
            taxPercentage: 20,
            taxAmount,
            finalPrice,
        },
        autoCalculations: {
            derivedValues: [
                { label: 'Расчетная величина', value: calculatedValue.toFixed(2), unit: unit },
                { label: 'Цена за единицу', value: unitPrice.toFixed(2), unit: 'руб' },
                { label: 'Общее количество', value: quantity.toString(), unit: 'шт' },
            ],
            recommendations: calculatedValue > 10 ? ['Рекомендуется использовать упаковку для транспортировки.'] : [],
            warnings: quantity < (template.rules.minQuantity || 1) ? [`Минимальное количество для заказа: ${template.rules.minQuantity}`] : [],
        }
    };
};


export function StandardProductFlow({
  entryPoint,
  productType,
  sourceId,
  initialData,
  onComplete,
  onBack,
  onMetricsUpdate
}: StandardProductFlowProps) {
  const { toast } = useToast();
  
  const [step, setStep] = useState<FlowStep>('product');
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [template, setTemplate] = useState<CalculationTemplate | undefined>();
  const [parameters, setParameters] = useState<CalculationParameters>({
    basic: {},
    advanced: {},
    quantity: 1
  });
  const [autoCalculations, setAutoCalculations] = useState<AutoCalculationResult | undefined>();
  const [pricing, setPricing] = useState<PricingBreakdown | undefined>();
  const [previewPricing, setPreviewPricing] = useState<PricingBreakdown | undefined>();

  useEffect(() => {
    if (initialData?.templateId) {
      // TODO: Load template and set initial parameters
    }
  }, [initialData]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    
    // Создаем шаблон на основе данных продукта с 3 типами расчета
    const mockTemplate: CalculationTemplate = {
      id: `template_${product.id}`,
      name: `Шаблон для ${product.name}`,
      description: product.description || '',
      industryGroup: 'SHEET_CUTTING',
      productType: 'STANDARD',
      tags: [product.group?.name || 'Товар'],
      rules: {
        vatIncluded: true,
        minQuantity: 1,
        approvalThresholds: { discountPercent: 15, marginPercent: 10 }
      },
      presets: [],
      fields: [
        // Поля для расчета по площади
        { id: 'calculation_type', category: 'basic', label: 'Тип расчета', type: 'select', options: [
          {value: 'area', label: 'По площади (Ширина × Высота)'},
          {value: 'area_with_waste', label: 'По площади с отходами (+ технологические потери)'},
          {value: 'perimeter', label: 'По периметру (2 × (Ширина + Высота))'},
          {value: 'linear_meters', label: 'По погонным метрам (Длина)'},
          {value: 'height_quantity', label: 'По высоте и количеству (Высота × Количество)'}
        ], defaultValue: 'area', validation: { required: true } },
        { id: 'width', category: 'basic', label: 'Ширина', type: 'number', unit: 'мм', defaultValue: product.calculationData?.width || 1000, validation: { required: true, min: 1 } },
        { id: 'height', category: 'basic', label: 'Высота', type: 'number', unit: 'мм', defaultValue: product.calculationData?.height || 500, validation: { required: true, min: 1 } },
        { id: 'length', category: 'basic', label: 'Длина', type: 'number', unit: 'мм', defaultValue: product.calculationData?.length || 1000, validation: { required: false, min: 1 } },
        { id: 'waste_percentage', category: 'basic', label: 'Процент отходов', type: 'number', unit: '%', defaultValue: 15, validation: { required: false, min: 0, max: 50 } },
      ],
      workflow: []
    };
    
    setTemplate(mockTemplate);
    
    const defaultParams: CalculationParameters = {
      basic: {
        calculation_type: 'area',
        width: product.calculationData?.width || 1000,
        height: product.calculationData?.height || 500,
        length: product.calculationData?.length || 1000,
        waste_percentage: 15
      },
      advanced: {},
      quantity: 1
    };
    
    setParameters(defaultParams);
    setStep('parameters');
    onMetricsUpdate({ templateSelectionTime: Date.now() });
  };

  const handleParameterChange = (category: ParameterCategory, id: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [id]: value
      }
    }));
    
    // Автоматически пересчитываем предварительную стоимость при изменении основных параметров
    if (template && (id === 'width' || id === 'height' || id === 'length' || id === 'calculation_type' || id === 'waste_percentage')) {
      updatePreviewCalculation();
    }
  };

  const handleQuantityChange = (quantity: number) => {
    setParameters(prev => ({ ...prev, quantity: quantity > 0 ? quantity : 1 }));
    updatePreviewCalculation();
  };

  // Функция для предварительного расчета
  const updatePreviewCalculation = async () => {
    if (!template || !parameters.basic.calculation_type) {
      return;
    }
    
    const calcType = parameters.basic.calculation_type;
    
    // Проверяем наличие необходимых параметров в зависимости от типа расчета
    if (calcType === 'linear_meters' && !parameters.basic.length && !parameters.basic.width) {
      return;
    }
    if ((calcType === 'area' || calcType === 'area_with_waste' || calcType === 'perimeter' || calcType === 'height_quantity') 
        && (!parameters.basic.width || !parameters.basic.height)) {
      return;
    }
    
    setPreviewLoading(true);
    try {
      const { pricing } = await calculateAPI(template, parameters);
      setPreviewPricing(pricing);
    } catch (error) {
      console.error("Preview calculation failed:", error);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Вызываем предварительный расчет при изменении ключевых параметров
  useEffect(() => {
    if (step === 'parameters' && template && parameters.basic.calculation_type) {
      const timeoutId = setTimeout(() => {
        updatePreviewCalculation();
      }, 500); // Debounce для избежания слишком частых вызовов
      
      return () => clearTimeout(timeoutId);
    }
  }, [parameters.basic.width, parameters.basic.height, parameters.basic.length, parameters.basic.calculation_type, parameters.basic.waste_percentage, parameters.quantity, step, template]);

  const handleCalculate = async () => {
    if (!template) {
        toast({ title: 'Ошибка', description: 'Шаблон не выбран.', variant: 'destructive' });
        return;
    }
    setLoading(true);
    try {
        const { pricing, autoCalculations } = await calculateAPI(template, parameters);
        setPricing(pricing);
        setAutoCalculations(autoCalculations);
        setStep('results');
        toast({ title: 'Расчет выполнен', description: 'Результаты расчета обновлены.' });
    } catch (error) {
        console.error("Calculation failed:", error);
        toast({ title: 'Ошибка расчета', variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  };

  const handleComplete = () => {
    if (!template || !pricing) {
        toast({ title: 'Ошибка', description: 'Невозможно завершить расчет без результатов.', variant: 'destructive' });
        return;
    }
    const result: CalculationResult = {
        id: `calc_${Date.now()}`,
        name: template.name,
        entryPoint,
        sourceId,
        productType,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateId: template.id,
        parameters,
        pricing,
        autoCalculations,
        versions: [],
        metrics: {},
    };
    onComplete(result);
  };

  const basicFields = useMemo(() => template?.fields.filter(f => f.category === 'basic'), [template]);
  const advancedFields = useMemo(() => template?.fields.filter(f => f.category === 'advanced'), [template]);

  const renderContent = () => {
    switch (step) {
      case 'product':
        return (
          <motion.div key="product" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
            <ProductSelector 
              onSelect={handleProductSelect}
              onBack={onBack}
            />
          </motion.div>
        );
      case 'parameters':
        if (!template || !basicFields) return null;
        return (
          <motion.div key="parameters" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
            {/* Основная форма калькулятора */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Шаг 2: Параметры расчета</CardTitle>
                        <CardDescription>Выберите тип расчета и введите размеры для "{selectedProduct?.name}"</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep('product')}>
                      <ArrowLeft className="mr-2 h-4 w-4"/>К выбору товара
                    </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Параметры расчета</h3>
                    <ParameterInput 
                        fields={basicFields}
                        parameters={parameters}
                        onParameterChange={handleParameterChange}
                    />
                </div>

                <Separator />

                <div className="grid sm:grid-cols-2 gap-4 items-end">
                    <div>
                        <Label htmlFor="quantity">Количество</Label>
                        <Input 
                            id="quantity"
                            type="number"
                            value={parameters.quantity}
                            onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                            min={template.rules.minQuantity || 1}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Button onClick={handleCalculate} disabled={loading} className="w-full">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
                            Перейти к результатам
                        </Button>
                    </div>
                </div>
              </CardContent>
            </Card>

            {/* Компактный блок предварительного расчета */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-sm">Предварительный расчет</span>
                  </div>
                  
                  {previewLoading ? (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Рассчитываем...
                    </div>
                  ) : previewPricing ? (
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-muted-foreground">
                        Базовая: <span className="font-medium">{previewPricing.totalCost.toFixed(0)} ₽</span>
                      </div>
                      <div className="text-muted-foreground">
                        +{previewPricing.marginPercentage}%: <span className="font-medium">+{previewPricing.marginAmount.toFixed(0)} ₽</span>
                      </div>
                      <div className="text-primary font-bold">
                        Итого: {previewPricing.finalPrice.toFixed(0)} ₽
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Заполните параметры для расчета
                    </div>
                  )}
                </div>
                
                {previewPricing && (
                  <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    Предварительный расчет • Точная стоимость на следующем шаге
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      case 'results':
        return (
            <motion.div key="results" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Шаг 3: Результаты расчета</CardTitle>
                                <CardDescription>Проверьте итоговую стоимость и детализацию.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <PricingDetails pricing={pricing} />
                            <AutoCalculationView autoCalculations={autoCalculations} />
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <div>
                                <Button variant="outline" onClick={() => setStep('parameters')}>
                                    <ArrowLeft className="mr-2 h-4 w-4"/>
                                    Назад к параметрам
                                </Button>
                                <Button variant="ghost" onClick={handleCalculate} disabled={loading} className="ml-2">
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
                                    Пересчитать
                                </Button>
                            </div>
                            <Button onClick={handleComplete}>
                                Завершить и сохранить
                                <ArrowRight className="ml-2 h-4 w-4"/>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      {renderContent()}
    </AnimatePresence>
  );
}
