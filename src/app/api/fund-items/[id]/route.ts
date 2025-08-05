import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/fund-items/[id] - удалить элемент фонда
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id

    // Получаем элемент перед удалением
    const item = await prisma.fundCategoryItem.findUnique({
      where: { id: itemId },
      include: {
        category: {
          include: {
            fund: true
          }
        }
      }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Элемент фонда не найден' },
        { status: 404 }
      )
    }

    // Удаляем элемент
    await prisma.fundCategoryItem.delete({
      where: { id: itemId }
    })

    // Пересчитываем сумму категории
    const remainingItems = await prisma.fundCategoryItem.findMany({
      where: { categoryId: item.categoryId }
    })
    
    const categoryTotal = remainingItems.reduce((sum, remainingItem) => sum + remainingItem.amount, 0)
    
    await prisma.fundCategory.update({
      where: { id: item.categoryId },
      data: { actualAmount: categoryTotal }
    })

    // Пересчитываем общий фонд
    const fund = await prisma.fund.findUnique({
      where: { id: item.category.fundId },
      include: {
        categories: {
          include: {
            items: true
          }
        }
      }
    })

    if (fund) {
      const totalAllocated = fund.categories.reduce((sum, cat) => {
        return sum + cat.items.reduce((itemSum, fundItem) => itemSum + fundItem.amount, 0)
      }, 0)

      await prisma.fund.update({
        where: { id: fund.id },
        data: {
          allocatedAmount: totalAllocated,
          remainingAmount: fund.totalAmount - totalAllocated
        }
      })
    }

    return NextResponse.json({ 
      message: 'Элемент фонда успешно удален',
      deletedItem: {
        id: item.id,
        name: item.name,
        amount: item.amount
      }
    })
  } catch (error) {
    console.error('Ошибка при удалении элемента фонда:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// PUT /api/fund-items/[id] - обновить элемент фонда
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id
    const body = await request.json()
    const { name, itemType, amount, description, currency } = body

    // Проверяем, что элемент существует
    const existingItem = await prisma.fundCategoryItem.findUnique({
      where: { id: itemId },
      include: {
        category: {
          include: {
            fund: true
          }
        }
      }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Элемент фонда не найден' },
        { status: 404 }
      )
    }

    // Обновляем элемент
    const updatedItem = await prisma.fundCategoryItem.update({
      where: { id: itemId },
      data: {
        ...(name && { name }),
        ...(itemType && { itemType }),
        ...(amount !== undefined && { amount: parseFloat(amount.toString()) }),
        ...(description !== undefined && { description }),
        ...(currency && { currency })
      }
    })

    // Пересчитываем сумму категории
    const categoryItems = await prisma.fundCategoryItem.findMany({
      where: { categoryId: existingItem.categoryId }
    })
    
    const categoryTotal = categoryItems.reduce((sum, item) => sum + item.amount, 0)
    
    await prisma.fundCategory.update({
      where: { id: existingItem.categoryId },
      data: { actualAmount: categoryTotal }
    })

    // Пересчитываем общий фонд
    const fund = await prisma.fund.findUnique({
      where: { id: existingItem.category.fundId },
      include: {
        categories: {
          include: {
            items: true
          }
        }
      }
    })

    if (fund) {
      const totalAllocated = fund.categories.reduce((sum, cat) => {
        return sum + cat.items.reduce((itemSum, item) => itemSum + item.amount, 0)
      }, 0)

      await prisma.fund.update({
        where: { id: fund.id },
        data: {
          allocatedAmount: totalAllocated,
          remainingAmount: fund.totalAmount - totalAllocated
        }
      })
    }

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Ошибка при обновлении элемента фонда:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
