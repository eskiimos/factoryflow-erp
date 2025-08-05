import { Metadata } from 'next'
import { CalculatorMain } from '@/components/calculator/calculator-main'

export const metadata: Metadata = {
  title: 'Конструктор товаров - FactoryFlow ERP',
  description: 'Создание модульных товаров с помощью конструктора',
}

export default function Page() {
  return <CalculatorMain />
}
