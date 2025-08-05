"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

type Product = {
  id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
}

type ProductCardProps = {
  product: Product
  onAddToOrder: () => void
}

export function ProductCard({ product, onAddToOrder }: ProductCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {product.image && (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <p className="text-sm text-gray-500">{product.description}</p>
          <div className="font-semibold">от {product.price.toLocaleString()} ₽</div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onAddToOrder}>
          Добавить в заказ
        </Button>
      </CardFooter>
    </Card>
  )
}
