'use client'

import dynamic from 'next/dynamic'

const CreateProductPage = dynamic(() => import('@/components/create-product-page'), {
  loading: () => <div>Загрузка...</div>
})

export default function CreateProduct() {
  return (
    <div className="container mx-auto p-6">
      <CreateProductPage />
    </div>
  )
}
