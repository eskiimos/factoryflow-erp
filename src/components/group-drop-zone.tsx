'use client';

import React, { useState, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface GroupDropZoneProps {
  children: ReactNode;
  groupId: string;
  subgroupId?: string;
  onProductsMoved?: () => void;
  className?: string;
  disabled?: boolean;
  groups?: any[]; // Для поиска groupId подгруппы
  isDragActive?: boolean;
}

export function GroupDropZone({ 
  children, 
  groupId, 
  subgroupId,
  onProductsMoved, 
  className = "",
  disabled = false,
  groups = [],
  isDragActive = false
}: GroupDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (disabled) return;
    
    // Проверяем, что мы действительно покинули элемент
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const data = e.dataTransfer.getData('application/json');
      if (!data) return;
      
      const productIds: string[] = JSON.parse(data);
      
      if (!productIds || productIds.length === 0) {
        return;
      }

      // Определяем целевую группу и подгруппу
      let targetGroupId = groupId;
      let targetSubgroupId = subgroupId || null;

      // Если это подгруппа без groupId, найдем её родительскую группу
      if (subgroupId && !groupId) {
        const parentGroup = groups.find(g => 
          g.subgroups?.some((sg: any) => sg.id === subgroupId)
        );
        if (parentGroup) {
          targetGroupId = parentGroup.id;
        }
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

      const targetName = subgroupId 
        ? `подгруппу "${groups.flatMap(g => g.subgroups || []).find((sg: any) => sg.id === subgroupId)?.name || 'Неизвестная'}"`
        : `группу "${groups.find(g => g.id === groupId)?.name || 'Неизвестная'}"`;

      toast({
        title: "Успешно",
        description: `${productIds.length} товаров перемещено в ${targetName}`
      });

      // Вызываем callback для оптимистичного обновления данных
      onProductsMoved?.();

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
      className={`relative ${className} ${
        isDragOver && !disabled 
          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-300 ring-opacity-50' 
          : isDragActive && !disabled
          ? 'bg-blue-50/30 border-blue-200 transition-colors duration-200'
          : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} transition-all duration-150`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      {isDragOver && !disabled && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-400 border-dashed rounded pointer-events-none flex items-center justify-center z-10">
          <span className="text-blue-600 font-medium text-sm bg-blue-50 px-3 py-1 rounded-md shadow-sm border border-blue-200">
            📦 Отпустите для перемещения
          </span>
        </div>
      )}
    </div>
  );
}
