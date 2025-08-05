'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Package, Folder, Search, Edit, Trash2, MoreHorizontal } from 'lucide-react';
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
      const products = productsData.products || [];
      
      // Загружаем группы товаров
      const groupsResponse = await fetch('/api/product-groups');
      if (!groupsResponse.ok) {
        throw new Error('Failed to fetch product groups');
      }
      
      const groupsData = await groupsResponse.json();
      const groups = groupsData.groups || [];
      
      // Группируем товары
      const ungrouped = products.filter((p: Product) => !p.groupId);
      const groupedItems = groups.map((group: ProductGroup) => ({
        group,
        products: products.filter((p: Product) => p.groupId === group.id)
      }));
      
      setGroupedProducts({
        ungrouped,
        groups: groupedItems
      });
      setProductGroups(groups);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Фильтрация товаров по поисковому запросу
  const filteredGroupedProducts = {
    ungrouped: groupedProducts.ungrouped.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    groups: groupedProducts.groups.map(({ group, products }) => ({
      group,
      products: products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(({ products }) => products.length > 0 || !searchTerm)
  };

  // Фильтрация групп по поисковому запросу
  const filteredGroups = productGroups.filter(group =>
    group.name.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );

  // Действия с группами
  const handleCreateGroup = () => {
    setEditingGroup(null);
    setGroupDialogOpen(true);
  };

  const handleEditGroup = (group: ProductGroup) => {
    setEditingGroup(group);
    setGroupDialogOpen(true);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту группу?')) {
      return;
    }

    try {
      const response = await fetch(`/api/product-groups/${groupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete group');
      }

      toast({
        title: "Успешно",
        description: "Группа товаров удалена"
      });

      fetchData(); // Перезагружаем данные
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить группу",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Товары</h1>
          <p className="text-gray-600">Управление товарами и готовой продукцией</p>
        </div>
        <Button onClick={() => router.push('/products/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Создать товар
        </Button>
      </div>

      {/* Вкладки */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Товары
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Группы товаров
          </TabsTrigger>
        </TabsList>

        {/* Вкладка Товары */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Товары</CardTitle>
                  <CardDescription>Список всех товаров в системе</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Поиск товаров..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ProductsTable
                products={[
                  ...filteredGroupedProducts.ungrouped,
                  ...filteredGroupedProducts.groups.flatMap(({ products }) => products)
                ]}
                selectedProducts={selectedProducts}
                onSelectionChange={setSelectedProducts}
                onProductsChange={fetchData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка Группы товаров */}
        <TabsContent value="groups" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Группы товаров</CardTitle>
                  <CardDescription>Управление категориями товаров</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Поиск групп..."
                      value={groupSearchTerm}
                      onChange={(e) => setGroupSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                  <Button onClick={handleCreateGroup}>
                    <Plus className="h-4 w-4 mr-2" />
                    Создать группу
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredGroups.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredGroups.map((group) => {
                    const groupProducts = groupedProducts.groups.find(g => g.group.id === group.id)?.products || [];
                    return (
                      <Card key={group.id} className="relative">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{group.name}</h3>
                              {group.description && (
                                <p className="text-gray-600 text-sm mb-3">{group.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>Товаров: {groupProducts.length}</span>
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
                                  onClick={() => handleDeleteGroup(group.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Удалить
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
