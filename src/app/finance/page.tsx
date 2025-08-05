import { Metadata } from 'next'
import { FinancePageNew } from '@/components/finance/finance-page-new'

export const metadata: Metadata = {
  title: 'Финансовое планирование - FactoryFlow ERP',
  description: 'Управление финансовым планированием, прогноз продаж и распределение бюджета',
}

export default function FinancePage() {
  return <FinancePageNew />
}
