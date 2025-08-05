import { UniversalCalculator } from '@/components/universal-calculator'

export default function CalculatorPage() {
  return (
    <main className="flex-1">
      <UniversalCalculator />
    </main>
  )
}

export const metadata = {
  title: 'Универсальный калькулятор заказов',
  description: 'Расчет стоимости заказов с учетом материалов, работ и накладных расходов'
}
