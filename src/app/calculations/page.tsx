import { Metadata } from 'next'
import { CalculatorMain } from '@/components/calculator/calculator-main'

export const metadata: Metadata = {
  title: 'Калькулятор - FactoryFlow ERP',
  description: 'Универсальный калькулятор для расчета стоимости изделий и услуг',
}

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Layers, Ruler, Settings, Package } from 'lucide-react';

export default function Page() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Калькуляторы</h1>
        <p className="text-muted-foreground">Выберите тип калькулятора для расчета стоимости</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Calculator className="h-8 w-8 mb-2 text-blue-600" />
            <CardTitle>Универсальный калькулятор</CardTitle>
            <CardDescription>Расчет стоимости по типам товаров и параметрам</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Позволяет рассчитать стоимость стандартных, сборных и складских товаров 
              с учетом материалов и работ.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/calculations/universal" className="w-full">
              <Button className="w-full">Открыть калькулятор</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <Layers className="h-8 w-8 mb-2 text-blue-600" />
            <CardTitle>Конструктор товаров</CardTitle>
            <CardDescription>Создание модульных товаров</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Инструмент для создания сложных модульных товаров из 
              базовых компонентов с автоматическим расчетом стоимости.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/calculations/constructor" className="w-full">
              <Button className="w-full">Открыть конструктор</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="opacity-50">
            <Settings className="h-8 w-8 mb-2 text-muted-foreground" />
            <CardTitle>Другие калькуляторы</CardTitle>
            <CardDescription>Специализированные калькуляторы (скоро)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Специализированные калькуляторы для разных типов производства.
              Функциональность будет доступна в следующих обновлениях.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled>В разработке</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
