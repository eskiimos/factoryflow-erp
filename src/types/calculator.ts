import { ProductType } from '@prisma/client';

// Типы товаров и точки входа
export type EntryPoint = 
  | 'DEAL' // Из сделки
  | 'ORDER' // Из заказа
  | 'CATALOG' // Из каталога
  | 'HISTORY' // Дублировать из истории
  | 'TEMPLATE' // Шаблон клиента
  | 'BRIEF'; // Импорт из брифа

export type ProductCalculationType = 'STANDARD' | 'COMPOSITE' | 'WAREHOUSE' | 'CONSTRUCTOR';
export type ParameterCategory = 'basic' | 'advanced';
export type Currency = 'RUB' | 'USD' | 'EUR';

// Отраслевые группы для стандартных товаров
export type IndustryGroup = 
  | 'SHEET_CUTTING' // Листовой раскрой
  | 'PARAMETRIC' // Параметрический
  | 'RECIPE' // Рецептура
  | 'ADVERTISING' // РПК
  | 'CLOTHING' // Одежда
  | 'TIME_MATERIAL'; // Time & Material

// Шаблоны расчета
export type CalculationTemplate = {
  id: string;
  name: string;
  industryGroup: IndustryGroup;
  productType: ProductCalculationType;
  description?: string;
  tags?: string[];
  rules: TemplateRules;
  presets: TemplatePreset[];
  fields: TemplateField[];
  workflow: WorkflowStep[];
};

export type TemplateRules = {
  minArea?: number;
  minPrice?: number;
  minQuantity?: number;
  panelization?: boolean;
  vatIncluded: boolean;
  marginMin?: number;
  marginMax?: number;
  discountMax?: number;
  approvalThresholds: {
    discountPercent: number;
    marginPercent: number;
  };
  equipmentLimits?: {
    maxWidth: number;
    maxHeight: number;
    maxDepth: number;
  };
};

export type TemplatePreset = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  values: Record<string, any>;
  popular?: boolean;
};

export type TemplateField = {
  id: string;
  label: string;
  type: 'number' | 'select' | 'text' | 'boolean' | 'multiselect' | 'textarea' | 'slider' | 'checkbox';
  category: ParameterCategory;
  unit?: string;
  placeholder?: string;
  description?: string;
  defaultValue?: any;
  options?: { value: string; label: string }[];
  dependsOn?: string[];
  calculation?: string; // Формула для автоматического расчета
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
    pattern?: string;
  }
};

export type WorkflowStep = {
  id: string;
  name: string;
  description?: string;
  autoCalculation?: boolean;
  validations?: ValidationRule[];
};

export type ValidationRule = {
  field: string;
  rule: 'required' | 'min' | 'max' | 'custom';
  value?: any;
  message: string;
};

// Основные параметры расчета
export type CalculationParameters = {
  basic: Record<string, any>; // Основные параметры
  advanced: Record<string, any>; // Расширенные параметры
  quantity: number;
};

// Автоподбор и рекомендации
export type AutoCalculationResult = {
  derivedValues: { label: string; value: string; unit: string }[];
  recommendations: string[];
  warnings: string[];
};

// Ценообразование с детализацией
export type PricingBreakdown = {
  costItems: {
    name: string;
    amount: number;
    description?: string;
  }[];
  totalCost: number;
  marginPercentage: number;
  marginAmount: number;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  finalPrice: number;
};

// Сборные товары (композиты)
export type CompositeCalculation = {
  id: string;
  name: string;
  template: string;
  components: CompositeComponent[];
  rules: CompositeRules;
  summary: CompositeSummary;
};

export type CompositeComponent = {
  id: string;
  type: 'STANDARD' | 'WAREHOUSE';
  name: string;
  quantity: number;
  calculation?: CalculationResult;
  warehouseItem?: WarehouseItem;
  position?: number;
};

export type WarehouseItem = {
  sku: string;
  name: string;
  price: number;
  unit: string;
  packaging?: {
    multiple: number;
    unit: string;
  };
  stock?: number;
};

export type CompositeRules = {
  sharedOverhead: boolean;
  minimumOrder?: number;
  marginOverride?: number;
  vatTreatment: 'individual' | 'consolidated';
};

export type CompositeSummary = {
  totalCost: number;
  totalPrice: number;
  criticalPath: string[];
  bom: BOMItem[];
};

export type BOMItem = {
  item: string;
  quantity: number;
  unit: string;
  source: 'material' | 'warehouse' | 'service';
};

// Статус и версионирование
export type CalculationStatus = 
  | 'DRAFT' 
  | 'CALCULATING'
  | 'COMPLETED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED';

export type ApprovalRequest = {
  id: string;
  calculationId: string;
  reason: 'high_discount' | 'low_margin' | 'custom';
  requestedBy: string;
  requestedAt: string;
  approver?: string;
  approvedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
};

export type CalculationVersion = {
  id: string;
  version: number;
  createdAt: string;
  author: string;
  snapshot: CalculationResult;
};

// Основной результат расчета
export interface CalculationResult {
  id: string;
  name: string;
  templateId: string;
  productType: ProductCalculationType;
  entryPoint: EntryPoint;
  sourceId?: string;
  
  parameters: CalculationParameters;
  autoCalculations?: AutoCalculationResult;
  pricing?: PricingBreakdown;
  
  status: CalculationStatus;
  createdAt: string;
  updatedAt: string;
  versions: CalculationVersion[];
  approval?: ApprovalRequest;
  
  metrics: Partial<CalculationMetrics>;
  notes?: string;
  tags?: string[];
}

// API интерфейсы
export interface CreateCalculationDTO {
  templateId: string;
  entryPoint: EntryPoint;
  sourceId?: string;
  parameters?: Partial<CalculationParameters>;
}

export interface UpdateCalculationDTO {
  id: string;
  parameters?: Partial<CalculationParameters>;
  notes?: string;
  requestApproval?: boolean;
}

export interface CalculationResponse {
  calculation: CalculationResult;
  autoCalculation?: AutoCalculationResult;
  needsApproval?: boolean;
  nextSteps?: NextStep[];
}

export type NextStep = {
  action: 'save' | 'quote' | 'order' | 'approval' | 'edit';
  label: string;
  description?: string;
  primary?: boolean;
};

// Метрики UX
export interface CalculationMetrics {
  templateSelectionTime: number;
  timeToFirstCalculation: number; // секунды
  advancedFieldsOpened: boolean;
  presetsUsed: string[];
  calculationCount: number;
  validationErrors: number;
  approvalSubmitted: boolean;
  convertedToQuote: boolean;
  convertedToOrder: boolean;
  sessionDuration: number;
}
