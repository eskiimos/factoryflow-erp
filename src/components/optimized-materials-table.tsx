"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VariableSizeList as List } from 'react-window';
import { MaterialItemWithCategory, getInventoryStatus, formatQuantity } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Copy } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/context/language-context";
import { TableColumn } from "./table-column-settings";

interface OptimizedTableProps {
  materials: MaterialItemWithCategory[];
  onEdit: (material: MaterialItemWithCategory) => void;
  onDelete: (id: string) => void;
  onCopy?: (material: MaterialItemWithCategory) => void;
  searchTerm: string;
  height?: number;
  columns: TableColumn[];
  selectedItems?: string[];
  onSelectionChange?: (selectedItems: string[]) => void;
}

export function OptimizedMaterialsTable({ 
  materials, 
  onEdit, 
  onDelete, 
  onCopy,
  searchTerm,
  height = 400,
  columns,
  selectedItems = [],
  onSelectionChange
}: OptimizedTableProps) {
  const { t } = useLanguage();
  const [windowWidth, setWindowWidth] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Кэш для высот строк
  const rowHeights = useRef<{[key: number]: number}>({});
  
  // Получаем только видимые столбцы, отсортированные по порядку
  const visibleColumns = columns
    .filter(col => col.visible)
    .sort((a, b) => a.order - b.order);

  // Логика массового выбора
  const handleSelectAll = useCallback((checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange(materials.map(m => m.id));
      } else {
        onSelectionChange([]);
      }
    }
  }, [materials, onSelectionChange]);

  const handleSelectItem = useCallback((itemId: string, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedItems, itemId]);
      } else {
        onSelectionChange(selectedItems.filter(id => id !== itemId));
      }
    }
  }, [selectedItems, onSelectionChange]);

  const isAllSelected = materials.length > 0 && selectedItems.length === materials.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < materials.length;
  
  // Вспомогательная функция для расчета высоты текста
  const calculateTextHeight = useCallback((text: string, maxWidth: number = 380): number => {
    // Простой алгоритм на основе длины и переносов
    const avgCharWidth = 8.5; // Средняя ширина символа для шрифта 14px
    const lineHeight = 20; // Высота строки
    const padding = 16; // Верхний и нижний padding
    
    const charsPerLine = Math.floor(maxWidth / avgCharWidth);
    const lines = Math.ceil(text.length / charsPerLine);
    
    // Учитываем переносы по словам
    const words = text.split(' ');
    let actualLines = 1;
    let currentLineLength = 0;
    
    for (const word of words) {
      if (currentLineLength + word.length + 1 > charsPerLine) {
        actualLines++;
        currentLineLength = word.length;
      } else {
        currentLineLength += word.length + 1;
      }
    }
    
    return Math.max(52, padding + (actualLines * lineHeight) + padding);
  }, []);
  
  // Функция для получения значения ячейки по ID столбца
  const getCellValue = (material: MaterialItemWithCategory, columnId: string) => {
    switch (columnId) {
      case 'name':
        return material.name;
      case 'unit':
        return material.unit;
      case 'price':
        return formatCurrency(material.price, material.currency);
      case 'category':
        return material.category?.name || "—";
      case 'status':
        return material.isActive ? "Активный" : "Неактивный";
      case 'created':
        return formatDate(new Date(material.createdAt));
      case 'actions':
        return null; // Специальная обработка для действий
      default:
        return "";
    }
  };
  
  // Функция для рендера содержимого ячейки
  const renderCellContent = (material: MaterialItemWithCategory, columnId: string) => {
    switch (columnId) {
      case 'name':
        return (
          <div 
            className="w-full"
            style={{
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto',
              lineHeight: '1.4',
              maxWidth: '384px', // 400px - padding
              padding: '4px 0'
            }}
          >
            <span 
              className="font-medium text-gray-900"
              title={material.name}
            >
              {material.name}
            </span>
          </div>
        );
      case 'unit':
        return <span>{material.unit}</span>;
      case 'price':
        return <span>{formatCurrency(material.price, material.currency)}</span>;
      case 'category':
        return (
          <Badge variant="outline" className="font-normal">
            {material.category?.name || "—"}
          </Badge>
        );
      case 'currentStock':
        return (
          <span className="font-medium">
            {formatQuantity(material.currentStock || 0, material.unit)}
          </span>
        );
      case 'stockStatus':
        const inventoryInfo = getInventoryStatus(material);
        return (
          <div className="flex items-center gap-2">
            <div 
              className={`w-3 h-3 rounded-full ${inventoryInfo.statusColor}`}
              title={`${inventoryInfo.statusText} (${inventoryInfo.percentage.toFixed(0)}%)`}
            />
            <span className={`text-sm ${inventoryInfo.needsAttention ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
              {inventoryInfo.statusText}
            </span>
          </div>
        );
      case 'criticalMinimum':
        return (
          <span className="text-sm text-gray-600">
            {formatQuantity(material.criticalMinimum || 0, material.unit)}
          </span>
        );
      case 'satisfactoryLevel':
        return (
          <span className="text-sm text-gray-600">
            {formatQuantity(material.satisfactoryLevel || 0, material.unit)}
          </span>
        );
      case 'status':
        return (
          <Badge 
            variant={material.isActive ? "default" : "secondary"}
            className={material.isActive ? "bg-green-100 text-green-800" : ""}
          >
            {material.isActive ? "Активный" : "Неактивный"}
          </Badge>
        );
      case 'created':
        return (
          <span className="text-sm text-gray-500">
            {formatDate(new Date(material.createdAt))}
          </span>
        );
      case 'actions':
        return (
          <div className="flex items-center gap-2">
            {onCopy && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCopy(material)}
                className="h-8 w-8 hover:text-blue-500"
                title="Копировать"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(material)}
              className="h-8 w-8"
              title="Редактировать"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(material.id)}
              className="h-8 w-8 hover:text-red-500"
              title="Удалить"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };
  
  // Получаем flex-значение для столбца с фиксированными ширинами
  const getColumnFlex = (columnId: string): string => {
    switch (columnId) {
      case 'name': return '0 0 400px'; // Фиксированная ширина 400px для названия
      case 'unit': return '0 0 120px'; // Фиксированная ширина для единиц измерения
      case 'price': return '0 0 140px'; // Фиксированная ширина для цены
      case 'category': return '0 0 180px'; // Фиксированная ширина для категории
      case 'currentStock': return '0 0 130px'; // Фиксированная ширина для остатка
      case 'stockStatus': return '0 0 120px'; // Фиксированная ширина для статуса
      case 'criticalMinimum': return '0 0 130px'; // Фиксированная ширина для критического минимума
      case 'satisfactoryLevel': return '0 0 130px'; // Фиксированная ширина для удовлетворительного уровня
      case 'status': return '0 0 120px'; // Фиксированная ширина для статуса активности
      case 'created': return '0 0 140px'; // Фиксированная ширина для даты создания
      case 'actions': return '0 0 120px'; // Фиксированная ширина для действий
      default: return '0 0 120px'; // Базовая фиксированная ширина
    }
  };
  
  // Функция для определения высоты строки с кэшированием
  const getRowHeight = useCallback((index: number) => {
    // Если высота уже закэширована, возвращаем её
    if (rowHeights.current[index]) {
      return rowHeights.current[index];
    }
    
    const material = materials[index];
    if (!material) return 52;
    
    // Используем более точный расчет высоты текста
    const calculatedHeight = calculateTextHeight(material.name);
    
    // Кэшируем результат
    rowHeights.current[index] = calculatedHeight;
    return calculatedHeight;
  }, [materials, calculateTextHeight]);
  
  // Функция для обновления высоты строки
  const setRowHeight = useCallback((index: number, size: number) => {
    const currentHeight = rowHeights.current[index];
    if (currentHeight !== size) {
      rowHeights.current[index] = size;
      // Сообщаем react-window об изменении
      if (listRef.current) {
        listRef.current.resetAfterIndex(index);
      }
    }
  }, []);

  // Функция для принудительного пересчета всех высот
  const recalculateHeights = useCallback(() => {
    rowHeights.current = {};
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, []);
  
  // Очищаем кэш при изменении материалов
  useEffect(() => {
    rowHeights.current = {};
    // Сбрасываем виртуальный список после очистки кэша
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [materials]);
  
  // Удаляем функцию setRowHeight, так как она больше не нужна
  
  // Реф для доступа к компоненту виртуализации
  const listRef = useRef<List>(null);
  
  // Слушаем изменение размера окна для адаптивности (с debounce)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (tableRef.current) {
          const newWidth = tableRef.current.offsetWidth;
          if (Math.abs(newWidth - windowWidth) > 10) {
            setWindowWidth(newWidth);
            // Пересчитываем высоты при изменении размера
            recalculateHeights();
          }
        }
      }, 100);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const handleVisibilityChange = () => {
      if (!document.hidden && tableRef.current) {
        const currentWidth = tableRef.current.offsetWidth;
        if (currentWidth !== windowWidth) {
          setWindowWidth(currentWidth);
          recalculateHeights();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [windowWidth, recalculateHeights]);
  
  // Рендер элемента списка (строки таблицы) - мемоизированный компонент
  const Row = React.memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const material = materials[index];
    const calculatedHeight = getRowHeight(index);
    const isSelected = selectedItems.includes(material.id);
    
    // Определение стилей строк с подсветкой результатов поиска
    const highlightStyle = searchTerm && 
      material.name.toLowerCase().includes(searchTerm.toLowerCase())
      ? 'bg-blue-50' : '';
    
    return (
      <div
        style={{
          ...style,
          height: `${calculatedHeight}px`,
          minHeight: `${calculatedHeight}px`,
          maxHeight: `${calculatedHeight}px`,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'stretch',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: isSelected ? '#f3f4f6' : (highlightStyle ? '#dbeafe' : 'transparent')
        }}
        className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-gray-100' : ''}`}
      >
        {onSelectionChange && (
          <div
            style={{ 
              flex: '0 0 60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 12px',
              boxSizing: 'border-box',
              borderRight: '1px solid #e2e8f0',
              height: '100%'
            }}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked: boolean) => handleSelectItem(material.id, checked)}
              aria-label={`Выбрать ${material.name}`}
            />
          </div>
        )}
        {visibleColumns.map((column) => (
          <div
            key={column.id}
            style={{ 
              flex: getColumnFlex(column.id),
              display: 'flex',
              alignItems: column.id === 'name' ? 'flex-start' : 'center',
              justifyContent: 'flex-start',
              padding: '8px 12px',
              boxSizing: 'border-box',
              borderRight: '1px solid #e2e8f0',
              height: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              ...(column.id === 'name' && {
                maxWidth: '400px',
                minWidth: '400px',
                width: '400px'
              }),
              ...(column.id === 'unit' && {
                maxWidth: '120px',
                minWidth: '120px',
                width: '120px'
              }),
              ...(column.id === 'price' && {
                maxWidth: '140px',
                minWidth: '140px',
                width: '140px'
              }),
              ...(column.id === 'category' && {
                maxWidth: '180px',
                minWidth: '180px',
                width: '180px'
              }),
              ...(column.id === 'currentStock' && {
                maxWidth: '130px',
                minWidth: '130px',
                width: '130px'
              }),
              ...(column.id === 'actions' && {
                maxWidth: '120px',
                minWidth: '120px',
                width: '120px'
              })
            }}
          >
            {renderCellContent(material, column.id)}
          </div>
        ))}
      </div>
    );
  });
  
  // Заглушка для пустых результатов
  if (materials.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow style={{ display: 'flex' }}>
              {onSelectionChange && (
                <TableHead 
                  style={{ 
                    flex: '0 0 60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '48px',
                    padding: '12px'
                  }}
                  className="font-medium text-gray-700"
                >
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => {}}
                    disabled
                    aria-label="Выбрать все"
                  />
                </TableHead>
              )}
              {visibleColumns.map((column) => (
                <TableHead 
                  key={column.id}
                  style={{ 
                    flex: getColumnFlex(column.id),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    height: '48px',
                    padding: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    ...(column.id === 'name' && {
                      maxWidth: '400px',
                      minWidth: '400px',
                      width: '400px'
                    }),
                    ...(column.id === 'unit' && {
                      maxWidth: '120px',
                      minWidth: '120px',
                      width: '120px'
                    }),
                    ...(column.id === 'price' && {
                      maxWidth: '140px',
                      minWidth: '140px',
                      width: '140px'
                    }),
                    ...(column.id === 'category' && {
                      maxWidth: '180px',
                      minWidth: '180px',
                      width: '180px'
                    }),
                    ...(column.id === 'currentStock' && {
                      maxWidth: '130px',
                      minWidth: '130px',
                      width: '130px'
                    }),
                    ...(column.id === 'actions' && {
                      maxWidth: '120px',
                      minWidth: '120px',
                      width: '120px'
                    })
                  }}
                  className="font-medium text-gray-700"
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={visibleColumns.length} className="text-center py-8 text-gray-500">
                {searchTerm ? t.materials.search.noItems : t.materials.empty}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border" ref={tableRef}>
      <Table>
        <TableHeader>
          <TableRow style={{ display: 'flex' }}>
            {onSelectionChange && (
              <TableHead 
                style={{ 
                  flex: '0 0 60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '48px',
                  padding: '12px'
                }}
                className="font-medium text-gray-700"
              >
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Выбрать все"
                />
              </TableHead>
            )}
            {visibleColumns.map((column, index) => (
              <TableHead 
                key={column.id}
                style={{ 
                  flex: getColumnFlex(column.id),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  height: '48px',
                  padding: '12px',
                  transition: 'all 0.2s ease-in-out',
                  animationDelay: `${index * 50}ms`,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  ...(column.id === 'name' && {
                    maxWidth: '400px',
                    minWidth: '400px',
                    width: '400px'
                  }),
                  ...(column.id === 'unit' && {
                    maxWidth: '120px',
                    minWidth: '120px',
                    width: '120px'
                  }),
                  ...(column.id === 'price' && {
                    maxWidth: '140px',
                    minWidth: '140px',
                    width: '140px'
                  }),
                  ...(column.id === 'category' && {
                    maxWidth: '180px',
                    minWidth: '180px',
                    width: '180px'
                  }),
                  ...(column.id === 'currentStock' && {
                    maxWidth: '130px',
                    minWidth: '130px',
                    width: '130px'
                  }),
                  ...(column.id === 'actions' && {
                    maxWidth: '120px',
                    minWidth: '120px',
                    width: '120px'
                  })
                }}
                className="animate-fade-in font-medium text-gray-700"
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {/* Виртуализированный список строк */}
        <TableBody>
          {materials.length > 0 ? (
            <tr>
              <td colSpan={visibleColumns.length + (onSelectionChange ? 1 : 0)} style={{ padding: 0 }}>
                <List
                  ref={listRef}
                  height={height}
                  width="100%"
                  itemCount={materials.length}
                  itemSize={getRowHeight}
                  itemData={materials}
                  overscanCount={5}
                  style={{
                    overflow: 'auto',
                    scrollbarWidth: 'thin'
                  }}
                  estimatedItemSize={72}
                >
                  {Row}
                </List>
              </td>
            </tr>
          ) : (
            <TableRow>
              <TableCell colSpan={visibleColumns.length + (onSelectionChange ? 1 : 0)} className="text-center py-8">
                Материалы не найдены
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        </Table>
      </div>
    );
}
