import { ProductForm } from '@/components/product-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Создание нового товара - FactoryFlow ERP',
  description: 'Создание нового товара или услуги',
}

export default function NewProductPage() {
  return (
    <div className="container mx-auto p-6">
      <ProductForm mode="create" />
    </div>
  )
}