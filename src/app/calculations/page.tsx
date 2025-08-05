import { Metadata } from 'next'
import { CalculatorMain } from '@/components/calculator/calculator-main'

export const metadata: Metadata = {
  title: 'Калькулятор - FactoryFlow ERP',
  description: 'Универсальный калькулятор для расчета стоимости изделий и услуг',
}

export default function Page() {
  return <CalculatorMain />
}
