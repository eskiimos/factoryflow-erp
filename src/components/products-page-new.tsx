'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPIWidget } from '@/components/ui/kpi-widget';
import { ProductsTable } from '@/components/products-table';
import { ProductForm } from '@/components/product-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { Package, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  totalValue: number;
  lowStockProducts: number;
  averageMargin: number;
  topSellingProduct: string;
}

interface ProductFormData {
  name: string;
  description: string;
  sku: string;
  unit: string;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  sellingPrice: number;
  margin: number;
  currency: string;
  productionTime: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  tags: string;
  specifications: string;
  images: string;
  isActive: boolean;
  categoryId: string;
}

export function ProductsPage() {
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalValue: 0,
    lowStockProducts: 0,
    averageMargin: 0,
    topSellingProduct: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch product statistics
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/products/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching product stats:', error);
      // Set default stats if API fails
      setStats({
        totalProducts: 0,
        activeProducts: 0,
        totalValue: 0,
        lowStockProducts: 0,
        averageMargin: 0,
        topSellingProduct: 'N/A',
      });
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleProductSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);
      
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingProduct ? 'update' : 'create'} product`);
      }

      toast({
        variant: 'success',
        title: editingProduct ? 'Product updated' : 'Product created',
        description: `${data.name} has been ${editingProduct ? 'updated' : 'created'} successfully`,
      });

      setShowForm(false);
      setEditingProduct(null);
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error submitting product:', error);
      toast({
        variant: 'error',
        title: 'Error',
        description: `Failed to ${editingProduct ? 'update' : 'create'} product`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleProductDelete = (product: Product) => {
    fetchStats(); // Refresh stats after deletion
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-600">Manage your product catalog and specifications</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIWidget
          title="Total Products"
          value={stats.totalProducts.toString()}
          icon={Package}
          trend={{
            value: stats.activeProducts,
            label: "active"
          }}
        />
        <KPIWidget
          title="Total Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          icon={DollarSign}
          description="Inventory value"
        />
        <KPIWidget
          title="Average Margin"
          value={`${stats.averageMargin.toFixed(1)}%`}
          icon={TrendingUp}
          description="Profitability"
        />
        <KPIWidget
          title="Low Stock Alert"
          value={stats.lowStockProducts.toString()}
          icon={AlertTriangle}
          description="Items below minimum"
        />
      </div>

      {/* Products Table */}
      <ProductsTable
        onProductEdit={handleProductEdit}
        onProductDelete={handleProductDelete}
        selectedProducts={selectedProducts}
        onSelectionChange={setSelectedProducts}
      />

      {/* Product Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSubmit={handleProductSubmit}
            onCancel={handleFormCancel}
            loading={loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
