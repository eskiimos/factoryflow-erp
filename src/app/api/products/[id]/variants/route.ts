import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/products/[id]/variants - получить варианты продукта
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const productId = id

    const variants = await prisma.productVariant.findMany({
      where: {
        productId,
        isActive: true
      },
      include: {
        attributes: {
          orderBy: { displayOrder: 'asc' }
        },
        options: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    // Парсим JSON поля
    const parsedVariants = variants.map(variant => ({
      ...variant,
      specifications: variant.specifications ? JSON.parse(variant.specifications) : {},
      dimensions: variant.dimensions ? JSON.parse(variant.dimensions) : {},
      images: variant.images ? JSON.parse(variant.images) : []
    }))

    return NextResponse.json({ variants: parsedVariants })
  } catch (error) {
    console.error('Ошибка при получении вариантов продукта:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении вариантов продукта' },
      { status: 500 }
    )
  }
}

// POST /api/products/[id]/variants - создать новый вариант
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const data = await request.json()

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        name: data.name,
        sku: data.sku,
        description: data.description,
        specifications: data.specifications ? JSON.stringify(data.specifications) : null,
        priceModifier: data.priceModifier || 0,
        priceModifierType: data.priceModifierType || 'PERCENTAGE',
        costModifier: data.costModifier || 0,
        costModifierType: data.costModifierType || 'PERCENTAGE',
        productionTimeModifier: data.productionTimeModifier || 0,
        weight: data.weight,
        dimensions: data.dimensions ? JSON.stringify(data.dimensions) : null,
        images: data.images ? JSON.stringify(data.images) : null,
        stockQuantity: data.stockQuantity || 0,
        minStock: data.minStock || 0,
        maxStock: data.maxStock || 0,
        sortOrder: data.sortOrder || 0
      },
      include: {
        attributes: true,
        options: true
      }
    })

    return NextResponse.json({ variant }, { status: 201 })
  } catch (error) {
    console.error('Ошибка при создании варианта продукта:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании варианта продукта' },
      { status: 500 }
    )
  }
}
