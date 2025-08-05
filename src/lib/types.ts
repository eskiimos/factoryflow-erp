// Database types from Prisma
export interface Category {
  id: string
  name: string
  description?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  materialItems?: MaterialItem[]
  _count?: {
    materialItems: number
  }
}

export interface MaterialItem {
  id: string
  name: string
  unit: string
  price: number
  currency: string
  isActive: boolean
  categoryId: string
  tags?: string | null
  
  // Управление запасами
  currentStock: number
  criticalMinimum: number
  satisfactoryLevel: number
  
  createdAt: Date
  updatedAt: Date
  category?: Category
}

// API response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  success: boolean
}

// Form types
export interface MaterialItemFormData {
  name: string
  unit: string
  price: number
  currency: string
  categoryId: string
  tags?: string[]
}

export interface CategoryFormData {
  name: string
  description?: string
}

// Dashboard types
export interface DashboardStats {
  totalMaterials: number
  activeCategories: number
  averagePrice: number
  totalValue: number
}

export interface MaterialItemWithCategory extends MaterialItem {
  category: Category
}

// Search and filter types
export interface MaterialItemFilters {
  categoryId?: string
  isActive?: boolean
  search?: string
  minPrice?: number
  maxPrice?: number
}

export interface SortOptions {
  field: 'name' | 'price' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}

// Chart data types
export interface ChartData {
  name: string
  value: number
  [key: string]: string | number
}

// Inventory management types
export type InventoryStatus = 'critical' | 'low' | 'satisfactory' | 'good' | 'empty'

export interface InventoryInfo {
  status: InventoryStatus
  statusText: string
  statusColor: string
  percentage: number
  needsAttention: boolean
}

// Utility functions for inventory management
export function getInventoryStatus(item: MaterialItem): InventoryInfo {
  const { currentStock, criticalMinimum, satisfactoryLevel } = item
  
  if (currentStock <= 0) {
    return {
      status: 'empty',
      statusText: 'Товар закончился',
      statusColor: 'bg-red-500',
      percentage: 0,
      needsAttention: true
    }
  }
  
  if (currentStock <= criticalMinimum) {
    return {
      status: 'critical',
      statusText: 'Критический минимум',
      statusColor: 'bg-red-500',
      percentage: (currentStock / criticalMinimum) * 100,
      needsAttention: true
    }
  }
  
  if (currentStock <= satisfactoryLevel) {
    return {
      status: 'low',
      statusText: 'Низкий уровень',
      statusColor: 'bg-yellow-500',
      percentage: (currentStock / satisfactoryLevel) * 100,
      needsAttention: true
    }
  }
  
  if (currentStock <= satisfactoryLevel * 1.5) {
    return {
      status: 'satisfactory',
      statusText: 'Удовлетворительно',
      statusColor: 'bg-blue-500',
      percentage: (currentStock / (satisfactoryLevel * 1.5)) * 100,
      needsAttention: false
    }
  }
  
  return {
    status: 'good',
    statusText: 'Хорошо',
    statusColor: 'bg-green-500',
    percentage: 100,
    needsAttention: false
  }
}

export function formatQuantity(quantity: number, unit: string): string {
  return `${quantity.toLocaleString('ru-RU')} ${unit}`
}

// Новые типы для производственной системы

// Уровни квалификации
export enum SkillLevel {
  TRAINEE = 'Стажер',
  WORKER = 'Рабочий',
  SPECIALIST = 'Специалист',
  EXPERT = 'Эксперт'
}

// Статусы сотрудников
export enum EmployeeStatus {
  ACTIVE = 'Активен',
  VACATION = 'Отпуск',
  SICK_LEAVE = 'Больничный',
  DISMISSED = 'Уволен'
}

// Единицы измерения для работ
export const WORK_UNITS = [
  { value: 'час', label: 'час' },
  { value: 'смена', label: 'смена' },
  { value: 'шт', label: 'шт' },
  { value: 'м²', label: 'м²' },
  { value: 'м³', label: 'м³' },
  { value: 'кг', label: 'кг' },
  { value: 'операция', label: 'операция' }
] as const

// Отдел/цех
export interface Department {
  id: string
  name: string
  description?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  workTypes?: WorkType[]
  employees?: Employee[]
  _count?: {
    workTypes: number
    employees: number
  }
}

// Вид работы
export interface WorkType {
  id: string
  name: string
  description?: string | null
  unit: string
  standardTime: number // в часах
  hourlyRate: number
  currency: string
  skillLevel: string
  equipmentRequired?: string | null
  safetyRequirements?: string | null
  isActive: boolean
  departmentId?: string | null
  createdAt: Date
  updatedAt: Date
  department?: Department | null
}

// Сотрудник
export interface Employee {
  id: string
  personnelNumber: string
  firstName: string
  lastName: string
  middleName?: string | null
  position: string
  skillLevel: string
  hourlyRate: number
  currency: string
  hireDate: Date
  phone?: string | null
  email?: string | null
  status: string
  isActive: boolean
  departmentId?: string | null
  createdAt: Date
  updatedAt: Date
  department?: Department | null
}

// Типы товаров
export enum ProductType {
  STANDARD = 'STANDARD',
  ASSEMBLY = 'ASSEMBLY', 
  WAREHOUSE = 'WAREHOUSE'
}

// Товары/готовая продукция
export interface Product {
  id: string
  name: string
  description?: string | null
  sku: string
  unit: string
  productType: ProductType // Тип товара
  
  // Производственные данные
  materialCost: number
  laborCost: number
  overheadCost: number
  totalCost: number
  
  // Коммерческие данные
  sellingPrice: number
  margin: number
  currency: string
  
  // Производственные данные
  productionTime: number
  
  // Складские данные
  currentStock: number
  minStock: number
  maxStock: number
  
  // Метаданные
  tags?: string | null
  specifications?: string | null
  images?: string | null
  isActive: boolean
  categoryId?: string | null
  
  // Группировка товаров
  groupId?: string | null
  subgroupId?: string | null
  
  createdAt: Date
  updatedAt: Date
  category?: Category | null
  group?: ProductGroup | null
  subgroup?: ProductSubgroup | null
}

// Группы товаров
export interface ProductGroup {
  id: string
  name: string
  description?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  subgroups?: ProductSubgroup[]
  products?: Product[]
  _count?: {
    subgroups: number
    products: number
  }
}

// Подгруппы товаров
export interface ProductSubgroup {
  id: string
  name: string
  description?: string | null
  isActive: boolean
  groupId: string
  createdAt: Date
  updatedAt: Date
  group?: ProductGroup
  products?: Product[]
  _count?: {
    products: number
  }
}

export interface ProductMaterialUsage {
  id: string
  productId: string
  materialItemId: string
  quantity: number
  cost: number
  createdAt: Date
  updatedAt: Date
  materialItem?: MaterialItem | null
}

export interface ProductWorkTypeUsage {
  id: string
  productId: string
  workTypeId: string
  quantity: number
  cost: number
  sequence: number
  createdAt: Date
  updatedAt: Date
  workType?: WorkType | null
}

export interface ProductWithDetails extends Product {
  materialUsages: (ProductMaterialUsage & {
    materialItem: MaterialItem
  })[]
  workTypeUsages: (ProductWorkTypeUsage & {
    workType: WorkType
  })[]
}

export interface ProductWithCategory extends Omit<Product, 'category'> {
  category: Category | null
}

// Типы для калькуляции
export interface ProductCostCalculation {
  materialCosts: {
    materialItem: MaterialItem
    quantity: number
    unitCost: number
    totalCost: number
  }[]
  laborCosts: {
    workType: WorkType
    quantity: number
    unitCost: number
    totalCost: number
  }[]
  totalMaterialCost: number
  totalLaborCost: number
  overheadCost: number
  totalCost: number
  suggestedPrice: number
  targetMargin: number
}

// Типы для производственного планирования
export interface ProductionPlan {
  product: Product
  plannedQuantity: number
  requiredMaterials: {
    materialItem: MaterialItem
    requiredQuantity: number
    availableQuantity: number
    shortfall: number
  }[]
  requiredWorkTypes: {
    workType: WorkType
    requiredTime: number
    estimatedCost: number
  }[]
  totalProductionTime: number
  totalEstimatedCost: number
  canProduce: boolean
  limitations: string[]
}

// Функции для работы с данными
export function getSkillLevelColor(skillLevel: string): string {
  switch (skillLevel) {
    case SkillLevel.TRAINEE:
      return 'bg-gray-100 text-gray-800'
    case SkillLevel.WORKER:
      return 'bg-blue-100 text-blue-800'
    case SkillLevel.SPECIALIST:
      return 'bg-green-100 text-green-800'
    case SkillLevel.EXPERT:
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getEmployeeStatusColor(status: string): string {
  switch (status) {
    case EmployeeStatus.ACTIVE:
      return 'bg-green-100 text-green-800'
    case EmployeeStatus.VACATION:
      return 'bg-yellow-100 text-yellow-800'
    case EmployeeStatus.SICK_LEAVE:
      return 'bg-orange-100 text-orange-800'
    case EmployeeStatus.DISMISSED:
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function formatEmployeeName(employee: Employee): string {
  return `${employee.lastName} ${employee.firstName}${employee.middleName ? ` ${employee.middleName}` : ''}`
}

export function calculateWorkCost(workType: WorkType, hours: number): number {
  return workType.hourlyRate * hours
}
