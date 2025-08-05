'use client';

import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, MoreHorizontal, FolderOpen, Plus, Search, ChevronRight, ChevronDown, Package, Folder, FolderTree, Loader2, GripVertical, Move, Check, X } from 'lucide-react';
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
import { DeleteGroupModal } from '@/components/delete-group-modal';
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
  
  // Состояние для модального окна удаления группы
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<ProductGroup | null>(null);
  
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

  // Загружаем группы при монтировании компонента
  useEffect(() => {
    if (!externalGroups) {
      fetchGroups();
    } else {
      setGroups(externalGroups);
      setLoading(false);
    }
  }, [externalGroups]);

  // Функция загрузки групп
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/product-groups');
      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }
      const data = await response.json();
      
      // API возвращает { data: [...], success: true }
      const groupsArray = data.data || data;
      
      // Убеждаемся, что получили массив
      const finalData = Array.isArray(groupsArray) ? groupsArray : [];
      setGroups(finalData);
    } catch (error) {
      console.error('❌ Error fetching groups:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить группы товаров",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Функция удаления группы
  const deleteGroup = async (groupId: string, groupName: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    setGroupToDelete(group);
    setDeleteModalOpen(true);
  };

  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return;

    try {
      const response = await fetch(`/api/product-groups/${groupToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to delete group');
      }

      toast({
        title: "Успешно",
        description: data.message || `Группа "${groupToDelete.name}" удалена`,
      });

      // Обновляем список групп
      await fetchGroups();
      onGroupsChange?.();
    } catch (error: any) {
      console.error('❌ Error deleting group:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить группу",
        variant: "destructive"
      });
      throw error; // Пробрасываем ошибку для обработки в модальном окне
    }
  };

  // Функция удаления подгруппы
  const deleteSubgroup = async (subgroupId: string, subgroupName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить подгруппу "${subgroupName}"? Это действие нельзя отменить.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/product-groups/subgroups/${subgroupId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to delete subgroup');
      }

      toast({
        title: "Успешно",
        description: data.message || `Подгруппа "${subgroupName}" удалена`,
      });

      // Обновляем список групп
      await fetchGroups();
      onGroupsChange?.();
    } catch (error: any) {
      console.error('❌ Error deleting subgroup:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить подгруппу",
        variant: "destructive"
      });
    }
  };

  // Функции для работы с разворачиванием групп
  const toggleGroupExpansion = (groupId: string, isSubgroup: boolean = false) => {
    console.log('🔄 Toggle group expansion:', { groupId, isSubgroup });
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      console.log('📤 Collapsing group:', groupId);
      newExpanded.delete(groupId);
    } else {
      console.log('📥 Expanding group:', groupId);
      newExpanded.add(groupId);
      // Загружаем товары при разворачивании группы
      if (!groupProducts[groupId]) {
        console.log('🛒 No products cached, fetching...');
        fetchGroupProducts(groupId, isSubgroup);
      } else {
        console.log('✅ Products already cached:', groupProducts[groupId].length);
      }
    }
    setExpandedGroups(newExpanded);
  };

  // Функция создания подгруппы
  const createSubgroup = async (parentId: string, name: string, level: number = 1, groupId?: string) => {
    try {
      const loadingKey = level === 1 ? parentId : `${parentId}-sub`;
      const currentLoading = level === 1 ? creatingSubgroup : creatingSubSubgroup;
      const setCurrentLoading = level === 1 ? setCreatingSubgroup : setCreatingSubSubgroup;
      
      setCurrentLoading(new Set([...currentLoading, loadingKey]));

      // Готовим данные для API
      let requestData: any = {
        name: name.trim(),
        isActive: true,
      };

      if (level === 1) {
        // Создаем подгруппу первого уровня - parentId это ID основной группы
        requestData.groupId = parentId;
      } else {
        // Создаем подгруппу второго уровня - parentId это ID подгруппы первого уровня
        requestData.groupId = groupId; // ID основной группы
        requestData.parentId = parentId; // ID родительской подгруппы
      }

      // Для подгрупп используем отдельный endpoint
      const response = await fetch('/api/product-groups/subgroups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to create subgroup');
      }

      const result = await response.json();
      
      if (result.success) {
        // Обновляем список групп
        await fetchGroups();
        
        // Автоматически разворачиваем родительскую группу/подгруппу
        if (level === 1) {
          setExpandedGroups(prev => new Set([...prev, parentId]));
        } else {
          setExpandedGroups(prev => new Set([...prev, groupId!, parentId]));
        }
        
        // Очищаем состояние создания
        if (level === 1) {
          setNewSubgroupName(prev => ({ ...prev, [parentId]: '' }));
          setInlineCreateSubgroupMode(prev => ({ ...prev, [parentId]: false }));
        } else {
          setNewSubSubgroupName(prev => ({ ...prev, [parentId]: '' }));
          setInlineCreateSubgroupMode(prev => ({ ...prev, [`${parentId}-sub`]: false }));
        }
        
        toast({
          title: "Успех",
          description: `Подгруппа "${name}" создана успешно`,
        });
      }
    } catch (error) {
      console.error('Error creating subgroup:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать подгруппу",
        variant: "destructive"
      });
    } finally {
      const loadingKey = level === 1 ? parentId : `${parentId}-sub`;
      const currentLoading = level === 1 ? creatingSubgroup : creatingSubSubgroup;
      const setCurrentLoading = level === 1 ? setCreatingSubgroup : setCreatingSubSubgroup;
      
      const newLoading = new Set(currentLoading);
      newLoading.delete(loadingKey);
      setCurrentLoading(newLoading);
    }
  };

  // Функция загрузки товаров группы
  const fetchGroupProducts = async (groupId: string, isSubgroup: boolean = false) => {
    try {
      console.log('🛒 Fetching products for:', { groupId, isSubgroup });
      setLoadingProducts(prev => new Set([...prev, groupId]));
      
      // Определяем правильный параметр для API
      const param = isSubgroup ? 'subgroupId' : 'groupId';
      const url = `/api/products?${param}=${groupId}&showAll=true`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      const products = data.data || data.products || [];
      
      console.log(`✅ Loaded ${products.length} products for group ${groupId}`);
      
      setGroupProducts(prev => ({
        ...prev,
        [groupId]: products
      }));
      
    } catch (error) {
      console.error('❌ Error fetching group products:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить товары группы",
        variant: "destructive"
      });
    } finally {
      setLoadingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  // Базовые функции
  const displayGroups = searchQuery 
    ? (Array.isArray(filteredGroups) ? filteredGroups : [])
    : (Array.isArray(groups) ? groups : []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const groupsArray = Array.isArray(groups) ? groups : [];
      const filtered = groupsArray.filter(group => 
        group.name.toLowerCase().includes(query.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(query.toLowerCase()))
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setFilteredGroups(filtered);
    } else {
      setFilteredGroups([]);
    }
  };

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
      if (Array.isArray(products)) {
        allProducts.push(...products);
      }
    });
    
    if (selectedProducts.size === allProducts.length && allProducts.length > 0) {
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
    } else {
      fetchGroups(); // Перезагружаем группы
    }
  };

  const handleGroupCreated = () => {
    if (onGroupsChange) {
      onGroupsChange();
    } else {
      fetchGroups(); // Перезагружаем группы
    }
  };  // Функция для получения выбранных продуктов
  const getSelectedProducts = (): Product[] => {
    const allProducts: Product[] = [];
    Object.values(groupProducts).forEach(products => {
      if (Array.isArray(products)) {
        allProducts.push(...products);
      }
    });
    return allProducts.filter(product => selectedProducts.has(product.id));
  };

  // Функция рендеринга группы с подгруппами
  const renderGroupRow = (group: any, level: number = 0, rootGroupId?: string) => {
    const hasSubgroups = group.subgroups && group.subgroups.length > 0;
    const isExpanded = expandedGroups.has(group.id);
    const indent = level * 24; // 24px на каждый уровень вложенности
    
    // Определяем ID корневой группы
    const currentRootGroupId = rootGroupId || (level === 0 ? group.id : group.groupId);

    return (
      <Fragment key={group.id}>
        {/* Основная строка группы */}
        <TableRow className="hover:bg-muted/50 transition-colors group">
          {selectionMode && (
            <TableCell className="w-12">
              {/* Пустая ячейка для чекбокса группы */}
            </TableCell>
          )}
          <TableCell className="font-medium">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${indent}px` }}>
              {/* Кнопка разворачивания/сворачивания */}
              {hasSubgroups && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-primary/10"
                  onClick={() => toggleGroupExpansion(group.id, level > 0)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              )}
              {!hasSubgroups && <div className="w-6" />}
              
              <FolderOpen className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-primary">{group.name}</span>
                {level === 0 && (group._count?.subgroups || 0) > 0 && (
                  <span className="text-xs text-slate-500 mt-0.5">
                    Подгрупп: {group._count?.subgroups || 0}
                  </span>
                )}
              </div>
              
              {/* Кнопка создания подгруппы */}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                onClick={() => {
                  const key = level === 0 ? group.id : `${group.id}-sub`;
                  setInlineCreateSubgroupMode(prev => ({ ...prev, [key]: true }));
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
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
                <DropdownMenuItem onClick={() => level === 0 ? onEdit?.(group) : onEditSubgroup?.(group)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => level === 0 ? deleteGroup(group.id, group.name) : deleteSubgroup(group.id, group.name)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>

        {/* Строка создания подгруппы */}
        {inlineCreateSubgroupMode[level === 0 ? group.id : `${group.id}-sub`] && (
          <TableRow className="bg-muted/30">
            {selectionMode && <TableCell className="w-12" />}
            <TableCell colSpan={6}>
              <div className="flex items-center gap-2" style={{ paddingLeft: `${indent + 24}px` }}>
                <Input
                  placeholder="Название подгруппы..."
                  value={level === 0 ? (newSubgroupName[group.id] || '') : (newSubSubgroupName[group.id] || '')}
                  onChange={(e) => {
                    if (level === 0) {
                      setNewSubgroupName(prev => ({ ...prev, [group.id]: e.target.value }));
                    } else {
                      setNewSubSubgroupName(prev => ({ ...prev, [group.id]: e.target.value }));
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const name = level === 0 ? newSubgroupName[group.id] : newSubSubgroupName[group.id];
                      if (name?.trim()) {
                        createSubgroup(group.id, name, level + 1, currentRootGroupId);
                      }
                    }
                    if (e.key === 'Escape') {
                      const key = level === 0 ? group.id : `${group.id}-sub`;
                      setInlineCreateSubgroupMode(prev => ({ ...prev, [key]: false }));
                    }
                  }}
                  className="max-w-xs"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => {
                    const name = level === 0 ? newSubgroupName[group.id] : newSubSubgroupName[group.id];
                    if (name?.trim()) {
                      createSubgroup(group.id, name, level + 1, currentRootGroupId);
                    }
                  }}
                  disabled={
                    level === 0 
                      ? creatingSubgroup.has(group.id) || !newSubgroupName[group.id]?.trim()
                      : creatingSubSubgroup.has(`${group.id}-sub`) || !newSubSubgroupName[group.id]?.trim()
                  }
                >
                  {(level === 0 ? creatingSubgroup.has(group.id) : creatingSubSubgroup.has(`${group.id}-sub`)) ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const key = level === 0 ? group.id : `${group.id}-sub`;
                    setInlineCreateSubgroupMode(prev => ({ ...prev, [key]: false }));
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        )}

        {/* Подгруппы (если развернуто) */}
        {isExpanded && hasSubgroups && (
          group.subgroups.map((subgroup: any) => renderGroupRow(subgroup, level + 1, currentRootGroupId))
        )}

        {/* Товары группы/подгруппы (если развернуто) */}
        {isExpanded && (
          <>
            {loadingProducts.has(group.id) ? (
              <TableRow className="bg-muted/20">
                {selectionMode && <TableCell className="w-12" />}
                <TableCell colSpan={6}>
                  <div className="flex items-center gap-2 py-2" style={{ paddingLeft: `${indent + 24}px` }}>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Загрузка товаров...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : groupProducts[group.id] && groupProducts[group.id].length > 0 ? (
              groupProducts[group.id].map((product: any) => (
                <TableRow key={`product-${product.id}`} className="bg-blue-50/30 hover:bg-blue-50/50 transition-colors">
                  {selectionMode && (
                    <TableCell className="w-12">
                      <Checkbox
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={(checked) => handleProductSelect(product.id, checked as boolean)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${indent + 48}px` }}>
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-700">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {product.description || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      {product.unit || 'шт'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      {product.sellingPrice ? `${product.sellingPrice}₽` : 'Не указана'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(product.createdAt).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/products/edit/${product.id}`, '_blank')}
                      className="h-7 w-7 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : groupProducts[group.id] && groupProducts[group.id].length === 0 ? (
              <TableRow className="bg-muted/10">
                {selectionMode && <TableCell className="w-12" />}
                <TableCell colSpan={6}>
                  <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground" style={{ paddingLeft: `${indent + 24}px` }}>
                    <Package className="h-4 w-4" />
                    <span>Товаров в группе нет</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}
          </>
        )}
      </Fragment>
    );
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
          onSearch={handleSearch}
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
            {displayGroups.map((group) => renderGroupRow(group, 0))}
          </TableBody>
        </Table>
      </div>

      {/* Модальное окно создания группы */}
      <CreateGroupModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onGroupCreated={handleGroupCreated}
      />

      {/* Модальное окно перемещения товаров */}
      <MoveProductsModal
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        selectedProducts={getSelectedProducts()}
        groups={groups}
        onProductsMoved={handleProductsMoved}
      />

      {/* Модальное окно удаления группы */}
      <DeleteGroupModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setGroupToDelete(null);
        }}
        onConfirm={confirmDeleteGroup}
        groupName={groupToDelete?.name || ''}
        productsCount={groupToDelete?._count?.products || 0}
      />
    </div>
  );
}
