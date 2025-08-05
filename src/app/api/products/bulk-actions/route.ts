import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const bulkActionSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'delete', 'updateCategory', 'updatePrices']),
  productIds: z.array(z.string()).min(1, 'Необходимо выбрать хотя бы один товар'),
  data: z.object({
    categoryId: z.string().optional(),
    priceMultiplier: z.number().min(0.1).max(10).optional(),
    margin: z.number().min(0).max(1000).optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, productIds, data } = bulkActionSchema.parse(body)

    let result

    switch (action) {
      case 'activate':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isActive: true },
        })
        break

      case 'deactivate':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isActive: false },
        })
        break

      case 'delete':
        // Мягкое удаление - деактивируем товары
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isActive: false },
        })
        break

      case 'updateCategory':
        if (!data?.categoryId) {
          return NextResponse.json(
            { error: 'ID категории обязателен для обновления категории' },
            { status: 400 }
          )
        }
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { categoryId: data.categoryId },
        })
        break

      case 'updatePrices':
        if (!data?.priceMultiplier && data?.margin === undefined) {
          return NextResponse.json(
            { error: 'Необходимо указать множитель цены или маржу' },
            { status: 400 }
          )
        }

        // Получаем товары для обновления цен
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
        })

        // Обновляем цены для каждого товара
        const updatePromises = products.map(product => {
          let newSellingPrice = product.sellingPrice
          let newMargin = product.margin

          if (data?.priceMultiplier) {
            newSellingPrice = product.sellingPrice * data.priceMultiplier
          }

          if (data?.margin !== undefined) {
            newMargin = data.margin
            // Пересчитываем цену на основе новой маржи
            if (product.totalCost > 0) {
              newSellingPrice = product.totalCost * (1 + data.margin / 100)
            }
          }

          return prisma.product.update({
            where: { id: product.id },
            data: {
              sellingPrice: newSellingPrice,
              margin: newMargin,
            },
          })
        })

        await Promise.all(updatePromises)
        result = { count: products.length }
        break

      default:
        return NextResponse.json(
          { error: 'Неизвестное действие' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Действие "${action}" выполнено для ${result.count} товаров`,
      affectedCount: result.count,
    })
  } catch (error) {
    console.error('Error performing bulk action:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Ошибка при выполнении массового действия' },
      { status: 500 }
    )
  }
}
