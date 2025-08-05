'use client'

import { ProductConstructor } from '@/components/product-constructor'
import { ToastProvider } from '@/components/ui/toast'

export default function ProductConstructorPage() {
  return (
    <ToastProvider>
      <ProductConstructor
        onComplete={(productId) => {
          console.log('Product created:', productId)
          // Перенаправляем на страницу редактирования созданного продукта
          window.location.href = `/products/edit/${productId}`
        }}
        onCancel={() => {
          // Возвращаемся к списку товаров
          window.location.href = '/products'
        }}
      />
    </ToastProvider>
  )
}
