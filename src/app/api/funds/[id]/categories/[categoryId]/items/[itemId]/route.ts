import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/funds/[id]/categories/[categoryId]/items/[itemId] - обновить элемент категории
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string; itemId: string }> }
) {
  try {
    const { categoryId, itemId } = await params
    const data = await request.json()
    
    const {
      name,
      itemType,
      amount,
      currency,
      percentage,
      description,
      isRecurring,
      priority
    } = data

    const item = await prisma.fundCategoryItem.update({
      where: { id: itemId },
      data: {
        name: name || '',
        itemType: itemType || 'OTHER',
        amount: amount || 0,
        currency: currency || 'RUB',
        percentage: percentage || null,
        description: description || '',
        isRecurring: isRecurring || false,
        priority: priority || 1
      }
    })

    // Если это налоговая категория, пересчитываем ее процент
    const category = await prisma.fundCategory.findUnique({
      where: { id: categoryId },
      include: { items: true }
    })

    if (category && category.categoryType === 'taxes') {
      const totalPercentage = category.items.reduce((sum, item) => sum + (item.percentage || 0), 0)
      await prisma.fundCategory.update({
        where: { id: categoryId },
        data: { percentage: parseFloat(totalPercentage.toFixed(2)) }
      })
      console.log(`Updated tax category ${category.name} percentage to ${totalPercentage.toFixed(2)}%`)
    }

    return NextResponse.json(item)
  } catch (error: any) {
    console.error('Error updating item:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении элемента' },
      { status: 500 }
    )
  }
}

// DELETE /api/funds/[id]/categories/[categoryId]/items/[itemId] - удалить элемент
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string; itemId: string }> }
) {
  try {
    const { categoryId, itemId } = await params

    // Получаем информацию о категории перед удалением
    const category = await prisma.fundCategory.findUnique({
      where: { id: categoryId },
      include: { items: true }
    })

    await prisma.fundCategoryItem.delete({
      where: { id: itemId }
    })

    // Если это налоговая категория, пересчитываем ее процент после удаления
    if (category && category.categoryType === 'taxes') {
      const remainingItems = category.items.filter(item => item.id !== itemId)
      const totalPercentage = remainingItems.reduce((sum, item) => sum + (item.percentage || 0), 0)
      await prisma.fundCategory.update({
        where: { id: categoryId },
        data: { percentage: parseFloat(totalPercentage.toFixed(2)) }
      })
      console.log(`Updated tax category ${category.name} percentage to ${totalPercentage.toFixed(2)}% after deletion`)
    }

    return NextResponse.json({ message: 'Элемент удален' })
  } catch (error: any) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении элемента' },
      { status: 500 }
    )
  }
}
