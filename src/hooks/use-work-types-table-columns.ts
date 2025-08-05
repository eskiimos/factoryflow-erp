import { TableColumn } from '@/components/table-column-settings';
import { useTableColumns } from '@/hooks/use-table-columns';

// Настройки столбцов по умолчанию для таблицы видов работ
export const DEFAULT_WORK_TYPES_COLUMNS: TableColumn[] = [
  {
    id: 'name',
    label: 'Название',
    visible: true,
    required: true,
    order: 0
  },
  {
    id: 'department',
    label: 'Отдел',
    visible: true,
    required: false,
    order: 1
  },
  {
    id: 'unit',
    label: 'Ед. изм.',
    visible: true,
    required: false,
    order: 2
  },
  {
    id: 'rate',
    label: 'Тариф',
    visible: true,
    required: false,
    order: 3
  },
  {
    id: 'executor',
    label: 'Исполнитель',
    visible: true,
    required: false,
    order: 4
  },
  {
    id: 'standardTime',
    label: 'Время',
    visible: true,
    required: false,
    order: 5
  },
  {
    id: 'description',
    label: 'Описание',
    visible: false,
    required: false,
    order: 6
  },
  {
    id: 'equipmentRequired',
    label: 'Оборудование',
    visible: false,
    required: false,
    order: 7
  },
  {
    id: 'safetyRequirements',
    label: 'Безопасность',
    visible: false,
    required: false,
    order: 8
  },
  {
    id: 'currency',
    label: 'Валюта',
    visible: false,
    required: false,
    order: 9
  },
  {
    id: 'status',
    label: 'Статус',
    visible: true,
    required: false,
    order: 10
  },
  {
    id: 'created',
    label: 'Создан',
    visible: false,
    required: false,
    order: 11
  },
  {
    id: 'actions',
    label: 'Действия',
    visible: true,
    required: true,
    order: 12
  }
];

// Пресеты для таблицы видов работ
export const WORK_TYPES_TABLE_PRESETS = {
  default: {
    name: 'По умолчанию',
    columns: ['name', 'department', 'unit', 'rate', 'skillLevel', 'standardTime', 'status', 'actions']
  },
  minimal: {
    name: 'Минимальный',
    columns: ['name', 'department', 'rate', 'actions']
  },
  detailed: {
    name: 'Подробный',
    columns: ['name', 'description', 'department', 'unit', 'rate', 'skillLevel', 'standardTime', 'equipmentRequired', 'safetyRequirements', 'status', 'created', 'actions']
  },
  operations: {
    name: 'Операционный',
    columns: ['name', 'department', 'unit', 'standardTime', 'skillLevel', 'equipmentRequired', 'safetyRequirements', 'status', 'actions']
  }
};

// Хук для управления столбцами таблицы видов работ
export function useWorkTypesTableColumns() {
  return useTableColumns('work-types-table-columns', DEFAULT_WORK_TYPES_COLUMNS);
}
