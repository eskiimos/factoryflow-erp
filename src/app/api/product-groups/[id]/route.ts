import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ProductGroupSchema = z.object({
  name: z.string().min(1, 'Название группы обязательно'),
  description: z.string().optional(),
})

// GET /api/product-groups/[id] - получить группу по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const group = await prisma.productGroup.findUnique({
      where: { id },
      include: {
        subgroups: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        },
        products: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: {
            subgroups: { where: { isActive: true } },
            products: { where: { isActive: true } }
          }
        }
      },
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Группа товаров не найдена' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: group,
      success: true,
    })
  } catch (error) {
    console.error('Error fetching product group:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении группы товаров' },
      { status: 500 }
    )
  }
}

// PUT /api/product-groups/[id] - обновить группу
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = ProductGroupSchema.parse(body)

    // Проверяем существование группы
    const existingGroup = await prisma.productGroup.findUnique({
      where: { id },
    })

    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Группа товаров не найдена' },
        { status: 404 }
      )
    }

    // Проверяем уникальность названия (исключая текущую группу)
    const nameConflict = await prisma.productGroup.findFirst({
      where: {
        name: validatedData.name.trim(),
        id: { not: id },
        isActive: true,
      },
    })

    if (nameConflict) {
      return NextResponse.json(
        { error: 'Группа с таким названием уже существует' },
        { status: 400 }
      )
    }

    const group = await prisma.productGroup.update({
      where: { id },
      data: {
        name: validatedData.name.trim(),
        description: validatedData.description?.trim() || null,
      },
      include: {
        _count: {
          select: {
            subgroups: { where: { isActive: true } },
            products: { where: { isActive: true } }
          }
        }
      }
    })

    return NextResponse.json({
      data: group,
      success: true,
      message: 'Группа товаров обновлена успешно',
    })
  } catch (error) {
    console.error('Error updating product group:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Ошибка при обновлении группы товаров' },
      { status: 500 }
    )
  }
}

// DELETE /api/product-groups/[id] - удалить группу (мягкое удаление)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Проверяем существование группы
    const existingGroup = await prisma.productGroup.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: { where: { isActive: true } }
          }
        }
      }
    })

    if (!existingGroup) {
      return NextResponse.json(
        { success: false, message: 'Группа товаров не найдена' },
        { status: 404 }
      )
    }

    // Отвязываем все товары от группы (убираем groupId)
    await prisma.product.updateMany({
      where: { 
        groupId: id,
        isActive: true 
      },
      data: { 
        groupId: null 
      }
    });

    // Отвязываем все подгруппы от группы (деактивируем их)
    await prisma.productSubgroup.updateMany({
      where: { 
        groupId: id,
        isActive: true 
      },
      data: { 
        isActive: false 
      }
    });

    // Мягкое удаление - деактивируем группу
    const group = await prisma.productGroup.update({
      where: { id },
      data: { isActive: false },
      include: {
        _count: {
          select: {
            subgroups: true,
            products: true
          }
        }
      }
    })

    return NextResponse.json({
      data: group,
      success: true,
      message: `Группа "${existingGroup.name}" удалена. Товары сохранены без группы.`,
    })
  } catch (error) {
    console.error('Error deleting product group:', error)
    return NextResponse.json(
      { success: false, message: 'Ошибка при удалении группы товаров' },
      { status: 500 }
    )
  }
}
