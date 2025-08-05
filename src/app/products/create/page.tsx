'use client'

import { ProductForm } from '@/components/product-form'

export default function CreateProduct() {
  return (
    <div className="container mx-auto p-6">
      <ProductForm mode="create" />
    </div>
  )
}
