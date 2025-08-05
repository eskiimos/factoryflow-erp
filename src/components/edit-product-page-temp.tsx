'use client'

import React from 'react'

interface EditProductPageProps {
  productId: string
}

export function EditProductPage({ productId }: EditProductPageProps) {
  return (
    <div className="p-4">
      <h1>Редактирование товара {productId}</h1>
      <p>Революционная система ценообразования временно недоступна</p>
      <p>Идет отладка компонента...</p>
    </div>
  )
}

export default EditProductPage
