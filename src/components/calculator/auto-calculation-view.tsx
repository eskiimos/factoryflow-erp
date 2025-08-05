'use client';

import { AutoCalculationResult } from '@/types/calculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Lightbulb, AlertTriangle } from 'lucide-react';

interface AutoCalculationViewProps {
  autoCalculations?: AutoCalculationResult;
}

export function AutoCalculationView({ autoCalculations }: AutoCalculationViewProps) {
  if (!autoCalculations) {
    return null;
  }

  const hasContent = autoCalculations.derivedValues.length > 0 ||
                     autoCalculations.recommendations.length > 0 ||
                     autoCalculations.warnings.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="text-yellow-500 h-5 w-5" />
          Авто-расчеты и рекомендации
        </CardTitle>
        <CardDescription>
            Система автоматически рассчитала дополнительные параметры и сформировала рекомендации.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {autoCalculations.derivedValues.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-base">Производные значения</h4>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Параметр</TableHead>
                      <TableHead className="text-right">Значение</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {autoCalculations.derivedValues.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.label}</TableCell>
                        <TableCell className="text-right font-medium">{item.value} {item.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {autoCalculations.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-base">Рекомендации</h4>
              <div className="space-y-2">
                {autoCalculations.recommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {autoCalculations.warnings.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-orange-600 flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5" />
                Предупреждения
              </h4>
              <div className="space-y-2">
                {autoCalculations.warnings.map((warn, index) => (
                  <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
                    {warn}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
