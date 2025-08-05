'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface ProductGroup {
  id: string;
  name: string;
  subgroups?: ProductSubgroup[];
}

interface ProductSubgroup {
  id: string;
  name: string;
  groupId: string;
}

interface ProductBasicInfoProps {
  data: {
    name: string;
    sku: string;
    description: string;
    groupId: string;
    subgroupId: string;
    unit: string;
    isActive: boolean;
  };
  onChange: (data: Partial<ProductBasicInfoProps['data']>) => void;
}

export function ProductBasicInfo({ data, onChange }: ProductBasicInfoProps) {
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [subgroups, setSubgroups] = useState<ProductSubgroup[]>([]);

  useEffect(() => {
    // Загрузка групп товаров
    const fetchProductGroups = async () => {
      try {
        const response = await fetch('/api/product-groups');
        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          setProductGroups(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching product groups:', error);
        setProductGroups([]);
      }
    };

    fetchProductGroups();
  }, []);

  // Загрузка подгрупп при выборе группы
  useEffect(() => {
    if (data.groupId) {
      const fetchSubgroups = async () => {
        try {
          const response = await fetch(`/api/product-subgroups?groupId=${data.groupId}`);
          if (response.ok) {
            const result = await response.json();
            const subgroupsData = result.data || result;
            setSubgroups(Array.isArray(subgroupsData) ? subgroupsData : []);
          }
        } catch (error) {
          console.error('Error fetching subgroups:', error);
          setSubgroups([]);
        }
      };

      fetchSubgroups();
    } else {
      setSubgroups([]);
      if (data.subgroupId) {
        onChange({ subgroupId: '' });
      }
    }
  }, [data.groupId]);

  const handleChange = (field: string, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Название товара *</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Введите название товара"
              required
            />
          </div>

          <div>
            <Label htmlFor="sku">Артикул *</Label>
            <Input
              id="sku"
              value={data.sku}
              onChange={(e) => handleChange('sku', e.target.value)}
              placeholder="Введите артикул"
              required
            />
          </div>

          <div>
            <Label htmlFor="unit">Единица измерения *</Label>
            <Select
              value={data.unit}
              onValueChange={(value) => handleChange('unit', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите единицу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pcs">Штуки</SelectItem>
                <SelectItem value="kg">Килограммы</SelectItem>
                <SelectItem value="m">Метры</SelectItem>
                <SelectItem value="m2">Квадратные метры</SelectItem>
                <SelectItem value="m3">Кубические метры</SelectItem>
                <SelectItem value="l">Литры</SelectItem>
                <SelectItem value="set">Наборы</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="group">Группа товаров</Label>
            <Select
              value={data.groupId}
              onValueChange={(value) => handleChange('groupId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите группу" />
              </SelectTrigger>
              <SelectContent>
                {productGroups && productGroups.length > 0 ? (
                  productGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="no-groups">
                    Группы не найдены
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subgroup">Подгруппа товаров</Label>
            <Select
              value={data.subgroupId}
              onValueChange={(value) => handleChange('subgroupId', value)}
              disabled={!data.groupId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите подгруппу" />
              </SelectTrigger>
              <SelectContent>
                {subgroups && subgroups.length > 0 ? (
                  subgroups.map((subgroup) => (
                    <SelectItem key={subgroup.id} value={subgroup.id}>
                      {subgroup.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="no-subgroups">
                    {data.groupId ? 'Подгруппы не найдены' : 'Сначала выберите группу'}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Введите описание товара"
            rows={4}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={data.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
          />
          <Label htmlFor="isActive">Активный товар</Label>
        </div>
      </CardContent>
    </Card>
  );
}
