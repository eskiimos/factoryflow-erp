'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  CalculationResult, 
  EntryPoint, 
  WarehouseItem,
  CalculationMetrics,
  PricingBreakdown
} from '@/types/calculator';
import { Loader2, Search } from 'lucide-react';

interface WarehouseProductFlowProps {
  entryPoint: EntryPoint;
  sourceId?: string;
  initialData?: Partial<CalculationResult>;
  onComplete: (result: CalculationResult) => void;
  onBack: () => void;
  onMetricsUpdate: (update: Partial<CalculationMetrics>) => void;
}

export function WarehouseProductFlow({
  entryPoint,
  sourceId,
  initialData,
  onComplete,
  onBack,
  onMetricsUpdate
}: WarehouseProductFlowProps) {
  const { toast } = useToast();
  
  // Состояние
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Загрузка товаров со склада
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        // API вызов для получения товаров
        // const response = await fetch(`/api/warehouse?search=${searchTerm}`);
        // const data = await response.json();
        
        // Моковые данные
        const mockItems: WarehouseItem[] = [
          { sku: 'WH-001', name: 'Ручка мебельная', price: 150, unit: 'шт', stock: 100 },
          { sku: 'WH-002', name: 'Петля с доводчиком', price: 250, unit: 'шт', stock: 50 },
          { sku: 'WH-003', name: 'Кромка ПВХ 2мм', price: 50, unit: 'м', stock: 1000 }
        ];
        setWarehouseItems(mockItems.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      } catch (error) {
        console.error('Error fetching warehouse items:', error);
        toast({ title: 'Ошибка загрузки товаров', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm, toast]);

  // Обработчик выбора
  const handleSelect = (item: WarehouseItem) => {
    setSelectedItem(item);
    if (item.packaging?.multiple) {
      setQuantity(item.packaging.multiple);
    } else {
      setQuantity(1);
    }
  };

  // Обработчик завершения
  const handleComplete = () => {
    if (!selectedItem) return;

    // Проверка кратности упаковки
    if (selectedItem.packaging && quantity % selectedItem.packaging.multiple !== 0) {
      toast({
        title: 'Ошибка количества',
        description: `Количество должно быть кратно ${selectedItem.packaging.multiple}`,
        variant: 'destructive'
      });
      return;
    }

    const price = selectedItem.price * quantity;
    const vatAmount = price * 0.2; // Пример НДС 20%

    const pricing: PricingBreakdown = {
      costItems: [
        { name: selectedItem.name, amount: price, description: `Количество: ${quantity}` }
      ],
      totalCost: price,
      marginPercentage: 0,
      marginAmount: 0,
      discountPercentage: 0,
      discountAmount: 0,
      taxPercentage: 20,
      taxAmount: vatAmount,
      finalPrice: price + vatAmount
    };

    const result: CalculationResult = {
      id: `calc_wh_${Date.now()}`,
      name: selectedItem.name,
      templateId: selectedItem.sku,
      productType: 'WAREHOUSE',
      entryPoint,
      sourceId,
      parameters: { basic: { sku: selectedItem.sku }, advanced: {}, quantity },
      pricing,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [],
      metrics: {},
    };
    onComplete(result);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Товар со склада</CardTitle>
          <CardDescription>
            Выберите готовый товар со склада и укажите количество.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Поиск по названию или SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Список товаров */}
          <div className="max-h-60 overflow-y-auto border rounded-lg">
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              warehouseItems.map(item => (
                <div
                  key={item.sku}
                  className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedItem?.sku === item.sku ? 'bg-blue-50' : ''}`}
                  onClick={() => handleSelect(item)}
                >
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    SKU: {item.sku} | Цена: {item.price} ₽/{item.unit} | Остаток: {item.stock}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Выбранный товар и количество */}
          {selectedItem && (
            <div className="p-4 border rounded-lg bg-green-50 space-y-4">
              <h4 className="font-medium">Выбрано: {selectedItem.name}</h4>
              <div>
                <Label htmlFor="quantity">Количество</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min={selectedItem.packaging?.multiple || 1}
                  step={selectedItem.packaging?.multiple || 1}
                />
                {selectedItem.packaging && (
                  <p className="text-xs text-gray-600 mt-1">
                    Кратность упаковки: {selectedItem.packaging.multiple} {selectedItem.packaging.unit}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Действия */}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>Назад</Button>
        <Button onClick={handleComplete} disabled={!selectedItem || quantity <= 0}>
          Добавить в расчет
        </Button>
      </div>
    </div>
  );
}
