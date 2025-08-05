'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, ProductGroup } from '@/lib/types';
import { ProductsTable } from '@/components/products-table';
import ProductGroupDialog from '@/components/product-group-dialog';

function ProductsPageStep1() {
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Товары - Шаг 3</h1>
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Товары</TabsTrigger>
          <TabsTrigger value="groups">Группы</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Товары</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle>Группы товаров</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setGroupDialogOpen(true)}>
                Создать группу
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProductGroupDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        onSuccess={() => {
          setGroupDialogOpen(false);
        }}
      />
    </div>
  );
}

export default ProductsPageStep1;
