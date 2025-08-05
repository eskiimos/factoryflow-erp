'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ProductAnalyticsProps {
  data: {
    materials: { materialId: string; quantity: number }[];
    workTypes: { workTypeId: string; quantity: number }[];
    overhead: number;
    retailPrice: number;
    targetMargin: number;
  };
}

interface CostBreakdown {
  materialsCost: number;
  laborCost: number;
  overheadCost: number;
}

interface SimilarProduct {
  name: string;
  price: number;
  margin: number;
}

export function ProductAnalytics({ data }: ProductAnalyticsProps) {
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown>({
    materialsCost: 0,
    laborCost: 0,
    overheadCost: 0,
  });
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);

  useEffect(() => {
    // Получение данных о затратах
    const fetchCostBreakdown = async () => {
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
          setCostBreakdown(costs);
        }
      } catch (error) {
        console.error('Error fetching cost breakdown:', error);
      }
    };

    // Получение похожих товаров
    const fetchSimilarProducts = async () => {
      try {
        const response = await fetch('/api/products/similar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            materials: data.materials,
            workTypes: data.workTypes,
          }),
        });

        if (response.ok) {
          const products = await response.json();
          setSimilarProducts(products);
        }
      } catch (error) {
        console.error('Error fetching similar products:', error);
      }
    };

    fetchCostBreakdown();
    fetchSimilarProducts();
  }, [data]);

  // Данные для круговой диаграммы
  const pieData = [
    { name: 'Материалы', value: costBreakdown.materialsCost },
    { name: 'Работы', value: costBreakdown.laborCost },
    { name: 'Накладные', value: costBreakdown.overheadCost },
  ];

  const COLORS = ['#2563eb', '#16a34a', '#dc2626'];

  return (
    <div className="space-y-6">
      {/* Структура себестоимости */}
      <Card>
        <CardHeader>
          <CardTitle>Структура себестоимости</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value.toFixed(2)} ₽`}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Сравнение с похожими товарами */}
      {similarProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Сравнение с похожими товарами</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Маржа</TableHead>
                  <TableHead>Отклонение цены</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {similarProducts.map((product, index) => {
                  const priceDiff = ((product.price - data.retailPrice) / data.retailPrice) * 100;

                  return (
                    <TableRow key={index}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.price.toFixed(2)} ₽</TableCell>
                      <TableCell>{product.margin.toFixed(1)}%</TableCell>
                      <TableCell className={priceDiff > 0 ? 'text-green-600' : 'text-red-600'}>
                        {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Рекомендации */}
      <Card>
        <CardHeader>
          <CardTitle>Рекомендации</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.targetMargin > 50 && (
              <li className="text-yellow-600">
                • Высокая целевая маржа может негативно повлиять на конкурентоспособность
              </li>
            )}
            {costBreakdown.materialsCost / (costBreakdown.materialsCost + costBreakdown.laborCost + costBreakdown.overheadCost) > 0.7 && (
              <li className="text-yellow-600">
                • Высокая доля материальных затрат. Рекомендуется проверить возможности оптимизации
              </li>
            )}
            {similarProducts.length > 0 && data.retailPrice > Math.max(...similarProducts.map(p => p.price)) * 1.2 && (
              <li className="text-red-600">
                • Цена значительно выше аналогов. Рекомендуется пересмотреть ценообразование
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
