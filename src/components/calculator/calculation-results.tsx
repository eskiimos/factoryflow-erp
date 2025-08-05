'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CalculationResult, 
  CalculationMetrics,
  NextStep
} from '@/types/calculator';
import { 
  CheckCircle, 
  FileText, 
  ShoppingCart, 
  Save, 
  Edit,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CalculationResultsProps {
  calculation: CalculationResult;
  onEdit: () => void;
  onSave: () => Promise<void>;
  onCreateQuote: () => Promise<void>;
  onCreateOrder: () => Promise<void>;
  metrics: CalculationMetrics;
}

export function CalculationResults({
  calculation,
  onEdit,
  onSave,
  onCreateQuote,
  onCreateOrder,
  metrics
}: CalculationResultsProps) {
  
  const nextSteps: NextStep[] = [
    { action: 'save', label: 'Сохранить расчет', description: 'Сохранить как черновик или итоговую версию', primary: false },
    { action: 'quote', label: 'Сформировать КП', description: 'Создать коммерческое предложение для клиента', primary: true },
    { action: 'order', label: 'Оформить заказ', description: 'Передать расчет в производство', primary: false },
  ];

  const handleAction = (action: NextStep['action']) => {
    switch (action) {
      case 'save':
        onSave();
        break;
      case 'quote':
        onCreateQuote();
        break;
      case 'order':
        onCreateOrder();
        break;
      case 'edit':
        onEdit();
        break;
    }
  };

  const priceBeforeVat = calculation.pricing ? calculation.pricing.finalPrice / (1 + calculation.pricing.taxPercentage / 100) : 0;

  return (
    <div className="space-y-6">
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle className="h-6 w-6" />
            Расчет успешно выполнен!
          </CardTitle>
          <CardDescription className="text-green-800">
            Итоговая стоимость рассчитана. Вы можете сохранить расчет, создать коммерческое предложение или оформить заказ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-900">
            {calculation.pricing ? formatCurrency(calculation.pricing.finalPrice) : 'N/A'}
            <Badge variant="secondary" className="ml-4">
              с НДС
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Цена без НДС: {formatCurrency(priceBeforeVat)}
          </p>
        </CardContent>
      </Card>

      {/* Детализация */}
      {calculation.pricing && (
        <Card>
          <CardHeader>
            <CardTitle>Детализация стоимости</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Себестоимость:</span> <span>{formatCurrency(calculation.pricing.totalCost)}</span></div>
              <div className="flex justify-between"><span>Маржа ({calculation.pricing.marginPercentage}%):</span> <span>{formatCurrency(calculation.pricing.marginAmount)}</span></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Предупреждения и рекомендации */}
      {calculation.autoCalculations?.warnings && calculation.autoCalculations.warnings.length > 0 && (
        <Card className="border-yellow-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Предупреждения
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calculation.autoCalculations.warnings.map((w: string, i: number) => (
              <p key={i} className="text-sm">{w}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Следующие шаги */}
      <Card>
        <CardHeader>
          <CardTitle>Дальнейшие действия</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nextSteps.map(step => (
            <Button
              key={step.action}
              variant={step.primary ? 'default' : 'outline'}
              className="h-auto p-4 text-left"
              onClick={() => handleAction(step.action)}
            >
              <div className="flex flex-col">
                <span className="font-medium">{step.label}</span>
                <span className="text-xs text-muted-foreground">{step.description}</span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button variant="ghost" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Изменить параметры
        </Button>
      </div>
    </div>
  );
}
