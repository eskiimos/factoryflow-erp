import { Metadata } from 'next'
import { OrdersPageClient } from './orders-page-client'

export const metadata: Metadata = {
  title: 'Заказы | FactoryFlow ERP',
  description: 'Управление заказами клиентов - создание, отслеживание, контроль статусов'
}

export default function OrdersPage() {
  return <OrdersPageClient />
}
