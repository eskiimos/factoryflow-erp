import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Схема валидации для создания компонента
const CreateComponentSchema = z.object({
  productId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  componentType: z.enum(['MAIN', 'OPTIONAL', 'VARIANT']).default('MAIN'),
  baseQuantity: z.number().positive().default(1),
  quantityFormula: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  thickness: z.number().positive().optional(),
  sortOrder: z.number().default(0),
  parentId: z.string().optional(),
  includeCondition: z.string().optional(),
})

// Схема валидации для обновления компонента
const UpdateComponentSchema = CreateComponentSchema.partial().omit({ productId: true })

// GET /api/products/[id]/components - получить компоненты продукта
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = id

    const components = await prisma.productComponent.findMany({
      where: { productId },
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
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: components
    })
  } catch (error) {
    console.error('Error fetching product components:', error)
    return NextResponse.json(
      { error: 'Не удалось загрузить компоненты продукта' },
      { status: 500 }
    )
  }
}

// POST /api/products/[id]/components - создать компонент
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = id
    const body = await request.json()
    const validatedData = CreateComponentSchema.parse({ ...body, productId })

    // Проверяем существование продукта
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Продукт не найден' },
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
    }

    const component = await prisma.productComponent.create({
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
    console.error('Error creating component:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Не удалось создать компонент' },
      { status: 500 }
    )
  }
}
