'use client';

import React, { useState, useEffect } from 'react';
import { Move, FolderOpen, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface ProductGroup {
  id: string;
  name: string;
  description?: string | null;
  _count?: {
    products: number;
  };
}

interface MoveToGroupDialogProps {
  onMoveToGroup: (groupId: string) => Promise<void>;
  selectedCount: number;
}

export function MoveToGroupDialog({ onMoveToGroup, selectedCount }: MoveToGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchGroups();
    }
  }, [open]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/product-groups');
      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }
      const data = await response.json();
      setGroups(data.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить группы товаров",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async () => {
    if (!selectedGroupId) {
      toast({
        title: "Внимание",
        description: "Выберите группу назначения",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsMoving(true);
      await onMoveToGroup(selectedGroupId);
      setOpen(false);
      setSelectedGroupId('');
    } catch (error) {
      // Ошибка уже обработана в родительском компоненте
    } finally {
      setIsMoving(false);
    }
  };

  const handleMoveToNoGroup = async () => {
    try {
      setIsMoving(true);
      await onMoveToGroup('');
      setOpen(false);
      setSelectedGroupId('');
    } catch (error) {
      // Ошибка уже обработана в родительском компоненте
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Move className="h-4 w-4" />
          Переместить в группу
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            Переместить товары
          </DialogTitle>
          <DialogDescription>
            Выберите группу для перемещения {selectedCount} выбранных товаров
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Опция "Без группы" */}
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                  <FolderOpen className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium">Без группы</p>
                  <p className="text-sm text-muted-foreground">Убрать товары из всех групп</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMoveToNoGroup}
                disabled={isMoving}
                className="gap-2"
              >
                {isMoving ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                ) : (
                  <Check className="h-3 w-3" />
                )}
                Выбрать
              </Button>
            </div>
          </div>

          {/* Выбор группы */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Или выберите существующую группу:</label>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите группу..." />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{group.name}</span>
                        {group._count && (
                          <Badge variant="secondary" className="ml-2">
                            {group._count.products}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isMoving}>
            Отмена
          </Button>
          <Button onClick={handleMove} disabled={!selectedGroupId || isMoving} className="gap-2">
            {isMoving ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
            ) : (
              <Move className="h-3 w-3" />
            )}
            Переместить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
