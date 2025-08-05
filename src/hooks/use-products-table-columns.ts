import { TableColumn } from '@/components/table-column-settings';
import { useTableColumns } from '@/hooks/use-table-columns';

// Настройки столбцов по умолчанию для таблицы товаров
export const DEFAULT_PRODUCTS_COLUMNS: TableColumn[] = [
  {
    id: 'name',
    label: 'Название',
    visible: true,
    required: true,
    order: 0
  },
  {
    id: 'sku',
    label: 'Артикул',
    visible: true,
    required: false,
    order: 1
  },
  {
    id: 'category',
    label: 'Категория',
    visible: true,
    required: false,
    order: 2
  },
  {
    id: 'unit',
    label: 'Ед. изм.',
    visible: true,
    required: false,
    order: 3
  },
  {
    id: 'totalCost',
    label: 'Себестоимость',
    visible: true,
    required: false,
    order: 4
  },
  {
    id: 'sellingPrice',
    label: 'Цена продажи',
    visible: true,
    required: false,
    order: 5
  },
  {
    id: 'margin',
    label: 'Маржа',
    visible: true,
    required: false,
    order: 6
  },
  {
    id: 'currentStock',
    label: 'Остаток',
    visible: true,
    required: false,
    order: 7
  },
  {
    id: 'stockStatus',
    label: 'Статус запасов',
    visible: true,
    required: false,
    order: 8
  },
  {
    id: 'productionTime',
    label: 'Время произв.',
    visible: false,
    required: false,
    order: 9
  },
  {
    id: 'materialCost',
    label: 'Материалы',
    visible: false,
    required: false,
    order: 10
  },
  {
    id: 'laborCost',
    label: 'Работы',
    visible: false,
    required: false,
    order: 11
  },
  {
    id: 'overheadCost',
    label: 'Накладные',
    visible: false,
    required: false,
    order: 12
  },
  {
    id: 'minStock',
    label: 'Мин. остаток',
    visible: false,
    required: false,
    order: 13
  },
  {
    id: 'maxStock',
    label: 'Макс. остаток',
    visible: false,
    required: false,
    order: 14
  },
  {
    id: 'description',
    label: 'Описание',
    visible: false,
    required: false,
    order: 15
  },
  {
    id: 'tags',
    label: 'Теги',
    visible: false,
    required: false,
    order: 16
  },
  {
    id: 'currency',
    label: 'Валюта',
    visible: false,
    required: false,
    order: 17
  },
  {
    id: 'status',
    label: 'Статус',
    visible: true,
    required: false,
    order: 18
  },
  {
    id: 'created',
    label: 'Создан',
    visible: false,
    required: false,
    order: 19
  },
  {
    id: 'actions',
    label: 'Действия',
    visible: true,
    required: true,
    order: 20
  }
];

// Пресеты для таблицы товаров
export const PRODUCTS_TABLE_PRESETS = {
  default: {
    name: 'По умолчанию',
    columns: ['name', 'sku', 'category', 'unit', 'totalCost', 'sellingPrice', 'margin', 'currentStock', 'stockStatus', 'status', 'actions']
  },
  minimal: {
    name: 'Минимальный',
    columns: ['name', 'sku', 'sellingPrice', 'currentStock', 'actions']
  },
  detailed: {
    name: 'Подробный',
    columns: ['name', 'sku', 'category', 'unit', 'totalCost', 'sellingPrice', 'margin', 'currentStock', 'stockStatus', 'productionTime', 'materialCost', 'laborCost', 'overheadCost', 'description', 'status', 'created', 'actions']
  },
  financial: {
    name: 'Финансовый',
    columns: ['name', 'sku', 'totalCost', 'sellingPrice', 'margin', 'materialCost', 'laborCost', 'overheadCost', 'currency', 'actions']
  },
  warehouse: {
    name: 'Складской',
    columns: ['name', 'sku', 'unit', 'currentStock', 'minStock', 'maxStock', 'stockStatus', 'actions']
  },
  production: {
    name: 'Производственный',
    columns: ['name', 'sku', 'category', 'unit', 'productionTime', 'materialCost', 'laborCost', 'currentStock', 'actions']
  }
};

// Хук для управления столбцами таблицы товаров
export function useProductsTableColumns() {
  return useTableColumns('products-table-columns', DEFAULT_PRODUCTS_COLUMNS);
}
