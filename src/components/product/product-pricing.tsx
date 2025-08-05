'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

interface PricingData {
  materials: { materialId: string; quantity: number }[];
  workTypes: { workTypeId: string; quantity: number }[];
  overhead: number;
  retailPrice: number;
  wholesalePrice?: number;
  targetMargin: number;
}

interface CostBreakdown {
  materialsCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  margin: number;
  marginPercent: number;
}

interface ProductPricingProps {
  data: PricingData;
  onChange: (data: Partial<PricingData>) => void;
}

export function ProductPricing({ data, onChange }: ProductPricingProps) {
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown>({
    materialsCost: 0,
    laborCost: 0,
    overheadCost: 0,
    totalCost: 0,
    margin: 0,
    marginPercent: 0,
  });

  // Расчет себестоимости и маржи
  useEffect(() => {
    const calculateCosts = async () => {
      try {
        const response = await fetch('/api/products/calculate-costs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            materials: data.materials,
            workTypes: data.workTypes,
            overhead: data.overhead,
          }),
        });

        if (response.ok) {
          const costs = await response.json();
          const totalCost = costs.materialsCost + costs.laborCost + costs.overheadCost;
          const margin = data.retailPrice - totalCost;
          const marginPercent = totalCost > 0 ? (margin / totalCost) * 100 : 0;

          setCostBreakdown({
            ...costs,
            totalCost,
            margin,
            marginPercent,
          });
        }
      } catch (error) {
        console.error('Error calculating costs:', error);
      }
    };

    calculateCosts();
  }, [data]);

  const handlePriceChange = (field: 'retailPrice' | 'wholesalePrice' | 'overhead' | 'targetMargin', value: number) => {
    onChange({ [field]: value });
  };

  const calculateRecommendedPrice = () => {
    const { totalCost } = costBreakdown;
    const recommendedPrice = totalCost * (1 + data.targetMargin / 100);
    onChange({ retailPrice: Math.round(recommendedPrice * 100) / 100 });
  };

  return (
    <Card>
      <CardContent className="space-y-6">
        {/* Структура себестоимости */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <Label>Стоимость материалов</Label>
            <div className="text-2xl font-bold">{costBreakdown.materialsCost.toFixed(2)} ₽</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <Label>Стоимость работ</Label>
            <div className="text-2xl font-bold">{costBreakdown.laborCost.toFixed(2)} ₽</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <Label>Накладные расходы</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="0"
                step="1"
                value={data.overhead}
                onChange={(e) => handlePriceChange('overhead', parseFloat(e.target.value) || 0)}
                className="w-24"
              />
              <span>%</span>
            </div>
          </div>
        </div>

        {/* Итоговая себестоимость */}
        <div className="p-4 bg-primary/10 rounded-lg">
          <Label>Себестоимость</Label>
          <div className="text-3xl font-bold">{costBreakdown.totalCost.toFixed(2)} ₽</div>
        </div>

        {/* Ценообразование */}
        <div className="space-y-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <Label htmlFor="targetMargin">Целевая маржа</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="targetMargin"
                  type="number"
                  min="0"
                  step="1"
                  value={data.targetMargin}
                  onChange={(e) => handlePriceChange('targetMargin', parseFloat(e.target.value) || 0)}
                />
                <span>%</span>
              </div>
            </div>
            <Button onClick={calculateRecommendedPrice}>
              <Calculator className="h-4 w-4 mr-2" />
              Рассчитать цену
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="retailPrice">Розничная цена</Label>
              <Input
                id="retailPrice"
                type="number"
                min="0"
                step="0.01"
                value={data.retailPrice}
                onChange={(e) => handlePriceChange('retailPrice', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="wholesalePrice">Оптовая цена</Label>
              <Input
                id="wholesalePrice"
                type="number"
                min="0"
                step="0.01"
                value={data.wholesalePrice}
                onChange={(e) => handlePriceChange('wholesalePrice', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        {/* Показатели маржинальности */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <Label>Маржа (₽)</Label>
            <div className="text-2xl font-bold text-green-600">
              {costBreakdown.margin.toFixed(2)} ₽
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <Label>Маржа (%)</Label>
            <div className="text-2xl font-bold text-green-600">
              {costBreakdown.marginPercent.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
