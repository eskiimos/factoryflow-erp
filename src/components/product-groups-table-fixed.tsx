'use client';

import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, MoreHorizontal, FolderOpen, Plus, Search, ChevronRight, ChevronDown, Package, Folder, FolderTree, Loader2, GripVertical, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { TableControls, ColumnVisibility } from '@/components/table-controls';
import { TableSearch } from '@/components/table-search';
import { CreateGroupModal } from '@/components/create-group-modal';
import { GroupDropZone } from '@/components/group-drop-zone';
import { DraggableProductRow } from '@/components/draggable-product-row';
import { MoveProductsModal } from '@/components/move-products-modal';
import type { ProductGroup, ProductSubgroup, Product } from '@/types/product-groups';

interface ProductGroupsTableProps {
  groups?: ProductGroup[];
  onGroupsChange?: () => void;
  onEdit?: (group: ProductGroup) => void;
  onCreateSubgroup?: (data: { group?: ProductGroup; subgroup?: ProductSubgroup }) => void;
  onEditSubgroup?: (subgroup: ProductSubgroup) => void;
}

const TABLE_COLUMNS = [
  { key: 'name', label: 'Название', required: true },
  { key: 'description', label: 'Описание', required: false },
  { key: 'productsCount', label: 'Товаров', required: true },
  { key: 'status', label: 'Статус', required: false },
  { key: 'createdAt', label: 'Создана', required: false },
  { key: 'actions', label: 'Действия', required: true },
];

export function ProductGroupsTable({
  groups: externalGroups,
  onGroupsChange,
  onEdit,
  onCreateSubgroup,
  onEditSubgroup,
}: ProductGroupsTableProps) {
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(!externalGroups);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGroups, setFilteredGroups] = useState<ProductGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedSubgroups, setExpandedSubgroups] = useState<Set<string>>(new Set());
  const [groupProducts, setGroupProducts] = useState<Record<string, Product[]>>({});
  const [loadingProducts, setLoadingProducts] = useState<Set<string>>(new Set());
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inlineCreateMode, setInlineCreateMode] = useState<Record<string, boolean>>({});
  const [inlineCreateSubgroupMode, setInlineCreateSubgroupMode] = useState<Record<string, boolean>>({});
  const [newSubgroupName, setNewSubgroupName] = useState<Record<string, string>>({});
  const [newSubSubgroupName, setNewSubSubgroupName] = useState<Record<string, string>>({});
  const [creatingSubgroup, setCreatingSubgroup] = useState<Set<string>>(new Set());
  const [creatingSubSubgroup, setCreatingSubSubgroup] = useState<Set<string>>(new Set());
  
  // Состояние для drag-and-drop
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Состояние для чекбоксов и массового перемещения
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(() => {
    // По умолчанию все столбцы видимы
    const defaultVisibility: ColumnVisibility = {};
    TABLE_COLUMNS.forEach(column => {
      defaultVisibility[column.key] = true;
    });
    return defaultVisibility;
  });
  const router = useRouter();
  const { toast } = useToast();

  // Базовые функции
  const displayGroups = searchQuery ? filteredGroups : groups;

  const handleProductSelect = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    // Собираем все товары из всех загруженных групп
    const allProducts: Product[] = [];
    Object.values(groupProducts).forEach(products => {
      allProducts.push(...products);
    });
    
    if (selectedProducts.size === allProducts.length) {
      setSelectedProducts(new Set());
    } else {
      const allIds = new Set(allProducts.map(product => product.id));
      setSelectedProducts(allIds);
    }
  };

  const handleMoveProducts = () => {
    if (selectedProducts.size === 0) {
      toast({
        title: "Внимание", 
        description: "Выберите товары для перемещения",
        variant: "destructive"
      });
      return;
    }
    setMoveModalOpen(true);
  };

  const handleProductsMoved = () => {
    // Сбрасываем выделение
    setSelectedProducts(new Set());
    setSelectionMode(false);
    
    // Обновляем данные
    if (onGroupsChange) {
      onGroupsChange();
    }
  };

  // Функция для получения выбранных продуктов
  const getSelectedProducts = (): Product[] => {
    const allProducts: Product[] = [];
    Object.values(groupProducts).forEach(products => {
      allProducts.push(...products);
    });
    return allProducts.filter(product => selectedProducts.has(product.id));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Загрузка групп...</p>
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center p-8 text-center">
        <FolderOpen className="h-16 w-16 mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold mb-2">Нет групп товаров</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          Создайте группы для организации товаров по категориям
        </p>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Создать группу
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar with search and controls */}
      <div className="flex-shrink-0 p-4 border-b border-border/10 space-y-4">
        {/* Search */}
        <TableSearch
          placeholder="Поиск по названию или описанию группы..."
          onSearch={() => {}}
          className="w-full"
        />
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Найдено: <span className="font-medium">{displayGroups.length}</span> групп
            </div>
            
            {selectionMode && selectedProducts.size > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedProducts.size} выбрано</Badge>
                <Button 
                  size="sm" 
                  onClick={handleMoveProducts}
                  className="h-8"
                >
                  <Move className="h-4 w-4 mr-2" />
                  Переместить
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={selectionMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectionMode(!selectionMode);
                if (selectionMode) {
                  setSelectedProducts(new Set());
                }
              }}
            >
              {selectionMode ? 'Отмена' : 'Выбрать'}
            </Button>
            
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Создать группу
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow className="border-b">
              {selectionMode && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProducts.size > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead className="font-semibold">Название</TableHead>
              <TableHead className="font-semibold">Описание</TableHead>
              <TableHead className="font-semibold text-center">Товаров</TableHead>
              <TableHead className="font-semibold text-center">Статус</TableHead>
              <TableHead className="font-semibold">Создана</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayGroups.map((group) => (
              <Fragment key={group.id}>
                <TableRow className="hover:bg-muted/50 transition-colors group">
                  {selectionMode && (
                    <TableCell className="w-12">
                      {/* Пустая ячейка для чекбокса группы */}
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-primary" />
                      <span className="text-primary">{group.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {group.description || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {group._count?.products || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={group.isActive ? 'default' : 'secondary'}
                      className={group.isActive ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                    >
                      {group.isActive ? 'Активна' : 'Неактивна'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(group.createdAt).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(group)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Модальное окно создания группы */}
      <CreateGroupModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onGroupCreated={() => {}}
      />

      {/* Модальное окно перемещения товаров */}
      <MoveProductsModal
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        selectedProducts={getSelectedProducts()}
        groups={groups}
        onProductsMoved={handleProductsMoved}
      />
    </div>
  );
}
