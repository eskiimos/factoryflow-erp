import { Metadata } from 'next'
import { CalculatorApp } from '@/components/formulas-test/calculator-app'

export const metadata: Metadata = {
  title: 'Калькуляторы и формулы - FactoryFlow ERP',
  description: 'Готовые калькуляторы и конструктор формул для производственных расчетов',
}

export default function FormulasTestPageRoute() {
  return <CalculatorApp />
}
