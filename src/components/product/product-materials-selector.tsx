'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Material {
  id: string;
  name: string;
  unit: string;
  price: number;
}

interface ProductMaterial {
  materialId: string;
  quantity: number;
}

interface ProductMaterialsSelectorProps {
  materials: ProductMaterial[];
  onChange: (materials: ProductMaterial[]) => void;
}

export function ProductMaterialsSelector({ materials, onChange }: ProductMaterialsSelectorProps) {
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    // Загрузка списка материалов
    const fetchMaterials = async () => {
      try {
        const response = await fetch('/api/material-items?showAll=true');
        if (response.ok) {
          const result = await response.json();
          // API может возвращать объект с полем data или массив напрямую
          const data = result.data || result;
          setAvailableMaterials(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching materials:', error);
        setAvailableMaterials([]);
      }
    };

    fetchMaterials();
  }, []);

  // Пересчет общей стоимости при изменении материалов
  useEffect(() => {
    const cost = materials.reduce((sum, material) => {
      const materialData = availableMaterials.find(m => m.id === material.materialId);
      return sum + (materialData?.price || 0) * material.quantity;
    }, 0);
    setTotalCost(cost);
  }, [materials, availableMaterials]);

  const handleAddMaterial = () => {
    if (availableMaterials.length > 0) {
      onChange([
        ...materials,
        { materialId: availableMaterials[0].id, quantity: 1 }
      ]);
    }
  };

  const handleRemoveMaterial = (index: number) => {
    const newMaterials = [...materials];
    newMaterials.splice(index, 1);
    onChange(newMaterials);
  };

  const handleMaterialChange = (index: number, field: keyof ProductMaterial, value: string | number) => {
    const newMaterials = [...materials];
    newMaterials[index] = {
      ...newMaterials[index],
      [field]: value
    };
    onChange(newMaterials);
  };

  const getMaterialData = (materialId: string) => {
    return availableMaterials.find(m => m.id === materialId);
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Button onClick={handleAddMaterial}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить материал
          </Button>
          <div className="text-right">
            <Label>Общая стоимость материалов</Label>
            <div className="text-2xl font-bold">
              {totalCost.toFixed(2)} ₽
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Материал</TableHead>
              <TableHead>Единица измерения</TableHead>
              <TableHead>Цена за единицу</TableHead>
              <TableHead>Количество</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material, index) => {
              const materialData = getMaterialData(material.materialId);
              const total = (materialData?.price || 0) * material.quantity;

              return (
                <TableRow key={index}>
                  <TableCell>
                    <Select
                      value={material.materialId}
                      onValueChange={(value) => handleMaterialChange(index, 'materialId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите материал" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMaterials.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{materialData?.unit}</TableCell>
                  <TableCell>{materialData?.price.toFixed(2)} ₽</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={material.quantity}
                      onChange={(e) => handleMaterialChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>{total.toFixed(2)} ₽</TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleRemoveMaterial(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {materials.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  Нет выбранных материалов
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
