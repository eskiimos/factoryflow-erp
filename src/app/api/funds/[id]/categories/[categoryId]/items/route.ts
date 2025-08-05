import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/funds/[id]/categories/[categoryId]/items - добавить новый элемент
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const { categoryId } = await params
    const data = await request.json()
    
    console.log('Adding item to category:', categoryId, data)
    
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

    if (!name) {
      return NextResponse.json(
        { error: 'Название элемента обязательно' },
        { status: 400 }
      )
    }

    const item = await prisma.fundCategoryItem.create({
      data: {
        categoryId,
        name,
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

    console.log('Item created successfully:', item.id)
    return NextResponse.json(item, { status: 201 })
  } catch (error: any) {
    console.error('Error creating item:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании элемента: ' + error.message },
      { status: 500 }
    )
  }
}
