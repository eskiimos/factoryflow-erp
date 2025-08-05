'use client';

import React, { useState } from 'react';
import { Package, GripVertical } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import type { Product } from '@/types/product-groups';
import type { ColumnVisibility } from '@/components/table-controls';

interface DraggableProductRowProps {
  product: Product;
  columnVisibility: ColumnVisibility;
  level: number;
  onProductMoved?: () => void;
  onDragStart?: (productId: string) => void;
  onDragEnd?: () => void;
  isDragActive?: boolean;
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (productId: string, checked: boolean) => void;
}

export function DraggableProductRow({ 
  product, 
  columnVisibility, 
  level,
  onProductMoved,
  onDragStart,
  onDragEnd,
  isDragActive = false,
  selectionMode = false,
  isSelected = false,
  onSelect
}: DraggableProductRowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('application/json', JSON.stringify([product.id]));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(product.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  const paddingClass = level === 0 ? 'pl-12' : level === 1 ? 'pl-16' : level === 2 ? 'pl-24' : 'pl-32';
  const bgClass = level === 0 ? 'bg-muted/30 hover:bg-muted/50' : 'bg-blue-50/30 hover:bg-blue-50/50';
  
  // Более выразительное состояние перетаскивания
  const rowClassName = [
    bgClass,
    'transition-all duration-200',
    isDragging && 'opacity-30 scale-95 shadow-lg border-blue-200',
    isDragActive && !isDragging && 'shadow-sm'
  ].filter(Boolean).join(' ');

  return (
    <TableRow 
      key={`product-${product.id}`} 
      className={rowClassName}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {selectionMode && (
        <TableCell className="w-12">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect?.(product.id, !!checked)}
          />
        </TableCell>
      )}
      {columnVisibility.name && (
        <TableCell className={paddingClass}>
          <div className="flex items-center gap-2">
            <GripVertical className={`h-3 w-3 transition-colors ${
              isDragging 
                ? 'text-blue-500' 
                : isDragActive 
                  ? 'text-muted-foreground cursor-grab hover:text-blue-500' 
                  : 'text-muted-foreground/50 cursor-grab'
            } active:cursor-grabbing`} />
            <Package className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{product.name}</span>
            {product.sku && (
              <span className="text-xs text-muted-foreground bg-muted px-1 rounded">
                {product.sku}
              </span>
            )}
          </div>
        </TableCell>
      )}
      {columnVisibility.description && (
        <TableCell className="text-sm text-muted-foreground">
          {product.description || '-'}
        </TableCell>
      )}
      {columnVisibility.productsCount && (
        <TableCell className="text-center">
          {level === 0 ? (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {product.currentStock || 0} шт
            </Badge>
          ) : (
            product.sellingPrice && (
              <span className="text-xs text-muted-foreground">
                {product.sellingPrice.toLocaleString('ru-RU')} ₽
              </span>
            )
          )}
        </TableCell>
      )}
      {columnVisibility.status && (
        <TableCell className="text-center">
          <Badge 
            variant={product.isActive ? 'default' : 'secondary'}
            className={`text-xs ${product.isActive ? 'bg-green-100 text-green-700' : ''}`}
          >
            {product.isActive ? 'Активен' : 'Неактивен'}
          </Badge>
        </TableCell>
      )}
      {columnVisibility.createdAt && (
        <TableCell className="text-xs text-muted-foreground">
          {new Date(product.createdAt).toLocaleDateString('ru-RU')}
        </TableCell>
      )}
      {columnVisibility.actions && (
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => {
              toast({
                title: "Информация",
                description: "Перетащите товар на другую группу для перемещения",
              });
            }}
          >
            Переместить
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
}
