'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Package, Folder, Settings, Search, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductsTable } from '@/components/products-table';
import ProductGroupDialog from '@/components/product-group-dialog';
import { Product, ProductGroup } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

interface GroupedProducts {
  ungrouped: Product[];
  groups: Array<{
    group: ProductGroup;
    products: Product[];
  }>;
}

function ProductsPage() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProducts>({
    ungrouped: [],
    groups: []
  });
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Загрузка товаров и групп
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Загружаем все товары
      const productsResponse = await fetch('/api/products?showAll=true');
      if (!productsResponse.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const productsData = await productsResponse.json();
      const products = productsData.data || [];
      
      // Загружаем группы товаров
      const groupsResponse = await fetch('/api/product-groups');
      if (!groupsResponse.ok) {
        throw new Error('Failed to fetch product groups');
      }
      
      const groupsData = await groupsResponse.json();
      const groups = groupsData.data || [];
      
      // Группируем товары
      const ungrouped = products.filter((product: Product) => !product.groupId);
      const groupedByGroupId = products.reduce((acc: Record<string, Product[]>, product: Product) => {
        if (product.groupId) {
          if (!acc[product.groupId]) {
            acc[product.groupId] = [];
          }
          acc[product.groupId].push(product);
        }
        return acc;
      }, {});
      
      const groupedProducts = groups.map((group: ProductGroup) => ({
        group,
        products: groupedByGroupId[group.id] || []
      }));
      
      setGroupedProducts({
        ungrouped,
        groups: groupedProducts
      });
      
      setProductGroups(groups);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить товары и группы',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Получаем все товары для таблицы
  const allProducts = [
    ...groupedProducts.ungrouped,
    ...groupedProducts.groups.flatMap(g => g.products)
  ];

  // Фильтрация товаров по поиску
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return allProducts;
    
    const term = searchTerm.toLowerCase();
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term) ||
      product.group?.name.toLowerCase().includes(term)
    );
  }, [allProducts, searchTerm]);

  // Фильтрация групп по поиску
  const filteredGroups = useMemo(() => {
    if (!groupSearchTerm.trim()) return productGroups;
    
    const term = groupSearchTerm.toLowerCase();
    return productGroups.filter(group => 
      group.name.toLowerCase().includes(term) ||
      group.description?.toLowerCase().includes(term)
    );
  }, [productGroups, groupSearchTerm]);

  // Обработчики для групп
  const handleCreateGroup = () => {
    setEditingGroup(null);
    setGroupDialogOpen(true);
  };

  const handleEditGroup = (group: ProductGroup) => {
    setEditingGroup(group);
    setGroupDialogOpen(true);
  };

  const handleDeleteGroup = async (group: ProductGroup) => {
    const productsCount = groupedProducts.groups.find(g => g.group.id === group.id)?.products.length || 0;
    
    if (productsCount > 0) {
      toast({
        title: 'Нельзя удалить группу',
        description: `В группе "${group.name}" находится ${productsCount} товаров. Сначала переместите товары в другую группу.`,
        variant: 'destructive'
      });
      return;
    }

    if (!confirm(`Вы уверены, что хотите удалить группу "${group.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/product-groups/${group.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при удалении группы');
      }

      toast({
        title: 'Группа удалена',
        description: `Группа "${group.name}" удалена успешно`,
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить группу',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Товары</h1>
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Каталог товаров</h1>
          <p className="text-gray-600">
            Управление товарами и группами товаров
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => router.push('/products/create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить товар
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Товары
            <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
              {allProducts.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Группы товаров
            <span className="ml-1 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
              {productGroups.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Вкладка товаров */}
        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Все товары
                  </CardTitle>
                  <CardDescription>
                    Полный каталог товаров с возможностью фильтрации по группам
                  </CardDescription>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('groups')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Управление группами
                </Button>
              </div>
              
              {/* Поиск товаров */}
              <div className="flex items-center space-x-2 pt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск товаров..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {searchTerm && (
                  <span className="text-sm text-gray-500">
                    Найдено: {filteredProducts.length} из {allProducts.length}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredProducts.length > 0 ? (
                <ProductsTable
                  products={filteredProducts}
                  selectedProducts={selectedProducts}
                  onSelectionChange={setSelectedProducts}
                  onProductsChange={fetchData}
                />
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm ? 'Товары не найдены' : 'Нет товаров'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm 
                      ? `По запросу "${searchTerm}" ничего не найдено`
                      : 'Создайте свой первый товар'
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => router.push('/products/create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить товар
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка групп */}
        <TabsContent value="groups" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    Группы товаров
                  </CardTitle>
                  <CardDescription>
                    Организация товаров по группам и подгруппам
                  </CardDescription>
                </div>
                <Button onClick={handleCreateGroup}>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать группу
                </Button>
              </div>
              
              {/* Поиск групп */}
              <div className="flex items-center space-x-2 pt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск групп..."
                    value={groupSearchTerm}
                    onChange={(e) => setGroupSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {groupSearchTerm && (
                  <span className="text-sm text-gray-500">
                    Найдено: {filteredGroups.length} из {productGroups.length}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredGroups.length > 0 ? (
                <div className="space-y-4">
                  {filteredGroups.map((group) => {
                    const groupProducts = groupedProducts.groups.find(g => g.group.id === group.id)?.products || [];
                    return (
                      <Card key={group.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{group.name}</h3>
                              {group.description && (
                                <p className="text-gray-600 mt-1">{group.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>
                                  <Package className="h-4 w-4 inline mr-1" />
                                  {groupProducts.length} товаров
                                </span>
                                <span>Создана: {new Date(group.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditGroup(group)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Редактировать
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteGroup(group)}
                                  className="text-red-600"
                                  disabled={groupProducts.length > 0}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Удалить
                                  {groupProducts.length > 0 && (
                                    <span className="text-xs text-gray-500 ml-1">
                                      (есть товары)
                                    </span>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Folder className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">
                    {groupSearchTerm ? 'Группы не найдены' : 'Нет групп товаров'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {groupSearchTerm 
                      ? `По запросу "${groupSearchTerm}" ничего не найдено`
                      : 'Создайте группы для организации товаров'
                    }
                  </p>
                  {!groupSearchTerm && (
                    <Button onClick={handleCreateGroup}>
                      <Plus className="h-4 w-4 mr-2" />
                      Создать группу
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Диалог создания/редактирования группы */}
      <ProductGroupDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        group={editingGroup}
        onSuccess={() => {
          fetchData();
          setGroupDialogOpen(false);
          setEditingGroup(null);
        }}
      />
    </div>
  );
}

export default ProductsPage;
