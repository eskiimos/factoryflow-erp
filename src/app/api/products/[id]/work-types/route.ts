import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params
    const body = await request.json()
    const { workTypeId, quantity, sequence } = body

    // Получаем информацию о виде работ
    const workType = await prisma.workType.findUnique({
      where: { id: workTypeId }
    })

    if (!workType) {
      return NextResponse.json(
        { error: 'Work type not found' },
        { status: 404 }
      )
    }

    // Получаем следующую позицию в последовательности, если не указана
    let finalSequence = sequence
    if (!finalSequence) {
      const maxSequence = await prisma.productWorkTypeUsage.aggregate({
        where: { productId },
        _max: { sequence: true }
      })
      finalSequence = (maxSequence._max.sequence || 0) + 1
    }

    // Создаем связь вида работ с товаром
    const workTypeUsage = await prisma.productWorkTypeUsage.create({
      data: {
        productId,
        workTypeId,
        quantity,
        cost: workType.hourlyRate * quantity,
        sequence: finalSequence,
      },
      include: {
        workType: {
          include: {
            department: true
          }
        }
      }
    })

    // Пересчитываем общую стоимость работ товара
    const allWorkTypeUsages = await prisma.productWorkTypeUsage.findMany({
      where: { productId }
    })

    const totalLaborCost = allWorkTypeUsages.reduce((sum, usage) => sum + usage.cost, 0)
    const totalProductionTime = allWorkTypeUsages.reduce((sum, usage) => sum + usage.quantity, 0)

    // Обновляем товар
    await prisma.product.update({
      where: { id: productId },
      data: {
        laborCost: totalLaborCost,
        productionTime: totalProductionTime,
        totalCost: {
          increment: workType.hourlyRate * quantity
        }
      }
    })

    return NextResponse.json(workTypeUsage, { status: 201 })
  } catch (error) {
    console.error('Error adding work type to product:', error)
    return NextResponse.json(
      { error: 'Failed to add work type to product' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params
    const { searchParams } = new URL(request.url)
    const workTypeUsageId = searchParams.get('usageId')

    if (!workTypeUsageId) {
      return NextResponse.json(
        { error: 'Work type usage ID is required' },
        { status: 400 }
      )
    }

    // Получаем информацию о работе перед удалением
    const workTypeUsage = await prisma.productWorkTypeUsage.findUnique({
      where: { id: workTypeUsageId }
    })

    if (!workTypeUsage) {
      return NextResponse.json(
        { error: 'Work type usage not found' },
        { status: 404 }
      )
    }

    // Удаляем связь
    await prisma.productWorkTypeUsage.delete({
      where: { id: workTypeUsageId }
    })

    // Пересчитываем общую стоимость работ товара
    const remainingWorkTypeUsages = await prisma.productWorkTypeUsage.findMany({
      where: { productId }
    })

    const totalLaborCost = remainingWorkTypeUsages.reduce((sum, usage) => sum + usage.cost, 0)
    const totalProductionTime = remainingWorkTypeUsages.reduce((sum, usage) => sum + usage.quantity, 0)

    // Обновляем товар
    await prisma.product.update({
      where: { id: productId },
      data: {
        laborCost: totalLaborCost,
        productionTime: totalProductionTime,
        totalCost: {
          decrement: workTypeUsage.cost
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing work type from product:', error)
    return NextResponse.json(
      { error: 'Failed to remove work type from product' },
      { status: 500 }
    )
  }
}
