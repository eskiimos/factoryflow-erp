import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/fund-items - создать новый элемент фонда
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryId, name, itemType, amount, description, currency = 'RUB' } = body

    // Валидация данных
    if (!categoryId || !name || !itemType || amount === undefined) {
      return NextResponse.json(
        { error: 'Поля categoryId, name, itemType и amount обязательны' },
        { status: 400 }
      )
    }

    // Проверяем, что категория существует
    const category = await prisma.fundCategory.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Категория фонда не найдена' },
        { status: 404 }
      )
    }

    // Создаем новый элемент фонда
    const newItem = await prisma.fundCategoryItem.create({
      data: {
        categoryId,
        name,
        itemType,
        amount: parseFloat(amount.toString()),
        description,
        currency
      }
    })

    // Пересчитываем общую сумму категории
    const categoryItems = await prisma.fundCategoryItem.findMany({
      where: { categoryId }
    })
    
    const categoryTotal = categoryItems.reduce((sum, item) => sum + item.amount, 0)
    
    await prisma.fundCategory.update({
      where: { id: categoryId },
      data: { actualAmount: categoryTotal }
    })

    // Обновляем общий фонд
    const fund = await prisma.fund.findUnique({
      where: { id: category.fundId },
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

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Ошибка при создании элемента фонда:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// GET /api/fund-items - получить элементы фонда
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const fundId = searchParams.get('fundId')

    let whereClause: any = {}

    if (categoryId) {
      whereClause.categoryId = categoryId
    } else if (fundId) {
      whereClause.category = {
        fundId: fundId
      }
    }

    const items = await prisma.fundCategoryItem.findMany({
      where: whereClause,
      include: {
        category: {
          include: {
            fund: true
          }
        }
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Рассчитываем проценты относительно прогнозируемой прибыли
    const processedItems = items.map(item => {
      const fund = item.category.fund
      let percentage = 0
      
      // Предполагаем прогнозируемую прибыль как 58.58% (как на скриншоте)
      // В реальности это должно браться из системы планирования
      const projectedProfit = fund.totalAmount * 0.5858 // 58.58%
      
      if (projectedProfit > 0) {
        percentage = (item.amount / projectedProfit) * 100
      }
      
      return {
        ...item,
        percentage: Math.round(percentage * 100) / 100 // Округляем до 2 знаков
      }
    })

    return NextResponse.json(processedItems)
  } catch (error) {
    console.error('Ошибка при получении элементов фонда:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
