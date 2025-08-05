// Типы для блочного конструктора товаров

export type BlockType = 'MATERIALS' | 'WORK_TYPES' | 'OPTIONS' | 'FORMULAS'

// Базовый интерфейс блока
export interface ProductBlock {
  id: string
  name: string
  description?: string
  type: BlockType
  category?: string
  icon?: string
  config: BlockConfig
  isActive: boolean
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

// Конфигурация блоков по типам
export type BlockConfig = 
  | MaterialBlockConfig 
  | WorkTypeBlockConfig 
  | OptionsBlockConfig 
  | FormulasBlockConfig

// Блок материалов
export interface MaterialBlockConfig {
  materials: Array<{
    materialCode: string
    name: string
    quantityFormula: string
    wastePercent: number
    unit: string
    dependencies?: string[]
    conditions?: string // Условие применения материала
  }>
}

// Блок видов работ
export interface WorkTypeBlockConfig {
  workTypes: Array<{
    workTypeCode: string
    name: string
    timeFormula: string
    skillLevel: string
    unit: string
    dependencies?: string[]
    conditions?: string
  }>
}

// Блок опций/параметров
export interface OptionsBlockConfig {
  parameters: Array<{
    code: string
    name: string
    type: 'NUMBER' | 'SELECT' | 'BOOLEAN' | 'LENGTH' | 'AREA' | 'VOLUME'
    unit?: string
    minValue?: number
    maxValue?: number
    options?: string[]
    defaultValue?: any
    dependencies?: string[]
    helpText?: string
  }>
}

// Блок формул
export interface FormulasBlockConfig {
  formulas: Array<{
    code: string
    name: string
    expression: string
    roundingMethod: 'ROUND' | 'CEIL' | 'FLOOR' | 'TRUNCATE'
    precision: number
    dependencies?: string[]
    description?: string
  }>
}

// Конструктор товара
export interface ProductConstructorData {
  blocks: SelectedBlock[]
  metadata: {
    name: string
    description?: string
    category?: string
    estimatedCost?: number
    estimatedTime?: number
  }
}

// Выбранный блок в конструкторе
export interface SelectedBlock {
  blockId: string
  block: ProductBlock
  position: number
  customConfig?: Partial<BlockConfig> // Переопределения для конкретного товара
  isEnabled: boolean
}

// Результат генерации шаблона
export interface GeneratedTemplateResult {
  templateId: string
  template: {
    name: string
    description?: string
    parameters: any[]
    formulas: any[]
    bomTemplate: any
  }
  validation: {
    isValid: boolean
    errors: string[]
    warnings: string[]
  }
  preview: {
    estimatedParameters: number
    estimatedFormulas: number
    estimatedBomItems: number
  }
}

// Предпросмотр конструктора
export interface ConstructorPreview {
  totalParameters: number
  parameterGroups: Array<{
    groupName: string
    parameters: Array<{
      code: string
      name: string
      type: string
      required: boolean
    }>
  }>
  formulaDependencies: Array<{
    formula: string
    dependsOn: string[]
  }>
  estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH'
  potentialIssues: string[]
}

// Библиотека блоков
export interface BlockLibraryItem {
  block: ProductBlock
  usageCount: number
  lastUsed?: Date
  tags: string[]
  isRecommended: boolean
}

// Категории блоков
export interface BlockCategory {
  id: string
  name: string
  description?: string
  icon?: string
  blocks: ProductBlock[]
  color?: string
}

// Стандартные категории блоков
export const BLOCK_CATEGORIES: Record<string, BlockCategory> = {
  wood: {
    id: 'wood',
    name: 'Дерево',
    description: 'Деревообработка и столярные изделия',
    icon: 'TreePine',
    blocks: [],
    color: '#8B4513'
  },
  metal: {
    id: 'metal', 
    name: 'Металл',
    description: 'Металлообработка и сварочные работы',
    icon: 'Wrench',
    blocks: [],
    color: '#708090'
  },
  finishing: {
    id: 'finishing',
    name: 'Отделка',
    description: 'Отделочные материалы и работы',
    icon: 'Paintbrush',
    blocks: [],
    color: '#FF6347'
  },
  universal: {
    id: 'universal',
    name: 'Универсальные',
    description: 'Блоки для любых изделий',
    icon: 'Settings',
    blocks: [],
    color: '#4169E1'
  }
}

// Валидация блоков
export interface BlockValidationResult {
  isValid: boolean
  errors: Array<{
    blockId: string
    field: string
    message: string
    severity: 'error' | 'warning'
  }>
  suggestions: Array<{
    blockId: string
    suggestion: string
    impact: 'low' | 'medium' | 'high'
  }>
}

// События конструктора
export type ConstructorEvent = 
  | { type: 'BLOCK_ADDED'; blockId: string; position: number }
  | { type: 'BLOCK_REMOVED'; blockId: string }
  | { type: 'BLOCK_MOVED'; blockId: string; oldPosition: number; newPosition: number }
  | { type: 'BLOCK_CONFIGURED'; blockId: string; config: Partial<BlockConfig> }
  | { type: 'TEMPLATE_GENERATED'; templateId: string }
  | { type: 'VALIDATION_PERFORMED'; result: BlockValidationResult }
