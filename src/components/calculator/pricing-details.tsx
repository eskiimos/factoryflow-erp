'use client';

import { PricingBreakdown, Currency } from '@/types/calculator';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { ArrowDown, ArrowUp, Percent, Minus, Plus, Equal } from 'lucide-react';

interface PricingDetailsProps {
  pricing?: PricingBreakdown;
  currency?: Currency;
}

export function PricingDetails({ pricing, currency = 'RUB' }: PricingDetailsProps) {
  if (!pricing) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Детализация цены</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Данные о ценообразовании отсутствуют. Выполните расчет для просмотра деталей.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Детализация цены</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {pricing.costItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="font-medium">{item.name}</div>
                  {item.description && <div className="text-sm text-muted-foreground">{item.description}</div>}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(item.amount, currency)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4 text-blue-500"/>
                    Себестоимость
                </div>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(pricing.totalCost, currency)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-green-500"/>
                    Наценка ({pricing.marginPercentage}%)
                </div>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(pricing.marginAmount, currency)}</TableCell>
            </TableRow>
            {pricing.discountAmount > 0 && (
                <TableRow>
                    <TableCell>
                        <div className="flex items-center gap-2 text-red-600">
                            <Minus className="h-4 w-4"/>
                            Скидка ({pricing.discountPercentage}%)
                        </div>
                    </TableCell>
                    <TableCell className="text-right text-red-600">-{formatCurrency(pricing.discountAmount, currency)}</TableCell>
                </TableRow>
            )}
             <TableRow>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4"/>
                        НДС ({pricing.taxPercentage}%)
                    </div>
                </TableCell>
              <TableCell className="text-right">{formatCurrency(pricing.taxAmount, currency)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-gray-50 p-4 rounded-b-lg mt-4">
        <div className="flex items-center gap-2">
            <Equal className="h-5 w-5"/>
            <span className="text-lg font-bold">Итоговая цена</span>
        </div>
        <span className="text-2xl font-extrabold text-primary">
            {formatCurrency(pricing.finalPrice, currency)}
        </span>
      </CardFooter>
    </Card>
  );
}
