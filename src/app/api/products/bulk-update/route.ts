import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Схема валидации для массового обновления
const bulkUpdateSchema = z.object({
  productIds: z.array(z.string()),
  groupId: z.string().nullable(),
  subgroupId: z.string().nullable().optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Валидация данных
    const { productIds, groupId, subgroupId } = bulkUpdateSchema.parse(body)

    if (productIds.length === 0) {
      return NextResponse.json(
        { error: 'Не выбраны товары для обновления' },
        { status: 400 }
      )
    }

    // Обновляем товары
    const updatedProducts = await prisma.product.updateMany({
      where: {
        id: {
          in: productIds
        },
        isActive: true
      },
      data: {
        groupId: groupId,
        subgroupId: subgroupId || null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      updatedCount: updatedProducts.count,
      message: `Обновлено ${updatedProducts.count} товаров`
    })

  } catch (error) {
    console.error('Error in bulk update:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Не удалось обновить товары' },
      { status: 500 }
    )
  }
}
