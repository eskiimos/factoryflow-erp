import { prisma } from './prisma'

/**
 * Генерирует уникальный SKU для нового товара
 * @param prefix Префикс SKU
 * @returns Уникальный SKU
 */
export async function generateSKU(prefix: string = 'FF'): Promise<string> {
  // Получаем текущий максимальный SKU с этим префиксом
  const latestProduct = await prisma.product.findFirst({
    where: {
      sku: {
        startsWith: prefix
      }
    },
    orderBy: {
      sku: 'desc'
    }
  })

  // Базовый числовой идентификатор
  let nextId = 1

  if (latestProduct) {
    // Если есть товары с таким префиксом, извлекаем числовую часть
    const numericPart = latestProduct.sku.replace(prefix, '')
    const currentId = parseInt(numericPart, 10)
    
    if (!isNaN(currentId)) {
      nextId = currentId + 1
    }
  }

  // Форматируем числовую часть с ведущими нулями (например, 00001)
  const paddedId = nextId.toString().padStart(5, '0')
  
  return `${prefix}${paddedId}`
}
