'use client';

import { ProductForm } from '@/components/product-form';

export default function ProductFormDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProductForm mode="create" />
    </div>
  );
}
