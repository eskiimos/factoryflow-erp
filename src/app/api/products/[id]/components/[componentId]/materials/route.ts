import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Схема валидации для материала компонента
const ComponentMaterialSchema = z.object({
  materialItemId: z.string(),
  usageFormula: z.string().min(1),
  baseUsage: z.number().default(0),
  wasteFactor: z.number().positive().default(1.0),
  efficiencyFactor: z.number().positive().default(1.0),
  cutWidth: z.number().positive().optional(),
  cutHeight: z.number().positive().optional(),
  canRotate: z.boolean().default(true),
  unit: z.string().default('шт'),
})

// GET /api/products/[id]/components/[componentId]/materials - получить материалы компонента
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; componentId: string }> }
) {
  try {
    const { id, componentId } = await params
    const productId = id

    // Проверяем существование компонента
    const component = await prisma.productComponent.findFirst({
      where: { 
        id: componentId,
        productId 
      }
    })

    if (!component) {
      return NextResponse.json(
        { error: 'Компонент не найден' },
        { status: 404 }
      )
    }

    const materialUsages = await prisma.componentMaterialUsage.findMany({
      where: { componentId },
      include: {
        materialItem: {
          select: { 
            id: true, 
            name: true, 
            unit: true, 
            price: true,
            baseUnit: true,
            calculationUnit: true,
            conversionFactor: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: materialUsages
    })
  } catch (error) {
    console.error('Error fetching component materials:', error)
    return NextResponse.json(
      { error: 'Не удалось загрузить материалы компонента' },
      { status: 500 }
    )
  }
}

// POST /api/products/[id]/components/[componentId]/materials - добавить материал к компоненту
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; componentId: string }> }
) {
  try {
    const { id, componentId } = await params
    const productId = id
    const body = await request.json()
    const validatedData = ComponentMaterialSchema.parse(body)

    // Проверяем существование компонента
    const component = await prisma.productComponent.findFirst({
      where: { 
        id: componentId,
        productId 
      }
    })

    if (!component) {
      return NextResponse.json(
        { error: 'Компонент не найден' },
        { status: 404 }
      )
    }

    // Проверяем существование материала
    const material = await prisma.materialItem.findUnique({
      where: { id: validatedData.materialItemId }
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Материал не найден' },
        { status: 404 }
      )
    }

    // Проверяем что материал еще не добавлен к компоненту
    const existingUsage = await prisma.componentMaterialUsage.findFirst({
      where: {
        componentId,
        materialItemId: validatedData.materialItemId
      }
    })

    if (existingUsage) {
      return NextResponse.json(
        { error: 'Материал уже добавлен к этому компоненту' },
        { status: 400 }
      )
    }

    const materialUsage = await prisma.componentMaterialUsage.create({
      data: {
        componentId,
        ...validatedData
      },
      include: {
        materialItem: {
          select: { 
            id: true, 
            name: true, 
            unit: true, 
            price: true,
            baseUnit: true,
            calculationUnit: true,
            conversionFactor: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: materialUsage
    })
  } catch (error) {
    console.error('Error adding material to component:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Не удалось добавить материал к компоненту' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id]/components/[componentId]/materials/[usageId] - обновить материал компонента
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; componentId: string; usageId: string }> }
) {
  try {
    const { id, componentId, usageId } = await params
    const productId = id
    const body = await request.json()
    const validatedData = ComponentMaterialSchema.partial().omit({ materialItemId: true }).parse(body)

    // Проверяем существование использования материала
    const existingUsage = await prisma.componentMaterialUsage.findFirst({
      where: { 
        id: usageId,
        componentId 
      }
    })

    if (!existingUsage) {
      return NextResponse.json(
        { error: 'Использование материала не найдено' },
        { status: 404 }
      )
    }

    const materialUsage = await prisma.componentMaterialUsage.update({
      where: { id: usageId },
      data: validatedData,
      include: {
        materialItem: {
          select: { 
            id: true, 
            name: true, 
            unit: true, 
            price: true,
            baseUnit: true,
            calculationUnit: true,
            conversionFactor: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: materialUsage
    })
  } catch (error) {
    console.error('Error updating component material:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Не удалось обновить материал компонента' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id]/components/[componentId]/materials/[usageId] - удалить материал компонента
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; componentId: string; usageId: string }> }
) {
  try {
    const { id, componentId, usageId } = await params

    // Проверяем существование использования материала
    const existingUsage = await prisma.componentMaterialUsage.findFirst({
      where: { 
        id: usageId,
        componentId 
      }
    })

    if (!existingUsage) {
      return NextResponse.json(
        { error: 'Использование материала не найдено' },
        { status: 404 }
      )
    }

    await prisma.componentMaterialUsage.delete({
      where: { id: usageId }
    })

    return NextResponse.json({
      success: true,
      message: 'Материал успешно удален из компонента'
    })
  } catch (error) {
    console.error('Error deleting component material:', error)
    return NextResponse.json(
      { error: 'Не удалось удалить материал из компонента' },
      { status: 500 }
    )
  }
}
