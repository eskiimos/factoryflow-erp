import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Схема валидации для обновления компонента
const UpdateComponentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  componentType: z.enum(['MAIN', 'OPTIONAL', 'VARIANT']).optional(),
  baseQuantity: z.number().positive().optional(),
  quantityFormula: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  thickness: z.number().positive().optional(),
  sortOrder: z.number().optional(),
  parentId: z.string().optional(),
  includeCondition: z.string().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/products/[id]/components/[componentId] - получить компонент
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; componentId: string }> }
) {
  try {
    const { id, componentId } = await params
    const productId = id

    const component = await prisma.productComponent.findFirst({
      where: { 
        id: componentId,
        productId 
      },
      include: {
        parent: {
          select: { id: true, name: true }
        },
        children: {
          select: { id: true, name: true, componentType: true }
        },
        materialUsages: {
          include: {
            materialItem: {
              select: { id: true, name: true, unit: true, price: true }
            }
          }
        },
        workTypeUsages: {
          include: {
            workType: {
              select: { id: true, name: true, unit: true, hourlyRate: true }
            }
          }
        }
      }
    })

    if (!component) {
      return NextResponse.json(
        { error: 'Компонент не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: component
    })
  } catch (error) {
    console.error('Error fetching component:', error)
    return NextResponse.json(
      { error: 'Не удалось загрузить компонент' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id]/components/[componentId] - обновить компонент
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; componentId: string }> }
) {
  try {
    const { id, componentId } = await params
    const productId = id
    const body = await request.json()
    const validatedData = UpdateComponentSchema.parse(body)

    // Проверяем существование компонента
    const existingComponent = await prisma.productComponent.findFirst({
      where: { 
        id: componentId,
        productId 
      }
    })

    if (!existingComponent) {
      return NextResponse.json(
        { error: 'Компонент не найден' },
        { status: 404 }
      )
    }

    // Проверяем родительский компонент если указан
    if (validatedData.parentId) {
      const parentComponent = await prisma.productComponent.findFirst({
        where: { 
          id: validatedData.parentId,
          productId 
        }
      })

      if (!parentComponent) {
        return NextResponse.json(
          { error: 'Родительский компонент не найден' },
          { status: 400 }
        )
      }

      // Проверяем что не создается циклическая зависимость
      if (validatedData.parentId === componentId) {
        return NextResponse.json(
          { error: 'Компонент не может быть родителем самого себя' },
          { status: 400 }
        )
      }
    }

    const component = await prisma.productComponent.update({
      where: { id: componentId },
      data: validatedData,
      include: {
        parent: {
          select: { id: true, name: true }
        },
        children: {
          select: { id: true, name: true, componentType: true }
        },
        materialUsages: {
          include: {
            materialItem: {
              select: { id: true, name: true, unit: true, price: true }
            }
          }
        },
        workTypeUsages: {
          include: {
            workType: {
              select: { id: true, name: true, unit: true, hourlyRate: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: component
    })
  } catch (error) {
    console.error('Error updating component:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Не удалось обновить компонент' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id]/components/[componentId] - удалить компонент
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; componentId: string }> }
) {
  try {
    const { id, componentId } = await params
    const productId = id

    // Проверяем существование компонента
    const existingComponent = await prisma.productComponent.findFirst({
      where: { 
        id: componentId,
        productId 
      },
      include: {
        children: true
      }
    })

    if (!existingComponent) {
      return NextResponse.json(
        { error: 'Компонент не найден' },
        { status: 404 }
      )
    }

    // Проверяем есть ли дочерние компоненты
    if (existingComponent.children.length > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить компонент с дочерними элементами' },
        { status: 400 }
      )
    }

    await prisma.productComponent.delete({
      where: { id: componentId }
    })

    return NextResponse.json({
      success: true,
      message: 'Компонент успешно удален'
    })
  } catch (error) {
    console.error('Error deleting component:', error)
    return NextResponse.json(
      { error: 'Не удалось удалить компонент' },
      { status: 500 }
    )
  }
}
