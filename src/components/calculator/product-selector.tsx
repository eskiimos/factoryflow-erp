'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Search, ArrowLeft, Package } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

// Тип для продукта из API
interface Product {
  id: string;
  name: string;
  description?: string;
  unit: string;
  sellingPrice: number;
  group: {
    id: string;
    name: string;
  } | null;
  subgroup: {
    id: string;
    name: string;
  } | null;
  currentStock: number;
  // Данные для калькулятора (может быть в specifications или отдельно)
  specifications?: any;
  calculationData?: {
    width?: number;
    height?: number;
    thickness?: number;
    material?: string;
    [key: string]: any;
  };
}

interface ProductSelectorProps {
  onSelect: (product: Product) => void;
  onBack: () => void;
}

// API для получения продуктов
const fetchProductsAPI = async (): Promise<Product[]> => {
  try {
    const response = await fetch('/api/products?showAll=true');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    return data.data || []; // Изменено с data.products на data.data
  } catch (error) {
    console.error('Error fetching products:', error);
    // Fallback на mock данные
    return [
      {
        id: '1',
        name: 'Вывеска из ПВХ 5мм',
        description: 'Стандартная вывеска из листа ПВХ толщиной 5мм',
        unit: 'шт',
        sellingPrice: 2500,
        group: { id: '1', name: 'Вывески' },
        subgroup: null,
        currentStock: 10,
        calculationData: {
          width: 1200,
          height: 600,
          thickness: 5,
          material: 'pvc_5mm'
        }
      },
      {
        id: '2',
        name: 'Баннер промо',
        description: 'Рекламный баннер для наружной рекламы',
        unit: 'шт',
        sellingPrice: 1800,
        group: { id: '2', name: 'Баннеры' },
        subgroup: null,
        currentStock: 5,
        calculationData: {
          width: 3000,
          height: 1000,
          material: 'banner_440g'
        }
      },
      {
        id: '3',
        name: 'Табличка офисная',
        description: 'Информационная табличка для офиса',
        unit: 'шт',
        sellingPrice: 450,
        group: { id: '3', name: 'Таблички' },
        subgroup: null,
        currentStock: 25,
        calculationData: {
          width: 300,
          height: 100,
          thickness: 3,
          material: 'plastic_3mm'
        }
      }
    ];
  }
};

export function ProductSelector({ onSelect, onBack }: ProductSelectorProps) {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const fetchedProducts = await fetchProductsAPI();
        console.log('Fetched products:', fetchedProducts);
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        toast({
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить список товаров.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [toast]);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.group?.name && product.group.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleProductSelect = (product: Product) => {
    onSelect(product);
    toast({
      title: 'Товар выбран',
      description: `Выбран товар: ${product.name}`,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Загрузка товаров...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Шаг 1: Выбор товара</CardTitle>
            <CardDescription>
              Выберите существующий товар для расчета стоимости
            </CardDescription>
          </div>
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск товаров..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Список товаров */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Товары не найдены</p>
                {searchTerm && (
                  <p className="text-sm">Попробуйте изменить условия поиска</p>
                )}
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                  onClick={() => handleProductSelect(product)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <div className="text-right">
                        <div className="font-bold text-lg text-primary">
                          {product.sellingPrice.toLocaleString('ru-RU')} ₽
                        </div>
                        <div className="text-xs text-muted-foreground">
                          за {product.unit}
                        </div>
                      </div>
                    </div>
                    
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        {product.group && (
                          <Badge variant="secondary">
                            {product.group.name}
                          </Badge>
                        )}
                        <Badge variant="outline">
                          Склад: {product.currentStock} {product.unit}
                        </Badge>
                      </div>
                      
                      {product.calculationData && (
                        <Badge variant="default">
                          Есть данные для расчета
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {filteredProducts.length > 0 && (
          <div className="text-sm text-muted-foreground text-center pt-2">
            Найдено товаров: {filteredProducts.length}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
