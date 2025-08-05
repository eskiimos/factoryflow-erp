'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Package, FolderTree } from 'lucide-react';
import { AdvancedGroupSelector } from '@/components/advanced-group-selector';
import type { ProductGroup, ProductSubgroup, Product } from '@/types/product-groups';

interface MoveProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: Product[];
  groups: ProductGroup[];
  onProductsMoved: () => void;
}

export function MoveProductsModal({
  isOpen,
  onClose,
  selectedProducts,
  groups,
  onProductsMoved
}: MoveProductsModalProps) {
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [isMoving, setIsMoving] = useState(false);
  const { toast } = useToast();

  // Создаем плоский список всех возможных целей (групп и подгрупп)
  const buildTargetList = () => {
    const targets: Array<{
      id: string;
      name: string;
      type: 'group' | 'subgroup';
      level: number;
      productCount: number;
      groupId?: string;
      subgroupId?: string;
    }> = [];

    groups.forEach(group => {
      // Добавляем группу
      targets.push({
        id: `group-${group.id}`,
        name: group.name,
        type: 'group',
        level: 0,
        productCount: group._count?.products || 0,
        groupId: group.id,
        subgroupId: undefined
      });

      // Добавляем подгруппы первого уровня
      if (group.subgroups) {
        group.subgroups.forEach(subgroup => {
          targets.push({
            id: `subgroup-${subgroup.id}`,
            name: subgroup.name,
            type: 'subgroup',
            level: 1,
            productCount: subgroup._count?.products || 0,
            groupId: group.id,
            subgroupId: subgroup.id
          });

          // Добавляем подгруппы второго уровня (если есть)
          if (subgroup.subgroups) {
            subgroup.subgroups.forEach(nestedSubgroup => {
              targets.push({
                id: `subgroup-${nestedSubgroup.id}`,
                name: nestedSubgroup.name,
                type: 'subgroup',
                level: 2,
                productCount: nestedSubgroup._count?.products || 0,
                groupId: group.id,
                subgroupId: nestedSubgroup.id
              });
            });
          }
        });
      }
    });

    return targets;
  };

  const targetList = buildTargetList();

  const handleMoveProducts = async () => {
    if (!selectedTarget) {
      toast({
        title: "Ошибка",
        description: "Выберите место для перемещения",
        variant: "destructive"
      });
      return;
    }

    const target = targetList.find(t => t.id === selectedTarget);
    if (!target) return;

    setIsMoving(true);

    try {
      const response = await fetch('/api/products/bulk-update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: selectedProducts.map(p => p.id),
          groupId: target.groupId,
          subgroupId: target.subgroupId || null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to move products');
      }

      toast({
        title: "Успешно",
        description: `${selectedProducts.length} товаров перемещено в "${target.name}"`
      });

      onProductsMoved();
      onClose();

    } catch (error) {
      console.error('Error moving products:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось переместить товары",
        variant: "destructive"
      });
    } finally {
      setIsMoving(false);
    }
  };

  const handleClose = () => {
    if (!isMoving) {
      setSelectedTarget('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Переместить товары
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Список выбранных товаров */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Выбранные товары ({selectedProducts.length})
            </label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 bg-muted/30">
              {selectedProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-2 py-1">
                  <Package className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{product.name}</span>
                  {product.sku && (
                    <Badge variant="outline" className="text-xs">
                      {product.sku}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Выбор целевого места */}
          <AdvancedGroupSelector
            value={selectedTarget}
            onValueChange={setSelectedTarget}
            placeholder="Выберите группу или подгруппу"
            label="Целевая группа *"
            description="Выберите группу или подгруппу для перемещения товаров"
          />
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isMoving}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleMoveProducts}
            disabled={!selectedTarget || isMoving}
          >
            {isMoving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Перемещение...
              </>
            ) : (
              `Переместить ${selectedProducts.length} товаров`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
