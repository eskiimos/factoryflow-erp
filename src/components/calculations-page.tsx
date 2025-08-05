'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProductType } from '@prisma/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  Calculation, 
  TemplateType, 
  IndustryGroup, 
  CalculationParameters,
  PricingDetails,
  CalculationStatus 
} from '@/types/calculator';
import { Calculator, Clock, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

// Интерфейс для состояния формы
interface CalculationFormState {
  step: number;
  templateId?: string;
  industryGroup?: IndustryGroup;
  parameters: CalculationParameters;
  pricing: Partial<PricingDetails>;
  status: CalculationStatus;
  showAdvanced: boolean;
  calculation?: Calculation;
}

// Получение названий отраслевых групп
const getIndustryGroupName = (group: IndustryGroup): string => {
  switch (group) {
    case 'SHEET_CUTTING':
      return 'Листовой раскрой';
    case 'PARAMETRIC':
      return 'Параметрический';
    case 'RECIPE':
      return 'Рецептура';
    case 'ADVERTISING':
      return 'РПК';
    case 'CLOTHING':
      return 'Одежда';
    default:
      return 'Неизвестная группа';
  }
};

export function CalculationsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<CalculationFormState>({
    step: 1,
    parameters: {
      dimensions: {},
      quantity: 1
    },
    pricing: {},
    status: 'DRAFT',
    showAdvanced: false
  });
  
  const [templates, setTemplates] = useState<TemplateType[]>([]);
  const [industryGroups, setIndustryGroups] = useState<IndustryGroup[]>([]);

  // Загрузка шаблонов при монтировании
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // Пока используем моковые данные
        const mockTemplates: TemplateType[] = [
          {
            id: '1',
            name: 'Листовой металл',
            industryGroup: 'SHEET_CUTTING',
            productType: 'STANDARD',
            rules: { minArea: 0.1, minPrice: 500 },
            presets: []
          },
          {
            id: '2',
            name: 'Параметрическая мебель',
            industryGroup: 'PARAMETRIC',
            productType: 'ASSEMBLY',
            rules: { minPrice: 1000 },
            presets: []
          },
          {
            id: '3',
            name: 'Наружная реклама',
            industryGroup: 'ADVERTISING',
            productType: 'STANDARD',
            rules: { minArea: 1, minPrice: 2000 },
            presets: []
          }
        ];
        
        setTemplates(mockTemplates);
        
        // Получаем уникальные отраслевые группы
        const groups = Array.from(new Set(mockTemplates.map(t => t.industryGroup)));
        setIndustryGroups(groups);
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить шаблоны',
          variant: 'destructive',
        });
      }
    };

    fetchTemplates();
  }, [toast]);

  // Обработчик выбора отраслевой группы
  const handleIndustryGroupChange = (group: IndustryGroup) => {
    setFormState(prev => ({ 
      ...prev, 
      industryGroup: group, 
      templateId: undefined 
    }));
  };

  // Обработчик выбора шаблона
  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormState(prev => ({ 
        ...prev, 
        templateId,
        step: 2
      }));
    }
  };

  // Обработчик изменения размеров
  const handleDimensionChange = (dimension: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormState(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        dimensions: {
          ...prev.parameters.dimensions,
          [dimension]: numValue
        }
      }
    }));

    // Автоматический расчет площади и периметра
    if (dimension === 'width' || dimension === 'height') {
      const width = dimension === 'width' ? numValue : (formState.parameters.dimensions?.width || 0);
      const height = dimension === 'height' ? numValue : (formState.parameters.dimensions?.height || 0);
      
      setFormState(prev => ({
        ...prev,
        parameters: {
          ...prev.parameters,
          dimensions: {
            ...prev.parameters.dimensions,
            area: width * height / 10000, // в м²
            perimeter: 2 * (width + height) / 100 // в м
          }
        }
      }));
    }
  };

  // Функция расчета стоимости
  const calculatePricing = async () => {
    setLoading(true);
    try {
      // Здесь будет вызов API для расчета
      const mockPricing: PricingDetails = {
        materialsCost: 5000,
        laborCost: 3000,
        overheadCost: 1000,
        totalCost: 9000,
        margin: 20,
        price: 10800,
        priceWithVat: 12960
      };

      setFormState(prev => ({
        ...prev,
        pricing: mockPricing,
        step: 3
      }));

      toast({
        title: 'Расчет выполнен',
        description: 'Стоимость успешно рассчитана',
      });
    } catch (error) {
      console.error('Error calculating pricing:', error);
      toast({
        title: 'Ошибка расчета',
        description: 'Не удалось рассчитать стоимость',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Получение текущего шаблона
  const currentTemplate = templates.find(t => t.id === formState.templateId);

  // Рендеринг полей размеров в зависимости от отраслевой группы
  const renderDimensionFields = () => {
    if (!formState.industryGroup) return null;

    switch (formState.industryGroup) {
      case 'SHEET_CUTTING':
      case 'ADVERTISING':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ширина (мм)</Label>
                <Input
                  type="number"
                  value={formState.parameters.dimensions?.width || ''}
                  onChange={(e) => handleDimensionChange('width', e.target.value)}
                  placeholder="1000"
                />
              </div>
              <div>
                <Label>Высота (мм)</Label>
                <Input
                  type="number"
                  value={formState.parameters.dimensions?.height || ''}
                  onChange={(e) => handleDimensionChange('height', e.target.value)}
                  placeholder="1000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Площадь (м²)</Label>
                <Input
                  type="number"
                  value={formState.parameters.dimensions?.area?.toFixed(3) || ''}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Периметр (м)</Label>
                <Input
                  type="number"
                  value={formState.parameters.dimensions?.perimeter?.toFixed(2) || ''}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>
        );
      
      case 'PARAMETRIC':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Ширина (мм)</Label>
                <Input
                  type="number"
                  value={formState.parameters.dimensions?.width || ''}
                  onChange={(e) => handleDimensionChange('width', e.target.value)}
                />
              </div>
              <div>
                <Label>Высота (мм)</Label>
                <Input
                  type="number"
                  value={formState.parameters.dimensions?.height || ''}
                  onChange={(e) => handleDimensionChange('height', e.target.value)}
                />
              </div>
              <div>
                <Label>Глубина (мм)</Label>
                <Input
                  type="number"
                  value={formState.parameters.dimensions?.depth || ''}
                  onChange={(e) => handleDimensionChange('depth', e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Расчет стоимости</h1>
        <Badge variant="outline">Шаг {formState.step} из 3</Badge>
      </div>

      <Tabs value={`step-${formState.step}`} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="step-1" disabled={formState.step < 1}>
            1. Выбор шаблона
          </TabsTrigger>
          <TabsTrigger value="step-2" disabled={formState.step < 2}>
            2. Параметры
          </TabsTrigger>
          <TabsTrigger value="step-3" disabled={formState.step < 3}>
            3. Расчет
          </TabsTrigger>
        </TabsList>

        {/* Шаг 1: Выбор шаблона */}
        <TabsContent value="step-1" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Выберите тип расчета</CardTitle>
              <CardDescription>
                Выберите отраслевую группу и шаблон для расчета стоимости
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Выбор отраслевой группы */}
              <div>
                <Label>Отраслевая группа</Label>
                <Select
                  value={formState.industryGroup}
                  onValueChange={(value: IndustryGroup) => handleIndustryGroupChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите отраслевую группу" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {getIndustryGroupName(group)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Выбор шаблона */}
              {formState.industryGroup && (
                <div>
                  <Label>Шаблон расчета</Label>
                  <Select
                    value={formState.templateId}
                    onValueChange={handleTemplateChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите шаблон" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates
                        .filter(t => t.industryGroup === formState.industryGroup)
                        .map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Информация о шаблоне */}
              {currentTemplate && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium">{currentTemplate.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Тип: {getIndustryGroupName(currentTemplate.industryGroup)}
                    </p>
                    {currentTemplate.rules.minArea && (
                      <div className="text-xs text-gray-500">
                        Минимальная площадь: {currentTemplate.rules.minArea} м²
                      </div>
                    )}
                    {currentTemplate.rules.minPrice && (
                      <div className="text-xs text-gray-500">
                        Минимальная стоимость: {currentTemplate.rules.minPrice.toLocaleString('ru-RU')} ₽
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Шаг 2: Параметры */}
        <TabsContent value="step-2" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Параметры расчета</CardTitle>
              <CardDescription>
                Укажите размеры и количество для расчета стоимости
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Размеры */}
              <div>
                <Label className="text-base font-medium">Размеры</Label>
                {renderDimensionFields()}
              </div>

              <Separator />

              {/* Количество */}
              <div>
                <Label>Количество</Label>
                <Input
                  type="number"
                  min="1"
                  value={formState.parameters.quantity}
                  onChange={(e) => setFormState(prev => ({
                    ...prev,
                    parameters: {
                      ...prev.parameters,
                      quantity: parseInt(e.target.value) || 1
                    }
                  }))}
                />
              </div>

              {/* Расширенные параметры */}
              <div>
                <Button
                  variant="outline"
                  onClick={() => setFormState(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }))}
                >
                  {formState.showAdvanced ? 'Скрыть' : 'Показать'} расширенные параметры
                </Button>
              </div>

              {formState.showAdvanced && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <Label>Размер партии</Label>
                      <Input
                        type="number"
                        value={formState.parameters.batchSize || ''}
                        onChange={(e) => setFormState(prev => ({
                          ...prev,
                          parameters: {
                            ...prev.parameters,
                            batchSize: parseInt(e.target.value) || undefined
                          }
                        }))}
                        placeholder="Оставьте пустым для авто"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setFormState(prev => ({ ...prev, step: 1 }))}
                >
                  Назад
                </Button>
                <Button
                  onClick={calculatePricing}
                  disabled={loading || !formState.parameters.quantity}
                >
                  {loading ? 'Расчет...' : 'Рассчитать стоимость'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Шаг 3: Результат расчета */}
        <TabsContent value="step-3" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Детализация стоимости */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Детализация стоимости
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Материалы:</span>
                    <span>{formState.pricing.materialsCost?.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Работы:</span>
                    <span>{formState.pricing.laborCost?.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Накладные:</span>
                    <span>{formState.pricing.overheadCost?.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Себестоимость:</span>
                    <span>{formState.pricing.totalCost?.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Маржа ({formState.pricing.margin}%):</span>
                    <span>{((formState.pricing.price || 0) - (formState.pricing.totalCost || 0)).toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Цена без НДС:</span>
                    <span>{formState.pricing.price?.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-blue-600">
                    <span>Цена с НДС:</span>
                    <span>{formState.pricing.priceWithVat?.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Дополнительная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Дополнительная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Расчет выполнен на основе текущих справочных данных.
                    Итоговая стоимость может быть скорректирована при оформлении заказа.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2 text-sm">
                  <div>Шаблон: {currentTemplate?.name}</div>
                  <div>Количество: {formState.parameters.quantity} шт.</div>
                  {formState.parameters.dimensions?.area && (
                    <div>Общая площадь: {(formState.parameters.dimensions.area * formState.parameters.quantity).toFixed(3)} м²</div>
                  )}
                  <div>Дата расчета: {new Date().toLocaleDateString('ru-RU')}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Действия */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setFormState(prev => ({ ...prev, step: 2 }))}
                >
                  Изменить параметры
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline">
                    Сохранить расчет
                  </Button>
                  <Button variant="outline">
                    Создать КП
                  </Button>
                  <Button>
                    Оформить заказ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
