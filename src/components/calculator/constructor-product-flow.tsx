'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Info, Layers } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalculationResult, CalculationMetrics, EntryPoint } from '@/types/calculator';

interface ConstructorProductFlowProps {
  entryPoint: EntryPoint;
  sourceId?: string;
  initialData?: Partial<CalculationResult>;
  onComplete: (result: CalculationResult) => void;
  onBack: () => void;
  onMetricsUpdate?: (update: Partial<CalculationMetrics>) => void;
}

export function ConstructorProductFlow({
  entryPoint,
  sourceId,
  initialData,
  onComplete,
  onBack,
  onMetricsUpdate
}: ConstructorProductFlowProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  
  // Это базовый компонент, функциональность будет добавлена позже
  const handleComplete = () => {
    setLoading(true);
    
    // Временные данные для тестирования
    const mockResult: CalculationResult = {
      id: 'temp-id',
      name: 'Модульный товар',
      templateId: 'constructor-template',
      productType: 'CONSTRUCTOR',
      entryPoint: entryPoint,
      parameters: {
        basic: {},
        advanced: {},
        quantity: 1
      },
      pricing: {
        costItems: [],
        totalCost: 0,
        marginPercentage: 20,
        marginAmount: 0,
        discountPercentage: 0,
        discountAmount: 0,
        taxPercentage: 20,
        taxAmount: 0,
        finalPrice: 0,
      },
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [],
      metrics: {}
    };
    
    setTimeout(() => {
      setLoading(false);
      onComplete(mockResult);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50">
        <Info className="h-5 w-5" />
        <AlertTitle>Информация</AlertTitle>
        <AlertDescription>
          Конструктор товаров находится в разработке. Скоро здесь появится возможность 
          создавать сложные товары из модульных компонентов.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Информация</TabsTrigger>
          <TabsTrigger value="modules">Модули</TabsTrigger>
          <TabsTrigger value="pricing">Ценообразование</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center p-8 text-center">
                <div>
                  <Layers className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Конструктор товаров</h3>
                  <p className="text-muted-foreground">
                    В этом разделе вы сможете создавать сложные модульные товары из базовых компонентов.
                    <br />Функциональность находится в разработке.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                Модульное конструирование товара будет доступно в ближайшем обновлении.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                Настройка цен для модульных товаров будет доступна в ближайшем обновлении.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Назад
        </Button>
        
        <Button 
          onClick={handleComplete}
          disabled={loading}
          className="ml-auto"
        >
          {loading ? "Загрузка..." : "Продолжить"} {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
