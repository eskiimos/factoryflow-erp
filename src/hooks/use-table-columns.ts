import { useState, useEffect } from 'react';
import { TableColumn } from '@/components/table-column-settings';
import { TABLE_PRESETS } from '@/components/table-presets';

/**
 * Хук для управления настройками столбцов таблицы с сохранением в localStorage
 */
export function useTableColumns(storageKey: string, defaultColumns: TableColumn[]) {
  const [columns, setColumns] = useState<TableColumn[]>(defaultColumns);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка настроек из localStorage при инициализации
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedColumns: TableColumn[] = JSON.parse(saved);
        
        // Проверяем, что все столбцы из defaultColumns присутствуют
        // и добавляем новые, если они появились
        const mergedColumns = defaultColumns.map(defaultCol => {
          const savedCol = parsedColumns.find(col => col.id === defaultCol.id);
          return savedCol ? { ...defaultCol, ...savedCol } : defaultCol;
        });
        
        // Добавляем новые столбцы, которых не было в сохраненных настройках
        const newColumns = parsedColumns.filter(
          savedCol => !defaultColumns.find(defaultCol => defaultCol.id === savedCol.id)
        );
        
        setColumns([...mergedColumns, ...newColumns]);
      }
    } catch (error) {
      console.error('Failed to load table columns from localStorage:', error);
      setColumns(defaultColumns);
    } finally {
      setIsLoading(false);
    }
  }, [storageKey, defaultColumns]);

  // Сохранение настроек в localStorage при изменении
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(columns));
      } catch (error) {
        console.error('Failed to save table columns to localStorage:', error);
      }
    }
  }, [columns, storageKey, isLoading]);

  // Обновление настроек столбцов
  const updateColumns = (newColumns: TableColumn[]) => {
    setColumns(newColumns);
  };

  // Сброс к настройкам по умолчанию
  const resetToDefault = () => {
    setColumns(defaultColumns);
  };

  // Переключение видимости столбца
  const toggleColumn = (columnId: string) => {
    setColumns(prev => 
      prev.map(col => 
        col.id === columnId 
          ? { ...col, visible: !col.visible }
          : col
      )
    );
  };

  // Изменение порядка столбцов
  const reorderColumns = (startIndex: number, endIndex: number) => {
    setColumns(prev => {
      const newColumns = [...prev];
      const [movedColumn] = newColumns.splice(startIndex, 1);
      newColumns.splice(endIndex, 0, movedColumn);
      
      // Обновляем порядок
      return newColumns.map((col, index) => ({
        ...col,
        order: index
      }));
    });
  };

  // Получение видимых столбцов
  const getVisibleColumns = () => {
    return columns
      .filter(col => col.visible)
      .sort((a, b) => a.order - b.order);
  };

  // Получение статистики столбцов
  const getColumnStats = () => {
    const visible = columns.filter(col => col.visible).length;
    const total = columns.length;
    const required = columns.filter(col => col.required).length;
    const optional = total - required;
    
    return {
      visible,
      total,
      required,
      optional,
      hidden: total - visible
    };
  };

  // Применение пресета
  const applyPreset = (presetId: string) => {
    const preset = TABLE_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    
    const updatedColumns = columns.map(col => ({
      ...col,
      visible: preset.columns.includes(col.id)
    }));
    
    setColumns(updatedColumns);
  };

  return {
    columns,
    isLoading,
    updateColumns,
    resetToDefault,
    toggleColumn,
    reorderColumns,
    getVisibleColumns,
    getColumnStats,
    applyPreset
  };
}
