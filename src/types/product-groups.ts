// Общие типы для работы с группами товаров

export interface ProductSubgroup {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  groupId: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
  subgroups?: ProductSubgroup[]; // Рекурсивно для под-подгрупп
}

export interface ProductGroup {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subgroups?: ProductSubgroup[];
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  description?: string | null;
  sellingPrice?: number;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
