'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit, Trash2, MoreHorizontal, Package, Plus, Search, Move, Check, X, Box, Layers, Warehouse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Product, ProductType } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { TableControls, ColumnVisibility } from '@/components/table-controls';
import { TableSearch } from '@/components/table-search';
import { MoveToGroupDialog } from '@/components/move-to-group-dialog';
import { MoveProductsModal } from '@/components/move-products-modal';

interface SimpleProductsTableProps {
  products?: Product[];
  onProductsChange?: () => void;
}

// Определение колонок таблицы
const TABLE_COLUMNS = [
  { key: 'name', label: 'Название', required: true },
  { key: 'type', label: 'Тип', required: false },
  { key: 'sku', label: 'Артикул', required: false },
  { key: 'description', label: 'Описание', required: false },
  { key: 'sellingPrice', label: 'Цена продажи', required: true },
  { key: 'totalCost', label: 'Общая стоимость', required: false },
  { key: 'status', label: 'Статус', required: false },
  { key: 'createdAt', label: 'Создан', required: false },
  { key: 'actions', label: 'Действия', required: true },
];

export function SimpleProductsTable({
  products: externalProducts,
  onProductsChange,
}: SimpleProductsTableProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(!externalProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(() => {
    // По умолчанию все столбцы видимы
    const defaultVisibility: ColumnVisibility = {};
    TABLE_COLUMNS.forEach(column => {
      defaultVisibility[column.key] = true;
    });
    return defaultVisibility;
  });
  const router = useRouter();
  const { toast } = useToast();

  // Функция для получения информации о типе товара
  const getProductTypeInfo = (type: ProductType) => {
    switch (type) {
      case ProductType.STANDARD:
        return {
          label: 'Стандартный',
          icon: Box,
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-100'
        };
      case ProductType.ASSEMBLY:
        return {
          label: 'Сборный',
          icon: Layers,
          variant: 'secondary' as const,
          className: 'bg-purple-100 text-purple-800 hover:bg-purple-100'
        };
      case ProductType.WAREHOUSE:
        return {
          label: 'Складской',
          icon: Warehouse,
          variant: 'secondary' as const,
          className: 'bg-green-100 text-green-800 hover:bg-green-100'
        };
      default:
        return {
          label: 'Неизвестный',
          icon: Package,
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
        };
    }
  };

  // Загружаем настройки столбцов из localStorage после монтирования
  useEffect(() => {
    const saved = localStorage.getItem('products-table-columns');
    if (saved) {
      try {
        setColumnVisibility(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading column visibility:', error);
      }
    }
  }, []);

  // Сохраняем настройки столбцов в localStorage
  useEffect(() => {
    localStorage.setItem('products-table-columns', JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  // Загрузка товаров, если не переданы извне
  useEffect(() => {
    if (externalProducts) {
      setProducts(externalProducts);
      setLoading(false);
    } else {
      fetchProducts();
    }
  }, [externalProducts]);

  // Фильтрация товаров по поисковому запросу
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      (product.sku && product.sku.toLowerCase().includes(query)) ||
      (product.description && product.description.toLowerCase().includes(query)) ||
      (product.group?.name && product.group.name.toLowerCase().includes(query))
    );
    
    setFilteredProducts(filtered);
  }, [products, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products?showAll=true');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить товары",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/product-groups');
      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }
      const data = await response.json();
      setGroups(data.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  // Загружаем группы при монтировании компонента
  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить товар "${productName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      toast({
        title: "Успешно",
        description: "Товар удален"
      });

      // Обновляем список товаров
      if (onProductsChange) {
        onProductsChange();
      } else {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар",
        variant: "destructive"
      });
    }
  };

  // Функции для работы с выделением товаров
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      const allIds = new Set(filteredProducts.map(product => product.id));
      setSelectedProducts(allIds);
    }
  };

  const handleMoveProducts = () => {
    if (selectedProducts.size === 0) {
      toast({
        title: "Внимание", 
        description: "Выберите товары для перемещения",
        variant: "destructive"
      });
      return;
    }
    setMoveModalOpen(true);
  };

  const handleProductsMoved = () => {
    // Сбрасываем выделение
    setSelectedProducts(new Set());
    setSelectionMode(false);
    
    // Обновляем список товаров
    if (onProductsChange) {
      onProductsChange();
    } else {
      fetchProducts();
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency === 'USD' ? 'RUB' : currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Загрузка товаров...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center p-8 text-center">
        <Package className="h-16 w-16 mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold mb-2">Нет товаров</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          Создайте первый товар для начала работы с системой управления производством
        </p>
        <Button onClick={() => router.push('/products/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Создать товар
        </Button>
      </div>
    );
  }

  const displayProducts = filteredProducts;

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar with search and controls */}
      <div className="flex-shrink-0 p-4 border-b border-border/10 space-y-4">
        {/* Search */}
        <TableSearch
          placeholder="Поиск по названию, артикулу, описанию..."
          onSearch={handleSearch}
          className="w-full"
        />
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {searchQuery ? (
                <>Найдено: <span className="font-medium">{displayProducts.length}</span> из {products.length}</>
              ) : (
                <>Всего товаров: <span className="font-medium">{products.length}</span></>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
              📦 Используйте вкладку "Группы" для организации товаров
            </div>
            
            {/* Кнопка режима выделения */}
            <Button
              variant={selectionMode ? "default" : "outline"}
              size="sm"
              onClick={toggleSelectionMode}
              className="gap-2"
            >
              {selectionMode ? <Check className="h-4 w-4" /> : <Package className="h-4 w-4" />}
              {selectionMode ? "Выйти из режима выделения" : "Режим выделения"}
            </Button>
          </div>
          
          <TableControls
            columns={TABLE_COLUMNS}
            visibility={columnVisibility}
            onVisibilityChange={setColumnVisibility}
          />
        </div>

        {/* Панель массовых действий */}
        {selectionMode && selectedProducts.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Выбрано товаров: {selectedProducts.size}
              </span>
              <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                💡 Используйте вкладку "Группы" для перемещения
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleMoveProducts}
                size="sm"
                disabled={selectedProducts.size === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Move className="h-4 w-4 mr-2" />
                Переместить ({selectedProducts.size})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProducts(new Set())}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-4 w-4" />
                Очистить
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table content */}
      {searchQuery && displayProducts.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center p-8 text-center">
          <Search className="h-16 w-16 mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">Ничего не найдено</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            Попробуйте изменить поисковый запрос или очистить фильтры
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow className="border-b">
                {selectionMode && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                {columnVisibility.name && <TableHead className="font-semibold">Название</TableHead>}
                {columnVisibility.type && <TableHead className="font-semibold">Тип</TableHead>}
                {columnVisibility.sku && <TableHead className="font-semibold">Артикул</TableHead>}
                {columnVisibility.description && <TableHead className="font-semibold">Описание</TableHead>}
                {columnVisibility.sellingPrice && <TableHead className="font-semibold text-right">Цена продажи</TableHead>}
                {columnVisibility.totalCost && <TableHead className="font-semibold text-right">Общая стоимость</TableHead>}
                {columnVisibility.status && <TableHead className="font-semibold text-center">Статус</TableHead>}
                {columnVisibility.createdAt && <TableHead className="font-semibold">Создан</TableHead>}
                {columnVisibility.actions && <TableHead className="w-12"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayProducts.map((product) => (
              <TableRow 
                key={product.id} 
                className={`hover:bg-muted/50 transition-colors ${selectedProducts.has(product.id) ? 'bg-blue-50/50' : ''}`}
              >
                {selectionMode && (
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={() => handleSelectProduct(product.id)}
                    />
                  </TableCell>
                )}
                {columnVisibility.name && (
                  <TableCell className="font-medium">
                    <Link 
                      href={`/products/${product.id}/edit`}
                      className="hover:underline text-primary hover:text-primary/80 transition-colors"
                    >
                      {product.name}
                    </Link>
                  </TableCell>
                )}
                {columnVisibility.type && (
                  <TableCell>
                    {(() => {
                      const typeInfo = getProductTypeInfo(product.productType || ProductType.STANDARD);
                      const IconComponent = typeInfo.icon;
                      return (
                        <Badge variant={typeInfo.variant} className={typeInfo.className}>
                          <IconComponent className="h-3 w-3 mr-1" />
                          {typeInfo.label}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                )}
                {columnVisibility.sku && (
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {product.sku || '-'}
                  </TableCell>
                )}
                {columnVisibility.description && (
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {product.description || '-'}
                  </TableCell>
                )}
                {columnVisibility.sellingPrice && (
                  <TableCell className="text-right font-medium">
                    {product.sellingPrice ? (
                      <span className="text-green-600">
                        {formatCurrency(product.sellingPrice, product.currency)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                )}
                {columnVisibility.totalCost && (
                  <TableCell className="text-right">
                    {product.totalCost ? (
                      <span className="text-orange-600">
                        {formatCurrency(product.totalCost, product.currency)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                )}
                {columnVisibility.status && (
                  <TableCell className="text-center">
                    <Badge 
                      variant={product.isActive ? 'default' : 'secondary'}
                      className={product.isActive ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                    >
                      {product.isActive ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </TableCell>
                )}
                {columnVisibility.createdAt && (
                  <TableCell className="text-muted-foreground">
                    {new Date(product.createdAt).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </TableCell>
                )}
                {columnVisibility.actions && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => router.push(`/products/${product.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(product.id, product.name)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      )}

      {/* Modal for moving products */}
      <MoveProductsModal
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        selectedProducts={filteredProducts.filter(p => selectedProducts.has(p.id))}
        groups={groups}
        onProductsMoved={handleProductsMoved}
      />
    </div>
  );
}
