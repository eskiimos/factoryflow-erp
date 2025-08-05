import { Metadata } from 'next'
import { OrderCalculatorClient } from './calculator-client'

export const metadata: Metadata = {
  title: 'Калькулятор заказа | FactoryFlow ERP',
  description: 'Универсальный модульный калькулятор для формирования заказов с возможностью изменения состава и расчета себестоимости'
}

export default function OrderCalculatorPage() {
  return <OrderCalculatorClient />
}
