import { TableColumn } from '@/components/table-column-settings';
import { useTableColumns } from '@/hooks/use-table-columns';

// Настройки столбцов по умолчанию для таблицы материалов
export const DEFAULT_MATERIALS_COLUMNS: TableColumn[] = [
  {
    id: 'name',
    label: 'Название',
    visible: true,
    required: true,
    order: 0
  },
  {
    id: 'unit',
    label: 'Единица',
    visible: true,
    required: false,
    order: 1
  },
  {
    id: 'price',
    label: 'Цена',
    visible: true,
    required: false,
    order: 2
  },
  {
    id: 'category',
    label: 'Группа',
    visible: true,
    required: false,
    order: 3
  },
  {
    id: 'currentStock',
    label: 'Остаток',
    visible: true,
    required: false,
    order: 4
  },
  {
    id: 'stockStatus',
    label: 'Статус запасов',
    visible: true,
    required: false,
    order: 5
  },
  {
    id: 'criticalMinimum',
    label: 'Крит. минимум',
    visible: false,
    required: false,
    order: 6
  },
  {
    id: 'satisfactoryLevel',
    label: 'Удовл. уровень',
    visible: false,
    required: false,
    order: 7
  },
  {
    id: 'status',
    label: 'Статус',
    visible: true,
    required: false,
    order: 8
  },
  {
    id: 'created',
    label: 'Создан',
    visible: false,
    required: false,
    order: 9
  },
  {
    id: 'actions',
    label: 'Действия',
    visible: true,
    required: true,
    order: 10
  }
];

// Пресеты для таблицы материалов
export const MATERIALS_TABLE_PRESETS = {
  default: {
    name: 'По умолчанию',
    columns: ['name', 'unit', 'price', 'category', 'currentStock', 'stockStatus', 'status', 'actions']
  },
  minimal: {
    name: 'Минимальный',
    columns: ['name', 'unit', 'price', 'actions']
  },
  detailed: {
    name: 'Подробный',
    columns: ['name', 'unit', 'price', 'category', 'currentStock', 'stockStatus', 'criticalMinimum', 'satisfactoryLevel', 'status', 'created', 'actions']
  },
  inventory: {
    name: 'Складской',
    columns: ['name', 'unit', 'currentStock', 'stockStatus', 'criticalMinimum', 'satisfactoryLevel', 'actions']
  }
};

// Хук для управления столбцами таблицы материалов
export function useMaterialsTableColumns() {
  return useTableColumns('materials-table-columns', DEFAULT_MATERIALS_COLUMNS);
}
