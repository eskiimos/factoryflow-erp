import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params
    const body = await request.json()
    const { materialItemId, quantity } = body

    // Получаем цену материала
    const material = await prisma.materialItem.findUnique({
      where: { id: materialItemId }
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      )
    }

    // Создаем связь материала с товаром
    const materialUsage = await prisma.productMaterialUsage.create({
      data: {
        productId,
        materialItemId,
        quantity,
        cost: material.price * quantity,
      },
      include: {
        materialItem: {
          include: {
            category: true
          }
        }
      }
    })

    // Пересчитываем общую стоимость материалов товара
    const allMaterialUsages = await prisma.productMaterialUsage.findMany({
      where: { productId }
    })

    const totalMaterialCost = allMaterialUsages.reduce((sum, usage) => sum + usage.cost, 0)

    // Обновляем товар
    await prisma.product.update({
      where: { id: productId },
      data: {
        materialCost: totalMaterialCost,
        totalCost: {
          increment: material.price * quantity
        }
      }
    })

    return NextResponse.json(materialUsage, { status: 201 })
  } catch (error) {
    console.error('Error adding material to product:', error)
    return NextResponse.json(
      { error: 'Failed to add material to product' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params
    const { searchParams } = new URL(request.url)
    const materialUsageId = searchParams.get('usageId')

    if (!materialUsageId) {
      return NextResponse.json(
        { error: 'Material usage ID is required' },
        { status: 400 }
      )
    }

    // Получаем информацию о материале перед удалением
    const materialUsage = await prisma.productMaterialUsage.findUnique({
      where: { id: materialUsageId }
    })

    if (!materialUsage) {
      return NextResponse.json(
        { error: 'Material usage not found' },
        { status: 404 }
      )
    }

    // Удаляем связь
    await prisma.productMaterialUsage.delete({
      where: { id: materialUsageId }
    })

    // Пересчитываем общую стоимость материалов товара
    const remainingMaterialUsages = await prisma.productMaterialUsage.findMany({
      where: { productId }
    })

    const totalMaterialCost = remainingMaterialUsages.reduce((sum, usage) => sum + usage.cost, 0)

    // Обновляем товар
    await prisma.product.update({
      where: { id: productId },
      data: {
        materialCost: totalMaterialCost,
        totalCost: {
          decrement: materialUsage.cost
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing material from product:', error)
    return NextResponse.json(
      { error: 'Failed to remove material from product' },
      { status: 500 }
    )
  }
}
