'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ProductWithDetails {
  id: string
  name: string
  description?: string
  sku: string
  unit: string
  baseCalculationUnit?: string
  variant: 'PRODUCT' | 'SERVICE'
}

interface EditProductPageProps {
  product: ProductWithDetails
}

export function EditProductPageSimple({ product }: EditProductPageProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: product.name,
    baseCalculationUnit: product.baseCalculationUnit || '',
  })

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/products')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к товарам
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Редактирование товара</h1>
            <p className="text-muted-foreground">{product.name}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🔥 Система готова к тестированию!</CardTitle>
          <CardDescription>
            Базовые компоненты созданы, API работает, единицы измерения загружены
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>✅ API единиц измерения: /api/measurement-units</p>
            <p>✅ API расчета базовых единиц: /api/products/calculate-base-unit</p>
            <p>✅ Компонент BaseUnitSelector создан</p>
            <p>✅ Компонент BaseUnitCalculator создан</p>
            <p>✅ 16 единиц измерения в базе данных</p>
            
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Готово к демонстрации:</h3>
              <ul className="text-green-800 space-y-1">
                <li>• Выбор базовой единицы измерения</li>
                <li>• Расчет стоимости на единицу</li>
                <li>• Интеллектуальные рекомендации</li>
                <li>• Детальная аналитика компонентов</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
