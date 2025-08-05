'use client';

import React, { useState, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface DropZoneProps {
  children: ReactNode;
  targetId: string;
  targetType: 'group' | 'subgroup';
  onDrop?: () => void;
  className?: string;
  disabled?: boolean;
}

export function DropZone({ 
  children, 
  targetId, 
  targetType, 
  onDrop, 
  className = "",
  disabled = false 
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (disabled) return;
    
    // Проверяем, что мы действительно покинули элемент, а не перешли к дочернему
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = e.dataTransfer.getData('application/json');
      if (!data) return;
      
      const productIds: string[] = JSON.parse(data);
      
      if (!productIds || productIds.length === 0) {
        return;
      }

      // Определяем groupId и subgroupId для цели
      let targetGroupId: string;
      let targetSubgroupId: string | null = null;

      if (targetType === 'group') {
        targetGroupId = targetId;
      } else {
        // Для подгруппы нужно получить её groupId
        // Это делается через API или передается через props
        targetGroupId = targetId; // Временно, нужно исправить
        targetSubgroupId = targetId;
      }

      // Отправляем запрос на перемещение
      const response = await fetch('/api/products/bulk-update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds,
          groupId: targetGroupId,
          subgroupId: targetSubgroupId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to move products');
      }

      toast({
        title: "Успешно",
        description: `${productIds.length} товаров перемещено`
      });

      // Вызываем callback для обновления данных
      onDrop?.();

    } catch (error) {
      console.error('Error moving products:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось переместить товары",
        variant: "destructive"
      });
    }
  };

  return (
    <div
      className={`${className} ${
        isDragOver && !disabled 
          ? 'bg-blue-100 border-2 border-blue-300 border-dashed' 
          : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} transition-all duration-200`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      {isDragOver && !disabled && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-400 border-dashed rounded pointer-events-none flex items-center justify-center">
          <span className="text-blue-600 font-medium text-sm bg-white px-2 py-1 rounded shadow">
            Отпустите для перемещения
          </span>
        </div>
      )}
    </div>
  );
}
