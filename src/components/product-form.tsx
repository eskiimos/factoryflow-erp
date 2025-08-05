'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calculator, Upload, X, Plus, Search, Filter,
  Package, Wrench, DollarSign, TrendingUp, Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AdvancedGroupSelector } from '@/components/advanced-group-selector';
import { Product } from '@/lib/types';
import { ProductType } from '@prisma/client';
import { useToast } from '@/components/ui/use-toast';

// Интерфейсы для единиц измерения
interface Unit {
  id: string;
  name: string;
  group: string;
  baseUnitId?: string;
  coefficient: number;
}

// Интерфейсы для материалов
interface Material {
  id: string;
  name: string;
  unit: string;
  price: number;
  group?: string;
}

interface MaterialUsage {
  id?: string;
  materialId: string;
  material: Material;
  quantity: number;
  cost: number;
}

// Интерфейсы для видов работ
interface WorkType {
  id: string;
  name: string;
  unit: string; // час/операция
  hourlyRate: number; // ставка (переименовано из rate)
  skillLevel?: string;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
  };
}

interface WorkTypeUsage {
  id?: string;
  workTypeId: string;
  workType: WorkType;
  quantity: number;
  cost: number;
}

// Интерфейсы для фондов
interface Fund {
  id: string;
  name: string;
  description?: string;
  fundType?: string;
  totalAmount: number;
  // Для совместимости с калькуляцией
  type: 'PERCENT' | 'FIXED';
  value: number;
  categories?: Array<{
    id: string;
    name: string;
    categoryType: string;
    percentage: number;
    plannedAmount: number;
  }>;
}

interface FundUsage {
  id?: string;
  fundId: string;
  fund: Fund;
  percentage: number; // пользовательский процент
  value: number; // рассчитанная стоимость
}

// Ценообразование
interface PriceLevel {
  id?: string;
  minQuantity: number;
  markup: number; // наценка в процентах
  price: number; // рассчитанная цена
}

interface ProductFormData {
  id?: string;
  name: string;
  sku: string;
  description: string;
  productType: ProductType; // тип товара
  saleUnit: string; // единица продажи
  baseUnit: string; // базовая единица расчёта
  coefficient: number; // коэффициент перевода
  images: string[];
  mainImageIndex: number;
  
  // Расчётные поля
  materialUsages: MaterialUsage[];
  workTypeUsages: WorkTypeUsage[];
  fundUsages: FundUsage[];
  
  // Итоговые суммы
  materialsCost: number;
  workCost: number;
  fundsCost: number;
  totalCost: number;
  
  // Ценообразование
  useGrading: boolean;
  priceLevels: PriceLevel[];
  simpleMargin: number;
  recommendedPrice: number;
  
  // Группировка товаров
  groupId?: string;
  subgroupId?: string;
  
  isActive: boolean;
}

// Расширенный интерфейс для продукта с вложенными связями (как его получаем с сервера)
interface ProductWithRelations {
  id: string;
  name: string;
  description?: string | null;
  sku: string;
  unit: string;
  baseUnit?: string;
  
  // Производственные данные
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  
  // Коммерческие данные
  sellingPrice: number;
  margin: number;
  currency: string;
  
  // Производственные данные
  productionTime: number;
  
  // Складские данные
  currentStock: number;
  minStock: number;
  maxStock: number;
  
  // Метаданные
  tags?: string | null;
  specifications?: string | null;
  images?: string | null;
  isActive: boolean;
  
  // Связи
  group?: { id: string; name: string; description?: string | null } | null;
  subgroup?: { id: string; name: string; description?: string | null } | null;
  
  // Материалы и работы
  materialUsages?: Array<{
    id: string;
    materialItemId: string;
    quantity: number;
    cost: number;
    materialItem?: {
      id: string;
      name: string;
      unit: string;
      price: number;
    } | null;
  }>;
  
  workTypeUsages?: Array<{
    id: string;
    workTypeId: string;
    quantity: number;
    cost: number;
    sequence: number;
    workType?: {
      id: string;
      name: string;
      hourlyRate: number;
      unit?: string;
      department?: {
        id: string;
        name: string;
      } | null;
    } | null;
  }>;
  
  fundUsages?: Array<{
    id: string;
    fundId: string;
    allocatedAmount: number;
    percentage?: number | null;
    fund?: {
      id: string;
      name: string;
      totalAmount: number;
    } | null;
    category?: {
      id: string;
      name: string;
    } | null;
  }>;
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  product?: ProductWithRelations | null;
}

const defaultFormData: ProductFormData = {
  name: '',
  sku: '',
  description: '',
  productType: 'STANDARD',
  saleUnit: '',
  baseUnit: '',
  coefficient: 1,
  images: [],
  mainImageIndex: 0,
  
  materialUsages: [],
  workTypeUsages: [],
  fundUsages: [],
  
  materialsCost: 0,
  workCost: 0,
  fundsCost: 0,
  totalCost: 0,
  
  useGrading: false,
  priceLevels: [],
  simpleMargin: 20,
  recommendedPrice: 0,
  
  groupId: "",
  subgroupId: "",
  
  isActive: true
};

export function ProductForm({ mode, product, loading }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [activeTab, setActiveTab] = useState('basic');
  const [units, setUnits] = useState<Unit[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [productGroups, setProductGroups] = useState<Array<{
    id: string;
    name: string;
    description?: string;
    _count?: {
      products: number;
      subgroups: number;
    };
    subgroups?: Array<{
      id: string;
      name: string;
      description?: string;
      _count?: {
        products: number;
      };
      subgroups?: Array<{
        id: string;
        name: string;
        description?: string;
        _count?: {
          products: number;
        };
      }>;
    }>;
  }>>([]);
  const [productSubgroups, setProductSubgroups] = useState<Array<{id: string, name: string, description?: string, groupId: string}>>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedWorkType, setSelectedWorkType] = useState<WorkType | null>(null);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [materialSearch, setMaterialSearch] = useState('');
  const [workTypeSearch, setWorkTypeSearch] = useState('');
  const [fundSearch, setFundSearch] = useState('');
  const [materialQuantity, setMaterialQuantity] = useState('');
  const [workQuantity, setWorkQuantity] = useState('');
  const [fundPercentage, setFundPercentage] = useState('');

  // Загрузка данных
  useEffect(() => {
    loadInitialData();
  }, []);

  // Автосохранение (debounced)
  useEffect(() => {
    if (!isEditMode || !product?.id) return;
    
    const timer = setTimeout(() => {
      autosave();
    }, 800);

    return () => clearTimeout(timer);
  }, [formData]);

  // Пересчёт стоимостей при изменении данных
  useEffect(() => {
    calculateCosts();
  }, [formData.materialUsages, formData.workTypeUsages, formData.fundUsages]);

  // Пересчёт цены при изменении наценки
  useEffect(() => {
    calculatePricing();
  }, [formData.totalCost, formData.simpleMargin, formData.priceLevels, formData.useGrading]);
  
  // Загружаем подгруппы при изменении группы продукта
  useEffect(() => {
    if (formData.groupId && formData.groupId !== "none") {
      loadSubgroupsForGroup(formData.groupId);
    }
  }, [formData.groupId]);
  
  // Логируем изменения формы для отладки
  useEffect(() => {
    console.log("Form state updated:", { 
      groupId: formData.groupId, 
      subgroupId: formData.subgroupId 
    });
  }, [formData.groupId, formData.subgroupId]);

  const loadInitialData = async () => {
    try {
      // Загружаем единицы измерения, материалы, виды работ, фонды, группы продуктов
      const [unitsRes, materialsRes, workTypesRes, fundsRes, groupsRes, subgroupsRes] = await Promise.all([
        fetch('/api/units'),
        fetch('/api/materials'),
        fetch('/api/work-types?showAll=true&limit=100'),
        fetch('/api/funds'),
        fetch('/api/product-groups?includeSubgroups=true'),
        fetch('/api/product-subgroups')
      ]);

      if (unitsRes.ok) setUnits(await unitsRes.json());
      if (materialsRes.ok) setMaterials(await materialsRes.json());
      
      // Загрузка групп и подгрупп продукции
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setProductGroups(groupsData.data || []);
      }
      
      if (subgroupsRes.ok) {
        const subgroupsData = await subgroupsRes.json();
        setProductSubgroups(subgroupsData.data || []);
      }
      
      // Обрабатываем work-types с учётом структуры {data: [...]}
      if (workTypesRes.ok) {
        const workTypesData = await workTypesRes.json();
        setWorkTypes(workTypesData.data || []);
      }
      
      // Обрабатываем funds - преобразуем к нужному формату
      if (fundsRes.ok) {
        const fundsData = await fundsRes.json();
        // Преобразуем фонды к упрощённому формату для калькуляции
        const simplifiedFunds: Fund[] = fundsData.flatMap((fund: any) => {
          // Создаём фонды на основе категорий с процентами
          return fund.categories?.map((category: any) => ({
            id: `${fund.id}-${category.id}`,
            name: `${fund.name}: ${category.name}`,
            description: category.description || fund.description,
            fundType: category.categoryType,
            totalAmount: fund.totalAmount,
            // Используем процентную систему
            type: 'PERCENT' as const,
            value: category.percentage || 10, // процент от прямых затрат
            categories: [category]
          })) || [{
            id: fund.id,
            name: fund.name,
            description: fund.description,
            fundType: fund.fundType,
            totalAmount: fund.totalAmount,
            type: 'PERCENT' as const,
            value: 15, // базовый процент если нет категорий
            categories: []
          }];
        });
        setFunds(simplifiedFunds);
      }

      // Если редактирование, загружаем данные товара
      if (isEditMode && product) {
        // Добавляем проверки на существование свойств
        console.log('Loading product data:', product);
        
        // Подготавливаем materialUsages
        const materialUsages = product.materialUsages?.map(usage => ({
          id: usage.id,
          materialId: usage.materialItemId,
          material: {
            id: usage.materialItem?.id || usage.materialItemId,
            name: usage.materialItem?.name || 'Неизвестный материал',
            unit: usage.materialItem?.unit || 'шт',
            price: usage.materialItem?.price || 0
          },
          quantity: usage.quantity || 0,
          cost: usage.cost || 0
        })) || [];
        
        // Подготавливаем workTypeUsages
        const workTypeUsages = product.workTypeUsages?.map(usage => ({
          id: usage.id,
          workTypeId: usage.workTypeId,
          workType: {
            id: usage.workType?.id || usage.workTypeId,
            name: usage.workType?.name || 'Неизвестная работа',
            hourlyRate: usage.workType?.hourlyRate || 0,
            unit: usage.workType?.unit || 'час',
            department: usage.workType?.department || { 
              id: 'default', 
              name: 'Общий' 
            }
          },
          quantity: usage.quantity || 0, // Исправлено с hours на quantity для соответствия интерфейсу
          cost: usage.cost || 0
        })) || [];
        
        setFormData({
          ...defaultFormData,
          id: product.id,
          name: product.name || '',
          sku: product.sku || '',
          description: product.description || '',
          productType: product.productType || 'STANDARD',
          saleUnit: product.unit || '',
          baseUnit: product.baseUnit || product.unit || '',
          coefficient: 1,
          materialUsages: materialUsages,
          workTypeUsages: workTypeUsages,
          fundUsages: [],
          materialsCost: product.materialCost || 0,
          workCost: product.laborCost || 0,
          fundsCost: product.overheadCost || 0,
          totalCost: product.totalCost || 0,
          simpleMargin: product.margin || 20,
          recommendedPrice: product.sellingPrice || 0,
          images: product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [],
          groupId: product.group?.id || "",
          subgroupId: product.subgroup?.id || ""
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Ошибка загрузки данных',
        variant: 'destructive'
      });
    }
  };

  const autosave = async () => {
    if (!isEditMode || !product?.id) return;

    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch (error) {
      console.error('Autosave failed:', error);
    }
  };

  const calculateCosts = () => {
    // Расчёт стоимости материалов
    const materialsCost = formData.materialUsages.reduce((sum, usage) => {
      return sum + (usage.quantity * usage.material.price);
    }, 0);

    // Расчёт стоимости работ
    const workCost = formData.workTypeUsages.reduce((sum, usage) => {
      return sum + (usage.quantity * usage.workType.hourlyRate);
    }, 0);

    // Расчёт фондов
    const directCosts = materialsCost + workCost;
    const fundsCost = formData.fundUsages.reduce((sum, usage) => {
      if (usage.fund.type === 'PERCENT') {
        return sum + (directCosts * usage.fund.value / 100);
      } else {
        return sum + usage.fund.value;
      }
    }, 0);

    const totalCost = materialsCost + workCost + fundsCost;

    setFormData(prev => ({
      ...prev,
      materialsCost,
      workCost,
      fundsCost,
      totalCost
    }));
  };

  const calculatePricing = () => {
    if (!formData.useGrading) {
      const recommendedPrice = formData.totalCost * (1 + formData.simpleMargin / 100);
      setFormData(prev => ({
        ...prev,
        recommendedPrice
      }));
    } else {
      const updatedPriceLevels = formData.priceLevels.map(level => ({
        ...level,
        price: formData.totalCost * (1 + level.markup / 100)
      }));
      setFormData(prev => ({
        ...prev,
        priceLevels: updatedPriceLevels
      }));
    }
  };
  
  // Загрузка подгрупп при выборе группы
  const loadSubgroupsForGroup = async (groupId: string) => {
    if (!groupId) {
      setProductSubgroups([]);
      return;
    }
    
    try {
      const response = await fetch(`/api/product-subgroups?groupId=${groupId}`);
      if (response.ok) {
        const data = await response.json();
        setProductSubgroups(data.data || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки подгрупп:', error);
      toast({
        title: 'Ошибка загрузки подгрупп',
        description: 'Не удалось загрузить подгруппы для выбранной группы',
        variant: 'destructive'
      });
    }
  };

  // Получение текущего выбранного значения для AdvancedGroupSelector
  const getCurrentSelectedValue = () => {
    if (formData.subgroupId) {
      return `subgroup-${formData.subgroupId}`;
    } else if (formData.groupId) {
      return `group-${formData.groupId}`;
    }
    return 'none';
  };

  // Обработка выбора группы/подгруппы из AdvancedGroupSelector
  const handleGroupSelection = (value: string) => {
    if (!value || value === 'none') {
      setFormData(prev => ({
        ...prev,
        groupId: '',
        subgroupId: ''
      }));
      return;
    }

    const [type, id] = value.split('-');
    
    if (type === 'group') {
      setFormData(prev => ({
        ...prev,
        groupId: id,
        subgroupId: ''
      }));
    } else if (type === 'subgroup') {
      // Для подгрупп устанавливаем только subgroupId
      // groupId будет определен на сервере при сохранении
      setFormData(prev => ({
        ...prev,
        subgroupId: id,
        // Оставляем groupId как есть или очищаем - на выбор
        groupId: ''
      }));
    }
  };

  const handleSave = async (publish = false) => {
    try {
      const url = isEditMode && product?.id ? `/api/products/${product.id}` : '/api/products';
      const method = isEditMode ? 'PUT' : 'POST';
      
      console.log('isEditMode:', isEditMode);
      console.log('product?.id:', product?.id);

      // Преобразуем данные формы в формат, ожидаемый API
      const productData = {
        name: formData.name,
        description: formData.description || '',
        sku: formData.sku || `SKU-${Date.now()}`, // Генерируем SKU если не задан
        unit: formData.saleUnit || formData.baseUnit || 'шт', // Используем единицу продажи или базовую
        productType: formData.productType || 'STANDARD', // тип товара
        
        // Стоимости
        materialCost: formData.materialsCost || 0,
        laborCost: formData.workCost || 0,
        overheadCost: formData.fundsCost || 0,
        totalCost: formData.totalCost || 0,
        
        // Использования (преобразуем в формат API)
        materials: formData.materialUsages.map(usage => ({
          materialId: usage.materialId,
          quantity: usage.quantity
        })),
        
        workTypes: formData.workTypeUsages.map((usage, index) => ({
          workTypeId: usage.workType.id,
          quantity: usage.quantity,
          sequence: index + 1
        })),
        
        funds: formData.fundUsages.map(usage => ({
          fundId: usage.fundId,
          categoryId: usage.fund.categories?.[0]?.id || '', // Используем первую категорию, если есть
          allocatedAmount: (formData.materialsCost + formData.workCost) * usage.percentage / 100,
          percentage: usage.percentage
        })),
        
        // Ценообразование
        sellingPrice: formData.recommendedPrice || formData.totalCost,
        margin: formData.simpleMargin || 0,
        currency: 'RUB',
        
        // Производство
        productionTime: formData.workTypeUsages.reduce((total, usage) => {
          const unit = usage.workType.unit.toLowerCase();
          if (unit.includes('час')) {
            return total + usage.quantity;
          } else if (unit.includes('мин')) {
            return total + (usage.quantity / 60);
          }
          return total;
        }, 0),
        
        // Остатки
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        
        // Дополнительные поля
        tags: '',
        specifications: '',
        images: '', // API ожидает строку, а не массив
        isActive: publish ? true : formData.isActive,
        groupId: formData.groupId || "", 
        subgroupId: formData.subgroupId || ""
      };

      console.log('Sending product data:', productData); // Для отладки
      console.log('URL:', url);
      console.log('Method:', method);

      // Печатаем полную информацию о продукте если в режиме редактирования
      if (isEditMode && product) {
        console.log('Existing product:', product);
      }

      // Создаем упрощенный объект без сложных вложенных свойств для отладки
      // Проверяем, есть ли product и id при редактировании
      let finalId = null;
      if (isEditMode && product) {
        finalId = product.id;
        console.log('Product ID при редактировании:', finalId);
      }

      // Создаем полный объект с правильными типами данных
      const simplifiedData = {
        id: finalId, // Добавляем ID при редактировании
        name: productData.name,
        description: productData.description,
        sku: productData.sku,
        unit: productData.unit,
        type: 'PRODUCT', // Обязательное поле из схемы валидации
        materialCost: Number(productData.materialCost || 0),
        laborCost: Number(productData.laborCost || 0),
        overheadCost: Number(productData.overheadCost || 0),
        totalCost: Number(productData.totalCost || 0),
        sellingPrice: Number(productData.sellingPrice || 0),
        margin: Number(productData.margin || 0),
        currency: productData.currency || "RUB",
        productionTime: Number(productData.productionTime || 0),
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        tags: productData.tags || '',
        specifications: productData.specifications || '',
        images: productData.images || '',
        isActive: Boolean(productData.isActive),
        groupId: productData.groupId || null,
        subgroupId: productData.subgroupId || null
      };

      console.log('Sending simplified data:', JSON.stringify(simplifiedData, null, 2));
      
      try {
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(simplifiedData)
        });
        
        // Получаем текстовое представление ответа
        const responseText = await response.text();
        console.log(`Server response (${response.status}):`, responseText);
        
        // Пытаемся распарсить JSON если возможно
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          responseData = { text: responseText };
        }
  
        if (!response.ok) {
          let errorMessage = `Failed to save product: ${response.status}`;
          console.error('Error response:', responseData);
          
          // Используем сообщение об ошибке из ответа если оно есть
          if (responseData && responseData.error) {
            errorMessage = responseData.error;
          }
          
          throw new Error(errorMessage);
        }
        
        // Успешное сохранение
        toast({
          title: isEditMode ? 'Товар обновлён' : 'Товар создан',
          description: publish ? 'Товар опубликован' : 'Товар сохранён как черновик'
        });
  
        router.push('/products');
      } catch (innerError) {
        console.error('Error in API request:', innerError);
        throw innerError; // Re-throw to be caught by outer try/catch
      }

      // Код перенесен внутрь предыдущего блока try/catch
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Ошибка сохранения',
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        variant: 'destructive'
      });
    }
  };

  const addMaterial = (material: Material, quantity: number) => {
    const usage: MaterialUsage = {
      materialId: material.id,
      material,
      quantity,
      cost: quantity * material.price
    };

    setFormData(prev => ({
      ...prev,
      materialUsages: [...prev.materialUsages, usage]
    }));
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materialUsages: prev.materialUsages.filter((_, i) => i !== index)
    }));
  };

  const addWorkType = (workType: WorkType, quantity: number) => {
    const usage: WorkTypeUsage = {
      workTypeId: workType.id,
      workType,
      quantity,
      cost: quantity * workType.hourlyRate
    };

    setFormData(prev => ({
      ...prev,
      workTypeUsages: [...prev.workTypeUsages, usage]
    }));
  };

  const removeWorkType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workTypeUsages: prev.workTypeUsages.filter((_, i) => i !== index)
    }));
  };

  const addFund = (fund: Fund, percentage: number) => {
    const directCosts = formData.materialsCost + formData.workCost;
    const value = directCosts * percentage / 100;

    const usage: FundUsage = {
      fundId: fund.id,
      fund,
      percentage,
      value
    };

    setFormData(prev => ({
      ...prev,
      fundUsages: [...prev.fundUsages, usage]
    }));
  };

  // Очистка количества при смене выбранного материала
  useEffect(() => {
    setMaterialQuantity('');
  }, [selectedMaterial]);

  // Очистка количества при смене выбранного вида работ
  useEffect(() => {
    setWorkQuantity('');
  }, [selectedWorkType]);

  // Очистка процента при смене выбранного фонда
  useEffect(() => {
    setFundPercentage('');
  }, [selectedFund]);

  // Обновляем расчёты фондов при изменении прямых затрат
  useEffect(() => {
    if (formData.fundUsages.length === 0) return;
    
    const directCosts = formData.materialsCost + formData.workCost;
    const updatedUsages = formData.fundUsages.map(usage => ({
      ...usage,
      value: directCosts * usage.percentage / 100
    }));

    // Проверяем, изменились ли значения, чтобы избежать бесконечного цикла
    const hasChanges = updatedUsages.some((usage, index) => 
      Math.abs(usage.value - formData.fundUsages[index].value) > 0.01
    );

    if (hasChanges) {
      setFormData(prev => ({
        ...prev,
        fundUsages: updatedUsages
      }));
    }
  }, [formData.materialsCost, formData.workCost]);

  const removeFund = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fundUsages: prev.fundUsages.filter((_, i) => i !== index)
    }));
  };

  const exportCalculation = () => {
    const calculationData = {
      product: {
        name: formData.name,
        sku: formData.sku,
        description: formData.description
      },
      costs: {
        materials: formData.materialUsages,
        workTypes: formData.workTypeUsages,
        funds: formData.fundUsages,
        totalMaterials: formData.materialsCost,
        totalWork: formData.workCost,
        totalFunds: formData.fundsCost,
        grandTotal: formData.totalCost
      },
      pricing: formData.useGrading ? formData.priceLevels : {
        margin: formData.simpleMargin,
        price: formData.recommendedPrice
      }
    };

    // Создаём CSV для экспорта
    const csvContent = [
      'Калькуляция товара: ' + formData.name,
      '',
      'МАТЕРИАЛЫ',
      'Название,Единица,Количество,Цена,Стоимость',
      ...formData.materialUsages.map(u => 
        `${u.material.name},${u.material.unit},${u.quantity},${u.material.price},${u.cost}`
      ),
      `Итого материалы:,,,${formData.materialsCost}`,
      '',
      'ВИДЫ РАБОТ',
      'Название,Единица,Количество,Ставка,Стоимость',
      ...formData.workTypeUsages.map(u => 
        `${u.workType.name},${u.workType.unit},${u.quantity},${u.workType.hourlyRate},${u.cost}`
      ),
      `Итого работы:,,,${formData.workCost}`,
      '',
      'ФОНДЫ',
      'Название,Тип,Параметр,Сумма',
      ...formData.fundUsages.map(u => 
        `${u.fund.name},${u.fund.type === 'PERCENT' ? 'Процент' : 'Фикс'},${u.fund.value},${u.value}`
      ),
      `Итого фонды:,,,${formData.fundsCost}`,
      '',
      `ОБЩАЯ СЕБЕСТОИМОСТЬ:,,,${formData.totalCost}`,
      `РЕКОМЕНДУЕМАЯ ЦЕНА:,,,${formData.useGrading ? 
        formData.priceLevels[0]?.price || 0 : formData.recommendedPrice}`,
      `РЕНТАБЕЛЬНОСТЬ:,,,${formData.useGrading ? 
        (formData.priceLevels[0] ? ((formData.priceLevels[0].price - formData.totalCost) / formData.totalCost * 100).toFixed(1) : 0) :
        formData.simpleMargin.toFixed(1)}%`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `калькуляция_${formData.sku || 'товар'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Калькуляция экспортирована',
      description: 'Файл CSV готов для анализа'
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? `Редактирование: ${formData.name || 'Товар'}` : 'Новый товар'}
          </h1>
          {formData.sku && (
            <p className="text-muted-foreground">Артикул: {formData.sku}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportCalculation}
            disabled={loading || formData.totalCost === 0}
          >
            📊 Экспорт
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/products')}
          >
            Отменить
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={loading}
          >
            Сохранить
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={loading}
          >
            Сохранить и опубликовать
          </Button>
        </div>
      </div>

      {/* Вкладки */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Основные
          </TabsTrigger>
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Материалы
          </TabsTrigger>
          <TabsTrigger value="work" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Виды работ
          </TabsTrigger>
          <TabsTrigger value="funds" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Фонды
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Ценообразование
          </TabsTrigger>
        </TabsList>

        {/* Вкладка 1: Основные */}
        <TabsContent value="basic" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Левая колонка */}
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Выбор типа товара - ПЕРВЫЙ ЭЛЕМЕНТ */}
                <div className="space-y-4 border border-gray-200 p-6 rounded-lg bg-gray-50">
                  <div>
                    <Label className="text-lg font-bold text-gray-800">Тип товара *</Label>
                    <p className="text-sm text-gray-600 mb-4">
                      Выберите тип товара для определения метода расчета стоимости
                    </p>
                  </div>
                  
                  {/* Основной селектор типа */}
                  <div className="w-full">
                    <Select
                      name="productType"
                      value={formData.productType || 'STANDARD'}
                      onValueChange={(value: ProductType) => {
                        setFormData(prev => ({ ...prev, productType: value }))
                      }}
                    >
                      <SelectTrigger className="w-full h-12 text-base">
                        <SelectValue placeholder="Выберите тип товара" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STANDARD">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">📦</span>
                            <div>
                              <div className="font-medium">Стандартный товар</div>
                              <div className="text-xs text-muted-foreground">С расчетом по материалам и работам</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="ASSEMBLY">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">🔧</span>
                            <div>
                              <div className="font-medium">Сборный товар</div>
                              <div className="text-xs text-muted-foreground">Состоит из других товаров</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="WAREHOUSE">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">📋</span>
                            <div>
                              <div className="font-medium">Товар со склада</div>
                              <div className="text-xs text-muted-foreground">С фиксированной ценой</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Название *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Введите название товара"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sku">Артикул *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Введите уникальный артикул"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Описание товара"
                    rows={3}
                  />
                </div>
                
                <AdvancedGroupSelector
                  value={getCurrentSelectedValue()}
                  onValueChange={handleGroupSelection}
                  placeholder="Выберите группу или подгруппу"
                  label="Группа товаров"
                  description="Выберите группу или подгруппу для организации товаров"
                />

                <div>
                  <Label htmlFor="saleUnit">Единица продажи *</Label>
                  <Select
                    value={formData.saleUnit}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, saleUnit: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите единицу" />
                    </SelectTrigger>
                    <SelectContent>
                      {units && units.length > 0 ? (
                        units.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name} ({unit.group})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="no-units">
                          Единицы не найдены
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {formData.saleUnit && (
                  <div>
                    <Label htmlFor="baseUnit">Базовая единица расчёта</Label>
                    <Select
                      value={formData.baseUnit}
                      onValueChange={(value) => {
                        const selectedUnit = units.find(u => u.id === value);
                        setFormData(prev => ({
                          ...prev,
                          baseUnit: value,
                          coefficient: selectedUnit?.coefficient || 1
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Если отличается от единицы продажи" />
                      </SelectTrigger>
                      <SelectContent>
                        {units && units.length > 0 ? (
                          units.map(unit => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name} (коэф. {unit.coefficient})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled value="no-units">
                            Единицы не найдены
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Правая колонка - Изображения */}
            <Card>
              <CardHeader>
                <CardTitle>Изображения</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Загрузка изображений */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Button variant="outline">
                        Загрузить изображения
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Перетащите файлы или нажмите для выбора
                    </p>
                  </div>

                  {/* Список загруженных изображений */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Изображение ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== index)
                              }));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {index === formData.mainImageIndex && (
                            <Badge className="absolute bottom-2 left-2">
                              Главное
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Вкладка 2: Материалы */}
        <TabsContent value="materials" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Левая колонка - Список материалов */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Материалы
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить материал
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Поиск */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Поиск материалов..."
                      value={materialSearch}
                      onChange={(e) => setMaterialSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Список материалов */}
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {materials && materials.length > 0 ? (
                      materials
                        .filter(material => 
                          material.name.toLowerCase().includes(materialSearch.toLowerCase())
                        )
                        .map(material => (
                          <div
                            key={material.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedMaterial?.id === material.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedMaterial(material)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{material.name}</p>
                                <p className="text-sm text-gray-500">
                                  {material.unit} • {material.price}₽
                                </p>
                              </div>
                              {material.group && (
                                <Badge variant="outline">{material.group}</Badge>
                              )}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {materials === null ? 'Загрузка...' : 'Материалы не найдены'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Правая колонка - Выбранный материал */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedMaterial ? `Добавить: ${selectedMaterial.name}` : 'Выберите материал'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedMaterial ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Единица измерения</Label>
                        <Input value={selectedMaterial.unit} disabled />
                      </div>
                      <div>
                        <Label>Цена за единицу</Label>
                        <Input value={`${selectedMaterial.price}₽/${selectedMaterial.unit}`} disabled />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="quantity">
                        Необходимое количество ({selectedMaterial.unit})
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.001"
                        placeholder="0"
                        value={materialQuantity}
                        onChange={(e) => setMaterialQuantity(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const quantity = parseFloat(materialQuantity) || 0;
                            if (quantity > 0) {
                              addMaterial(selectedMaterial, quantity);
                              setSelectedMaterial(null);
                              setMaterialQuantity('');
                            }
                          }
                        }}
                      />
                      
                      {/* Контекстная помощь в зависимости от единицы */}
                      <div className="text-sm text-gray-500 mt-1">
                        {selectedMaterial.unit.toLowerCase().includes('кг') || selectedMaterial.unit.toLowerCase().includes('kg') ? (
                          <p>💡 Например: 2.5 (два с половиной килограмма), 0.25 (250 граммов)</p>
                        ) : selectedMaterial.unit.toLowerCase().includes('л') || selectedMaterial.unit.toLowerCase().includes('l') ? (
                          <p>💡 Например: 1.5 (полтора литра), 0.5 (пол-литра)</p>
                        ) : selectedMaterial.unit.toLowerCase().includes('м²') || selectedMaterial.unit.toLowerCase().includes('m²') ? (
                          <p>💡 Например: 2.5 (два с половиной квадратных метра), 0.25 (четверть метра)</p>
                        ) : selectedMaterial.unit.toLowerCase().includes('м³') || selectedMaterial.unit.toLowerCase().includes('m³') ? (
                          <p>💡 Например: 0.5 (половина кубического метра), 1.2 (кубометр двадцать)</p>
                        ) : selectedMaterial.unit.toLowerCase().includes('м') || selectedMaterial.unit.toLowerCase().includes('m') ? (
                          <p>💡 Например: 3.5 (три с половиной метра), 0.8 (восемьдесят сантиметров)</p>
                        ) : selectedMaterial.unit.toLowerCase().includes('шт') || selectedMaterial.unit.toLowerCase().includes('pcs') ? (
                          <p>💡 Например: 5 (пять штук), 12 (дюжина)</p>
                        ) : selectedMaterial.unit.toLowerCase().includes('г') || selectedMaterial.unit.toLowerCase().includes('g') ? (
                          <p>💡 Например: 250 (четверть килограмма), 500 (полкило)</p>
                        ) : selectedMaterial.unit.toLowerCase().includes('мл') || selectedMaterial.unit.toLowerCase().includes('ml') ? (
                          <p>💡 Например: 250 (четверть литра), 500 (пол-литра)</p>
                        ) : (
                          <p>💡 Укажите необходимое количество в единицах "{selectedMaterial.unit}"</p>
                        )}
                      </div>
                    </div>

                    {/* Предварительный расчёт */}
                    {materialQuantity && parseFloat(materialQuantity) > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-blue-700">Предварительный расчёт:</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-blue-600">Количество:</span>
                              <p className="font-medium">{materialQuantity} {selectedMaterial.unit}</p>
                            </div>
                            <div>
                              <span className="text-blue-600">Стоимость:</span>
                              <p className="font-medium">{(parseFloat(materialQuantity) * selectedMaterial.price).toFixed(2)}₽</p>
                            </div>
                          </div>
                          
                          {/* Показать вес/объем в понятном формате */}
                          {selectedMaterial.unit.toLowerCase().includes('г') && parseFloat(materialQuantity) >= 1000 && (
                            <div className="pt-2 border-t border-blue-200">
                              <span className="text-blue-600 text-sm">Также:</span>
                              <p className="font-medium text-sm">
                                {(parseFloat(materialQuantity) / 1000).toFixed(2)} кг
                              </p>
                            </div>
                          )}
                          
                          {selectedMaterial.unit.toLowerCase().includes('мл') && parseFloat(materialQuantity) >= 1000 && (
                            <div className="pt-2 border-t border-blue-200">
                              <span className="text-blue-600 text-sm">Также:</span>
                              <p className="font-medium text-sm">
                                {(parseFloat(materialQuantity) / 1000).toFixed(2)} л
                              </p>
                            </div>
                          )}
                          
                          {selectedMaterial.unit.toLowerCase().includes('см') && parseFloat(materialQuantity) >= 100 && (
                            <div className="pt-2 border-t border-blue-200">
                              <span className="text-blue-600 text-sm">Также:</span>
                              <p className="font-medium text-sm">
                                {(parseFloat(materialQuantity) / 100).toFixed(2)} м
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={() => {
                        const quantity = parseFloat(materialQuantity) || 0;
                        if (quantity > 0) {
                          addMaterial(selectedMaterial, quantity);
                          setSelectedMaterial(null);
                          setMaterialQuantity('');
                        }
                      }}
                      className="w-full"
                      disabled={!selectedMaterial || !materialQuantity || parseFloat(materialQuantity) <= 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить материал
                      {materialQuantity && parseFloat(materialQuantity) > 0 && (
                        <span className="ml-2 text-xs opacity-75">
                          ({(parseFloat(materialQuantity) * selectedMaterial.price).toFixed(0)}₽)
                        </span>
                      )}
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Выберите материал из списка слева
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Добавленные материалы */}
          {formData.materialUsages.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Добавленные материалы</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Материал</TableHead>
                      <TableHead>Количество</TableHead>
                      <TableHead>Расход</TableHead>
                      <TableHead>Цена за единицу</TableHead>
                      <TableHead>Стоимость</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.materialUsages.map((usage, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{usage.material.name}</TableCell>
                        <TableCell>
                          {usage.quantity} {usage.material.unit}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const unit = usage.material.unit.toLowerCase();
                            const quantity = usage.quantity;
                            
                            // Показываем дополнительную информацию о расходе
                            if (unit.includes('г') && quantity >= 1000) {
                              return `${(quantity / 1000).toFixed(2)} кг`;
                            } else if (unit.includes('мл') && quantity >= 1000) {
                              return `${(quantity / 1000).toFixed(2)} л`;
                            } else if (unit.includes('см') && quantity >= 100) {
                              return `${(quantity / 100).toFixed(2)} м`;
                            } else if (unit.includes('м²') || unit.includes('м³')) {
                              return `${quantity} ${usage.material.unit}`;
                            } else if (unit.includes('кг') && quantity < 1) {
                              return `${(quantity * 1000).toFixed(0)} г`;
                            } else if (unit.includes('л') && quantity < 1) {
                              return `${(quantity * 1000).toFixed(0)} мл`;
                            } else {
                              return `${quantity} ${usage.material.unit}`;
                            }
                          })()}
                        </TableCell>
                        <TableCell>{usage.material.price}₽/{usage.material.unit}</TableCell>
                        <TableCell className="font-medium">{usage.cost.toFixed(2)}₽</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeMaterial(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Итого материалы:</span>
                    <span className="text-xl font-bold">{formData.materialsCost.toFixed(2)}₽</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Вкладка 3: Виды работ */}
        <TabsContent value="work" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Левая колонка - Список видов работ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Виды работ
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить вид работ
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Поиск */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Поиск видов работ..."
                      value={workTypeSearch}
                      onChange={(e) => setWorkTypeSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Список видов работ */}
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {workTypes && workTypes.length > 0 ? (
                      workTypes
                        .filter(workType => 
                          workType.name.toLowerCase().includes(workTypeSearch.toLowerCase())
                        )
                        .map(workType => (
                          <div
                            key={workType.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedWorkType?.id === workType.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedWorkType(workType)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{workType.name}</p>
                                <p className="text-sm text-gray-500">
                                  {workType.unit} • {workType.hourlyRate}₽/{workType.unit}
                                </p>
                              </div>
                              {workType.department?.name && (
                                <Badge variant="outline">{workType.department.name}</Badge>
                              )}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {workTypes === null ? 'Загрузка...' : 'Виды работ не найдены'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Правая колонка - Выбранный вид работ */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedWorkType ? `Добавить: ${selectedWorkType.name}` : 'Выберите вид работ'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedWorkType ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Единица измерения</Label>
                        <Input value={selectedWorkType.unit} disabled />
                      </div>
                      <div>
                        <Label>Ставка за единицу</Label>
                        <Input value={`${selectedWorkType.hourlyRate}₽/${selectedWorkType.unit}`} disabled />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="workQuantity">
                        Необходимое количество ({selectedWorkType.unit})
                      </Label>
                      <Input
                        id="workQuantity"
                        type="number"
                        step="0.001"
                        placeholder="0"
                        value={workQuantity}
                        onChange={(e) => setWorkQuantity(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const quantity = parseFloat(workQuantity) || 0;
                            if (quantity > 0) {
                              addWorkType(selectedWorkType, quantity);
                              setSelectedWorkType(null);
                              setWorkQuantity('');
                            }
                          }
                        }}
                      />
                      
                      {/* Контекстная помощь в зависимости от единицы */}
                      <div className="text-sm text-gray-500 mt-1">
                        {selectedWorkType.unit.toLowerCase().includes('час') ? (
                          <p>💡 Например: 2.5 (два с половиной часа), 0.25 (15 минут)</p>
                        ) : selectedWorkType.unit.toLowerCase().includes('мин') ? (
                          <p>💡 Например: 30 (полчаса), 90 (полтора часа)</p>
                        ) : selectedWorkType.unit.toLowerCase().includes('шт') ? (
                          <p>💡 Например: 1 (одна операция), 3 (три операции)</p>
                        ) : selectedWorkType.unit.toLowerCase().includes('м') ? (
                          <p>💡 Например: 2.5 (два с половиной метра), 0.5 (полметра)</p>
                        ) : (
                          <p>💡 Укажите необходимое количество в единицах "{selectedWorkType.unit}"</p>
                        )}
                      </div>
                    </div>

                    {/* Предварительный расчёт */}
                    {workQuantity && parseFloat(workQuantity) > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-blue-700">Предварительный расчёт:</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-blue-600">Количество:</span>
                              <p className="font-medium">{workQuantity} {selectedWorkType.unit}</p>
                            </div>
                            <div>
                              <span className="text-blue-600">Стоимость:</span>
                              <p className="font-medium">{(parseFloat(workQuantity) * selectedWorkType.hourlyRate).toFixed(2)}₽</p>
                            </div>
                          </div>
                          
                          {/* Показать время в понятном формате для временных единиц */}
                          {selectedWorkType.unit.toLowerCase().includes('час') && (
                            <div className="pt-2 border-t border-blue-200">
                              <span className="text-blue-600 text-sm">Время работы:</span>
                              <p className="font-medium text-sm">
                                {(() => {
                                  const hours = parseFloat(workQuantity);
                                  const wholeHours = Math.floor(hours);
                                  const minutes = Math.round((hours - wholeHours) * 60);
                                  
                                  if (wholeHours === 0) {
                                    return `${minutes} мин`;
                                  } else if (minutes === 0) {
                                    return `${wholeHours} ч`;
                                  } else {
                                    return `${wholeHours} ч ${minutes} мин`;
                                  }
                                })()}
                              </p>
                            </div>
                          )}
                          
                          {selectedWorkType.unit.toLowerCase().includes('мин') && (
                            <div className="pt-2 border-t border-blue-200">
                              <span className="text-blue-600 text-sm">Время работы:</span>
                              <p className="font-medium text-sm">
                                {(() => {
                                  const totalMinutes = parseFloat(workQuantity);
                                  const hours = Math.floor(totalMinutes / 60);
                                  const minutes = totalMinutes % 60;
                                  
                                  if (hours === 0) {
                                    return `${minutes} мин`;
                                  } else {
                                    return `${hours} ч ${minutes} мин`;
                                  }
                                })()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={() => {
                        const quantity = parseFloat(workQuantity) || 0;
                        if (quantity > 0) {
                          addWorkType(selectedWorkType, quantity);
                          setSelectedWorkType(null);
                          setWorkQuantity('');
                        }
                      }}
                      className="w-full"
                      disabled={!selectedWorkType || !workQuantity || parseFloat(workQuantity) <= 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить вид работ
                      {workQuantity && parseFloat(workQuantity) > 0 && (
                        <span className="ml-2 text-xs opacity-75">
                          ({(parseFloat(workQuantity) * selectedWorkType.hourlyRate).toFixed(0)}₽)
                        </span>
                      )}
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Выберите вид работ из списка слева
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Добавленные виды работ */}
          {formData.workTypeUsages.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Добавленные виды работ</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Вид работ</TableHead>
                      <TableHead>Количество</TableHead>
                      <TableHead>Время работы</TableHead>
                      <TableHead>Ставка</TableHead>
                      <TableHead>Стоимость</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.workTypeUsages.map((usage, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{usage.workType.name}</TableCell>
                        <TableCell>
                          {usage.quantity} {usage.workType.unit}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const unit = usage.workType.unit.toLowerCase();
                            const quantity = usage.quantity;
                            
                            if (unit.includes('час')) {
                              const hours = Math.floor(quantity);
                              const minutes = Math.round((quantity - hours) * 60);
                              
                              if (hours === 0) {
                                return `${minutes} мин`;
                              } else if (minutes === 0) {
                                return `${hours} ч`;
                              } else {
                                return `${hours} ч ${minutes} мин`;
                              }
                            } else if (unit.includes('мин')) {
                              const totalMinutes = quantity;
                              const hours = Math.floor(totalMinutes / 60);
                              const minutes = totalMinutes % 60;
                              
                              if (hours === 0) {
                                return `${minutes} мин`;
                              } else {
                                return `${hours} ч ${minutes} мин`;
                              }
                            } else {
                              return '—';
                            }
                          })()}
                        </TableCell>
                        <TableCell>{usage.workType.hourlyRate}₽/{usage.workType.unit}</TableCell>
                        <TableCell className="font-medium">{usage.cost.toFixed(2)}₽</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeWorkType(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="mt-4 space-y-3">
                  {/* Общее время работы */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-700">Общее время работы:</span>
                      <span className="text-lg font-bold text-blue-700">
                        {(() => {
                          // Считаем общее время в часах
                          const totalHours = formData.workTypeUsages.reduce((total, usage) => {
                            const unit = usage.workType.unit.toLowerCase();
                            if (unit.includes('час')) {
                              return total + usage.quantity;
                            } else if (unit.includes('мин')) {
                              return total + (usage.quantity / 60);
                            }
                            return total;
                          }, 0);
                          
                          if (totalHours === 0) return '—';
                          
                          const hours = Math.floor(totalHours);
                          const minutes = Math.round((totalHours - hours) * 60);
                          
                          if (hours === 0) {
                            return `${minutes} мин`;
                          } else if (minutes === 0) {
                            return `${hours} ч`;
                          } else {
                            return `${hours} ч ${minutes} мин`;
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Общая стоимость */}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Итого работы:</span>
                      <span className="text-xl font-bold">{formData.workCost.toFixed(2)}₽</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Вкладка 4: Фонды */}
        <TabsContent value="funds" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Левая колонка - Список фондов */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Фонды
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить фонд
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Поиск */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Поиск фондов..."
                      value={fundSearch}
                      onChange={(e) => setFundSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Список фондов */}
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {funds && funds.length > 0 ? (
                      funds
                        .filter(fund => 
                          fund.name.toLowerCase().includes(fundSearch.toLowerCase())
                        )
                        .map(fund => (
                          <div
                            key={fund.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedFund?.id === fund.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedFund(fund)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{fund.name}</p>
                                <p className="text-sm text-gray-500">
                                  {fund.description || 'Общий фонд'}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                {fund.fundType && (
                                  <Badge variant="outline">{fund.fundType}</Badge>
                                )}
                                <Badge variant="secondary">
                                  {fund.totalAmount.toLocaleString()}₽
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {funds === null ? 'Загрузка...' : 'Фонды не найдены'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Правая колонка - Выбранный фонд */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedFund ? `Добавить: ${selectedFund.name}` : 'Выберите фонд'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedFund ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Тип фонда</Label>
                        <Input 
                          value={selectedFund.fundType || 'Общий'} 
                          disabled 
                        />
                      </div>
                      <div>
                        <Label>Общая сумма</Label>
                        <Input 
                          value={`${selectedFund.totalAmount.toLocaleString()}₽`} 
                          disabled 
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="fundPercentage">Процент от прямых затрат (%)</Label>
                      <Input
                        id="fundPercentage"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="Введите процент (например, 15)"
                        value={fundPercentage}
                        onChange={(e) => setFundPercentage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const percentage = parseFloat(fundPercentage) || 0;
                            if (percentage > 0) {
                              addFund(selectedFund, percentage);
                              setSelectedFund(null);
                              setFundPercentage('');
                            }
                          }
                        }}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Процент будет применён к сумме материалов + работ
                      </p>
                    </div>

                    {fundPercentage && parseFloat(fundPercentage) > 0 && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Предварительный расчёт:</p>
                          <p className="text-sm text-gray-600">
                            Прямые затраты: {(formData.materialsCost + formData.workCost).toFixed(2)}₽
                          </p>
                          <p className="text-sm text-gray-600">
                            {fundPercentage}% = {((formData.materialsCost + formData.workCost) * parseFloat(fundPercentage) / 100).toFixed(2)}₽
                          </p>
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={() => {
                        const percentage = parseFloat(fundPercentage) || 0;
                        if (percentage > 0) {
                          addFund(selectedFund, percentage);
                          setSelectedFund(null);
                          setFundPercentage('');
                        }
                      }}
                      className="w-full"
                      disabled={!selectedFund || !fundPercentage || parseFloat(fundPercentage) <= 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить фонд ({fundPercentage}%)
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Выберите фонд из списка слева
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Добавленные фонды */}
          {formData.fundUsages.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Добавленные фонды</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Фонд</TableHead>
                      <TableHead>Процент</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.fundUsages.map((usage, index) => (
                      <TableRow key={index}>
                        <TableCell>{usage.fund.name}</TableCell>
                        <TableCell>{usage.percentage}%</TableCell>
                        <TableCell>
                          {((formData.materialsCost + formData.workCost) * usage.percentage / 100).toFixed(2)}₽
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFund(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Итого фонды:</span>
                    <span className="text-xl font-bold">{formData.fundsCost.toLocaleString()}₽</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Вкладка 5: Ценообразование */}
        <TabsContent value="pricing" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Левая колонка - Анализ затрат */}
            <Card>
              <CardHeader>
                <CardTitle>Анализ затрат</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Разбивка затрат */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span>Материалы</span>
                    <span className="font-medium">{formData.materialsCost.toFixed(2)}₽</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span>Работы</span>
                    <span className="font-medium">{formData.workCost.toFixed(2)}₽</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span>Фонды</span>
                    <span className="font-medium">{formData.fundsCost.toFixed(2)}₽</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                    <span className="font-semibold">Общая себестоимость</span>
                    <span className="text-xl font-bold">{formData.totalCost.toFixed(2)}₽</span>
                  </div>
                </div>

                {/* Быстрые кнопки наценки */}
                <div className="space-y-2">
                  <Label>Быстрые наценки</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[15, 20, 25, 30].map(margin => (
                      <Button
                        key={margin}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newPrice = formData.totalCost * (1 + margin / 100);
                          setFormData(prev => ({
                            ...prev,
                            simpleMargin: margin,
                            recommendedPrice: newPrice
                          }));
                        }}
                        className={formData.simpleMargin === margin ? 'border-blue-500 bg-blue-50' : ''}
                      >
                        {margin}% ({(formData.totalCost * (1 + margin / 100)).toFixed(0)}₽)
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Правая колонка - Ценообразование */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Установка цены
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Переключатель типа ценообразования */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="useGrading"
                    checked={formData.useGrading}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, useGrading: checked }))
                    }
                  />
                  <Label htmlFor="useGrading">Использовать градацию цен</Label>
                </div>

                {!formData.useGrading ? (
                  /* Простое ценообразование */
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="simpleMargin">Наценка (%)</Label>
                      <Input
                        id="simpleMargin"
                        type="number"
                        step="0.1"
                        value={formData.simpleMargin}
                        onChange={(e) => {
                          const margin = parseFloat(e.target.value) || 0;
                          const newPrice = formData.totalCost * (1 + margin / 100);
                          setFormData(prev => ({
                            ...prev,
                            simpleMargin: margin,
                            recommendedPrice: newPrice
                          }));
                        }}
                      />
                    </div>

                    <div>
                      <Label htmlFor="recommendedPrice">Рекомендуемая цена</Label>
                      <Input
                        id="recommendedPrice"
                        type="number"
                        step="0.01"
                        value={formData.recommendedPrice}
                        onChange={(e) => {
                          const price = parseFloat(e.target.value) || 0;
                          const margin = formData.totalCost > 0 ? ((price / formData.totalCost) - 1) * 100 : 0;
                          setFormData(prev => ({
                            ...prev,
                            recommendedPrice: price,
                            simpleMargin: margin
                          }));
                        }}
                      />
                    </div>

                    {/* Анализ прибыльности */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                      <h4 className="font-medium mb-2">Анализ прибыльности</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Прибыль с единицы:</span>
                          <span className="font-medium">
                            {(formData.recommendedPrice - formData.totalCost).toFixed(2)}₽
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Рентабельность:</span>
                          <span className="font-medium">
                            {formData.totalCost > 0 ? 
                              ((formData.recommendedPrice - formData.totalCost) / formData.totalCost * 100).toFixed(1) : 0
                            }%
                          </span>
                        </div>
                        {formData.simpleMargin < 15 && (
                          <div className="text-orange-600 text-xs mt-2">
                            ⚠️ Низкая наценка может быть нерентабельной
                          </div>
                        )}
                        {formData.simpleMargin >= 25 && (
                          <div className="text-green-600 text-xs mt-2">
                            ✅ Хорошая рентабельность
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Градационное ценообразование */
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Уровни цен</Label>
                      <Button 
                        size="sm"
                        onClick={() => {
                          const newLevel: PriceLevel = {
                            minQuantity: 1,
                            markup: 20,
                            price: formData.totalCost * 1.2
                          };
                          setFormData(prev => ({
                            ...prev,
                            priceLevels: [...prev.priceLevels, newLevel]
                          }));
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Добавить уровень
                      </Button>
                    </div>

                    {formData.priceLevels.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        Добавьте уровни цен для разных объёмов заказа
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.priceLevels.map((level, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              <div>
                                <Label className="text-xs">От (шт)</Label>
                                <Input
                                  type="number"
                                  value={level.minQuantity}
                                  onChange={(e) => {
                                    const quantity = parseInt(e.target.value) || 1;
                                    const updatedLevels = [...formData.priceLevels];
                                    updatedLevels[index].minQuantity = quantity;
                                    setFormData(prev => ({ ...prev, priceLevels: updatedLevels }));
                                  }}
                                  size={1}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Наценка (%)</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={level.markup}
                                  onChange={(e) => {
                                    const markup = parseFloat(e.target.value) || 0;
                                    const price = formData.totalCost * (1 + markup / 100);
                                    const updatedLevels = [...formData.priceLevels];
                                    updatedLevels[index] = { ...level, markup, price };
                                    setFormData(prev => ({ ...prev, priceLevels: updatedLevels }));
                                  }}
                                  size={1}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Цена (₽)</Label>
                                <div className="flex gap-1">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={level.price}
                                    onChange={(e) => {
                                      const price = parseFloat(e.target.value) || 0;
                                      const markup = formData.totalCost > 0 ? ((price / formData.totalCost) - 1) * 100 : 0;
                                      const updatedLevels = [...formData.priceLevels];
                                      updatedLevels[index] = { ...level, markup, price };
                                      setFormData(prev => ({ ...prev, priceLevels: updatedLevels }));
                                    }}
                                    size={1}
                                  />
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      const updatedLevels = formData.priceLevels.filter((_, i) => i !== index);
                                      setFormData(prev => ({ ...prev, priceLevels: updatedLevels }));
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              Прибыль: {(level.price - formData.totalCost).toFixed(2)}₽ 
                              ({formData.totalCost > 0 ? ((level.price - formData.totalCost) / formData.totalCost * 100).toFixed(1) : 0}%)
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Итоговая сводка */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Финальная сводка</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formData.totalCost.toFixed(2)}₽
                  </div>
                  <div className="text-sm text-blue-600">Себестоимость</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formData.useGrading 
                      ? (formData.priceLevels[0]?.price?.toFixed(2) || '0.00')
                      : formData.recommendedPrice.toFixed(2)
                    }₽
                  </div>
                  <div className="text-sm text-green-600">
                    {formData.useGrading ? 'Цена (базовая)' : 'Рекомендуемая цена'}
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formData.useGrading 
                      ? (formData.priceLevels[0] ? 
                          ((formData.priceLevels[0].price - formData.totalCost) / formData.totalCost * 100).toFixed(1) 
                          : '0.0')
                      : formData.simpleMargin.toFixed(1)
                    }%
                  </div>
                  <div className="text-sm text-orange-600">Рентабельность</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

