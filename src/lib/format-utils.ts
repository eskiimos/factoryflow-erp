// Утилита для округления числа до указанного количества знаков после запятой
export function roundToDecimals(num: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(num * factor) / factor
}

// Форматирование процента с округлением до 2 знаков
export function formatPercentage(percentage: number, decimals: number = 2): string {
  return `${roundToDecimals(percentage, decimals)}%`
}

// Форматирование валюты
export function formatCurrency(amount: number, currency: string = 'RUB'): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency
  }).format(amount)
}
