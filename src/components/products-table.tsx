'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Filter, Download, Upload, MoreHorizontal, Edit, Trash2, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useProductsTableColumns } from '@/hooks/use-products-table-columns';
import { ProductsTablePresets } from '@/components/products-table-presets';
import { Product, ProductWithDetails } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

interface ProductsTableProps {
  products?: Product[]; // Внешний список товаров (опциональный)
  selectedProducts?: Product[];
  onSelectionChange?: (products: Product[]) => void;
  onProductsChange?: () => void; // Callback для обновления после изменений
}

export function ProductsTable({
  products: externalProducts,
  selectedProducts,
  onSelectionChange,
  onProductsChange,
}: ProductsTableProps) {
  const [internalProducts, setInternalProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const { getVisibleColumns } = useProductsTableColumns();
  const visibleColumns = getVisibleColumns().filter(col => col.visible).map(col => col.id);

  // Используем внешние товары если переданы, иначе загружаем сами
  const products = externalProducts || internalProducts;

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products?showAll=true');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      console.log('API response:', data);
      
      let productsData = [];
      
      // Проверяем структуру ответа API
      if (data.data && Array.isArray(data.data)) {
        // Для параметра showAll=true API возвращает {data: [...]}
        productsData = data.data;
      } else if (data.products && Array.isArray(data.products)) {
        // Для пагинации API возвращает {products: [...], pagination: {...}}
        productsData = data.products;
      } else if (Array.isArray(data)) {
        // На случай, если API напрямую вернет массив
        productsData = data;
      } else {
        console.error('Неожиданный формат ответа API:', data);
        toast({
          variant: 'error',
          title: 'Ошибка формата данных',
          description: 'Сервер вернул данные в неизвестном формате',
        });
      }
      
      // Проверка данных продуктов
      if (productsData.length === 0) {
        console.log('API вернул пустой список продуктов');
      } else {
        console.log(`Загружено ${productsData.length} продуктов`);
      }
      
      setInternalProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setInternalProducts([]);
      toast({
        variant: 'error',
        title: 'Ошибка загрузки данных',
        description: 'Не удалось загрузить продукты. Пожалуйста, обновите страницу или попробуйте позже.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Загружаем товары только если не переданы извне
    if (!externalProducts) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [externalProducts, fetchProducts]);

  // Filter products based on search term
  const filteredProducts = (products || []).filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelectedIds = filteredProducts.map(p => p.id);
      setSelectedIds(newSelectedIds);
      onSelectionChange?.(filteredProducts);
    } else {
      setSelectedIds([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelectProduct = (product: Product, checked: boolean) => {
    const newSelectedIds = checked
      ? [...selectedIds, product.id]
      : selectedIds.filter(id => id !== product.id);
    
    setSelectedIds(newSelectedIds);
    const selectedProducts = products.filter(p => newSelectedIds.includes(p.id));
    onSelectionChange?.(selectedProducts);
  };

  // Handle product actions
  const handleEdit = (product: Product) => {
    router.push(`/products/${product.id}/edit`);
  };

  const handleRowClick = (product: Product) => {
    router.push(`/products/${product.id}/edit`);
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`Вы уверены, что хотите удалить "${product.name}"?`)) {
      try {
        const response = await fetch(`/api/products/${product.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete product');
        }
        
        toast({
          title: 'Товар удален успешно'
        });
        if (onProductsChange) {
          onProductsChange(); // Вызываем callback для обновления внешнего списка
        } else {
          fetchProducts(); // Обновляем внутренний список
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast({
          variant: 'error',
          title: 'Ошибка удаления товара',
          description: 'Пожалуйста, попробуйте еще раз'
        });
      }
    }
  };

  const handleCalculateCost = async (product: Product) => {
    try {
      const response = await fetch('/api/products/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to calculate cost');
      }
      
      const calculation = await response.json();
      toast({
        variant: 'success',
        title: 'Стоимость рассчитана',
        description: `Общая стоимость: ${calculation.totalCost.toFixed(2)} ${calculation.currency}`
      });
    } catch (error) {
      console.error('Error calculating cost:', error);
      toast({
        variant: 'error',
        title: 'Ошибка расчета стоимости',
        description: 'Пожалуйста, попробуйте еще раз'
      });
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? 'Активен' : 'Неактивен'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Товары</CardTitle>
          <CardDescription>Загрузка товаров...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ProductsTablePresets 
              columns={getVisibleColumns()} 
              onApplyPreset={() => {
                // Handle preset application
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
            </Button>
            <Button
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
            <Button
              size="sm"
              onClick={() => window.location.href = '/products/create'}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить товар
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск товаров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center space-x-2 mb-4 p-2 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium">
              Выбрано {selectedIds.length}
            </span>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Массовое редактирование
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить выбранные
            </Button>
          </div>
        )}

        {/* Products Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === filteredProducts.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                {visibleColumns.includes('name') && (
                  <TableHead>Название</TableHead>
                )}
                {visibleColumns.includes('description') && (
                  <TableHead>Описание</TableHead>
                )}
                {visibleColumns.includes('category') && (
                  <TableHead>Категория</TableHead>
                )}
                {visibleColumns.includes('sellingPrice') && (
                  <TableHead>Цена продажи</TableHead>
                )}
                {visibleColumns.includes('totalCost') && (
                  <TableHead>Общая стоимость</TableHead>
                )}
                {visibleColumns.includes('status') && (
                  <TableHead>Статус</TableHead>
                )}
                {visibleColumns.includes('createdAt') && (
                  <TableHead>Создан</TableHead>
                )}
                <TableHead className="w-12">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-gray-500">
                      {searchTerm ? 'Товары не найдены по вашему запросу.' : 'Товары не найдены.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow 
                    key={product.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(product.id)}
                        onCheckedChange={(checked) => handleSelectProduct(product, checked as boolean)}
                      />
                    </TableCell>
                    {visibleColumns.includes('name') && (
                      <TableCell className="font-medium">
                        <Link 
                          href={`/products/${product.id}/edit`}
                          className="hover:underline text-blue-600 hover:text-blue-800"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {product.name}
                        </Link>
                      </TableCell>
                    )}
                    {visibleColumns.includes('description') && (
                      <TableCell>{product.description || '-'}</TableCell>
                    )}
                    {visibleColumns.includes('category') && (
                      <TableCell>{product.category?.name || '-'}</TableCell>
                    )}
                    {visibleColumns.includes('sellingPrice') && (
                      <TableCell>
                        {product.sellingPrice ? formatCurrency(product.sellingPrice, product.currency) : '-'}
                      </TableCell>
                    )}
                    {visibleColumns.includes('totalCost') && (
                      <TableCell>
                        {product.totalCost ? formatCurrency(product.totalCost, product.currency) : '-'}
                      </TableCell>
                    )}
                    {visibleColumns.includes('status') && (
                      <TableCell>{getStatusBadge(product.isActive)}</TableCell>
                    )}
                    {visibleColumns.includes('createdAt') && (
                      <TableCell>
                        {new Date(product.createdAt).toLocaleDateString()}
                      </TableCell>
                    )}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCalculateCost(product)}>
                            <Calculator className="h-4 w-4 mr-2" />
                            Рассчитать стоимость
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(product)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Показано {filteredProducts.length} из {products.length} товаров
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Назад
            </Button>
            <Button variant="outline" size="sm" disabled>
              Далее
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
