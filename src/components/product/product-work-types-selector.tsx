'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WorkType {
  id: string;
  name: string;
  unit: string;
  hourlyRate: number;
  standardTime: number;
}

interface ProductWorkType {
  workTypeId: string;
  quantity: number;
}

interface ProductWorkTypesSelectorProps {
  workTypes: ProductWorkType[];
  onChange: (workTypes: ProductWorkType[]) => void;
}

export function ProductWorkTypesSelector({ workTypes, onChange }: ProductWorkTypesSelectorProps) {
  const [availableWorkTypes, setAvailableWorkTypes] = useState<WorkType[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    // Загрузка списка видов работ
    const fetchWorkTypes = async () => {
      try {
        const response = await fetch('/api/work-types?showAll=true');
        if (response.ok) {
          const result = await response.json();
          // API может возвращать объект с полем data или массив напрямую
          const data = result.data || result;
          setAvailableWorkTypes(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching work types:', error);
        setAvailableWorkTypes([]);
      }
    };

    fetchWorkTypes();
  }, []);

  // Пересчет общей стоимости при изменении видов работ
  useEffect(() => {
    const cost = workTypes.reduce((sum, workType) => {
      const workTypeData = availableWorkTypes.find(w => w.id === workType.workTypeId);
      if (workTypeData) {
        return sum + workTypeData.hourlyRate * workTypeData.standardTime * workType.quantity;
      }
      return sum;
    }, 0);
    setTotalCost(cost);
  }, [workTypes, availableWorkTypes]);

  const handleAddWorkType = () => {
    if (availableWorkTypes.length > 0) {
      onChange([
        ...workTypes,
        { workTypeId: availableWorkTypes[0].id, quantity: 1 }
      ]);
    }
  };

  const handleRemoveWorkType = (index: number) => {
    const newWorkTypes = [...workTypes];
    newWorkTypes.splice(index, 1);
    onChange(newWorkTypes);
  };

  const handleWorkTypeChange = (index: number, field: keyof ProductWorkType, value: string | number) => {
    const newWorkTypes = [...workTypes];
    newWorkTypes[index] = {
      ...newWorkTypes[index],
      [field]: value
    };
    onChange(newWorkTypes);
  };

  const getWorkTypeData = (workTypeId: string) => {
    return availableWorkTypes.find(w => w.id === workTypeId);
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Button onClick={handleAddWorkType}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить вид работы
          </Button>
          <div className="text-right">
            <Label>Общая стоимость работ</Label>
            <div className="text-2xl font-bold">
              {totalCost.toFixed(2)} ₽
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Вид работы</TableHead>
              <TableHead>Единица измерения</TableHead>
              <TableHead>Норма времени (ч)</TableHead>
              <TableHead>Тариф (₽/ч)</TableHead>
              <TableHead>Количество</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workTypes.map((workType, index) => {
              const workTypeData = getWorkTypeData(workType.workTypeId);
              const total = workTypeData 
                ? workTypeData.hourlyRate * workTypeData.standardTime * workType.quantity 
                : 0;

              return (
                <TableRow key={index}>
                  <TableCell>
                    <Select
                      value={workType.workTypeId}
                      onValueChange={(value) => handleWorkTypeChange(index, 'workTypeId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите вид работы" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableWorkTypes.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{workTypeData?.unit}</TableCell>
                  <TableCell>{workTypeData?.standardTime}</TableCell>
                  <TableCell>{workTypeData?.hourlyRate}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={workType.quantity}
                      onChange={(e) => handleWorkTypeChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>{total.toFixed(2)} ₽</TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleRemoveWorkType(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {workTypes.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  Нет выбранных видов работ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
