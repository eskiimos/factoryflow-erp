'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import type { ProductGroup, ProductSubgroup } from '@/types/product-groups';

interface CreateSubgroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groups: ProductGroup[];
  parentGroup?: ProductGroup;
  parentSubgroup?: ProductSubgroup;
}

export function CreateSubgroupModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  groups, 
  parentGroup,
  parentSubgroup 
}: CreateSubgroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string>(
    parentSubgroup?.id || parentGroup?.id || ''
  );
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Получаем список доступных родительских элементов
  const getAvailableParents = () => {
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
        group.subgroups.forEach(subgroup => {
          parents.push({
            id: subgroup.id,
            name: `${group.name} → ${subgroup.name}`,
            type: 'subgroup',
            level: 1
          });
        });
      }
    });

    return parents;
  };

  const availableParents = getAvailableParents();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      // Определяем groupId и parentId на основе выбранного родителя
      const selectedParent = availableParents.find(p => p.id === selectedParentId);
      let groupId: string;
      let parentId: string | undefined;

      if (selectedParent?.type === 'group') {
        // Создаем подгруппу первого уровня
        groupId = selectedParentId;
        parentId = undefined;
      } else if (selectedParent?.type === 'subgroup') {
        // Создаем под-подгруппу (второй уровень)
        const parentSubgroup = groups
          .flatMap(g => g.subgroups || [])
          .find(sg => sg.id === selectedParentId);
        
        if (!parentSubgroup) {
          throw new Error('Родительская подгруппа не найдена');
        }
        
        groupId = parentSubgroup.groupId;
        parentId = selectedParentId;
      } else {
        throw new Error('Недопустимый родительский элемент');
      }

      const response = await fetch('/api/product-groups/subgroups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          groupId,
          parentId,
          isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось создать подгруппу');
      }

      toast({
        title: 'Успешно',
        description: 'Подгруппа успешно создана',
      });

      // Сброс формы
      setName('');
      setDescription('');
      setSelectedParentId(parentSubgroup?.id || parentGroup?.id || '');
      setIsActive(true);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Ошибка при создании подгруппы:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать подгруппу',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    
    // Сброс формы при закрытии
    setName('');
    setDescription('');
    setSelectedParentId(parentSubgroup?.id || parentGroup?.id || '');
    setIsActive(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Создать подгруппу товаров</DialogTitle>
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
              Создать подгруппу
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
