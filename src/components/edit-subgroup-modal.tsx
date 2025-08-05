'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import type { ProductGroup, ProductSubgroup } from '@/types/product-groups';

interface EditSubgroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groups: ProductGroup[];
  subgroup: ProductSubgroup | null;
}

export function EditSubgroupModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  groups, 
  subgroup 
}: EditSubgroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Заполняем форму данными подгруппы при открытии
  useEffect(() => {
    if (subgroup) {
      setName(subgroup.name);
      setDescription(subgroup.description || '');
      setSelectedParentId(subgroup.parentId || '');
      setIsActive(subgroup.isActive);
    }
  }, [subgroup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subgroup) return;

    if (!name.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Название подгруппы обязательно для заполнения',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedParentId) {
      toast({
        title: 'Ошибка',
        description: 'Выберите родительскую группу или подгруппу',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/product-groups/subgroups/${subgroup.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          parentId: selectedParentId,
          isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось обновить подгруппу');
      }

      toast({
        title: 'Успешно',
        description: 'Подгруппа успешно обновлена',
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Ошибка при обновлении подгруппы:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить подгруппу',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  // Получаем список доступных родительских элементов (исключая текущую подгруппу и её потомков)
  const getAvailableParents = () => {
    if (!subgroup) return [];

    const parents: Array<{ id: string; name: string; type: 'group' | 'subgroup'; level: number }> = [];

    groups.forEach(group => {
      // Добавляем группу как возможного родителя
      parents.push({
        id: group.id,
        name: group.name,
        type: 'group',
        level: 0
      });

      // Добавляем подгруппы первого уровня как возможных родителей для под-подгрупп
      if (group.subgroups) {
        group.subgroups.forEach(sub => {
          // Исключаем текущую подгруппу и её потомков
          if (sub.id !== subgroup.id) {
            // Если текущая подгруппа - это подгруппа первого уровня,
            // то мы можем выбрать только группы как родителей
            if (subgroup.parentId && isGroupId(subgroup.parentId)) {
              // Текущая подгруппа уже первого уровня, не можем перемещать в под-подгруппу
              return;
            }
            
            parents.push({
              id: sub.id,
              name: `${group.name} → ${sub.name}`,
              type: 'subgroup',
              level: 1
            });
          }
        });
      }
    });

    return parents;
  };

  // Проверяем, является ли ID идентификатором группы (а не подгруппы)
  const isGroupId = (id: string): boolean => {
    return groups.some(group => group.id === id);
  };

  const availableParents = getAvailableParents();

  if (!subgroup) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Редактировать подгруппу товаров</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parent">Родительская группа/подгруппа *</Label>
            <Select 
              value={selectedParentId} 
              onValueChange={setSelectedParentId}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите родительскую группу или подгруппу" />
              </SelectTrigger>
              <SelectContent>
                {availableParents.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    <div className="flex items-center gap-2">
                      <span className={parent.type === 'group' ? 'font-medium' : 'text-muted-foreground'}>
                        {parent.name}
                      </span>
                      {parent.type === 'subgroup' && (
                        <span className="text-xs bg-muted px-1 rounded">Подгруппа</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Название подгруппы *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название подгруппы"
              disabled={isSubmitting}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите описание подгруппы (необязательно)"
              disabled={isSubmitting}
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={isSubmitting}
              className="rounded border-border"
            />
            <Label htmlFor="isActive">Активная подгруппа</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить изменения
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
