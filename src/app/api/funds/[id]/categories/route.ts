import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fundId } = await params
    const data = await request.json()

    // Проверяем существование фонда
    const fund = await prisma.fund.findUnique({
      where: { id: fundId }
    })

    if (!fund) {
      return NextResponse.json(
        { error: 'Фонд не найден' },
        { status: 404 }
      )
    }

    // Определяем эмодзи по типу категории
    const getEmojiByType = (categoryType: string) => {
      const emojiMap: { [key: string]: string } = {
        'salary': '💰',
        'benefits': '🎁',
        'taxes': '📊',
        'deductions': '📉',
        'bonus': '🏆',
        'marketing': '📢',
        'operations': '⚙️',
        'rent': '🏢',
        'utilities': '💡',
        'travel': '✈️',
        'training': '📚',
        'equipment': '🖥️',
        'software': '💻',
        'insurance': '🛡️',
        'legal': '⚖️',
        'consulting': '🤝',
        'materials': '📦',
        'transport': '🚗',
        'food': '🍽️',
        'other': '🔧'
      }
      return emojiMap[categoryType] || '🔧'
    }

    // Создаем новую категорию
    const category = await prisma.fundCategory.create({
      data: {
        fundId: fundId,
        name: data.name,
        categoryType: data.categoryType,
        plannedAmount: data.plannedAmount,
        actualAmount: 0, // Изначально фактическая сумма равна 0
        percentage: 0, // Процент будет пересчитан
        description: data.description || '',
        priority: data.priority || 2, // Средний приоритет по умолчанию
        emoji: getEmojiByType(data.categoryType),
        isActive: true,
      }
    })

    // Пересчитываем проценты для всех категорий фонда
    const allCategories = await prisma.fundCategory.findMany({
      where: { 
        fundId: fundId,
        isActive: true 
      },
      include: {
        items: true
      }
    })

    const totalPlanned = allCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0)

    if (totalPlanned > 0) {
      // Обновляем проценты для всех категорий
      for (const cat of allCategories) {
        let percentage: number
        
        if (cat.categoryType === 'taxes') {
          // Для налоговых категорий процент = сумма процентов элементов
          percentage = parseFloat(cat.items.reduce((sum, item) => sum + (item.percentage || 0), 0).toFixed(2))
          console.log(`Tax category ${cat.name}: calculated percentage from items = ${percentage}%`)
        } else {
          // Для остальных категорий процент = доля от общей суммы
          percentage = parseFloat(((cat.plannedAmount / totalPlanned) * 100).toFixed(2))
        }
        
        await prisma.fundCategory.update({
          where: { id: cat.id },
          data: { percentage }
        })
      }
    }

    // Обновляем общую сумму фонда
    await prisma.fund.update({
      where: { id: fundId },
      data: {
        allocatedAmount: totalPlanned,
        remainingAmount: fund.totalAmount - totalPlanned,
      }
    })

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        percentage: category.categoryType === 'taxes' ? 0 : (totalPlanned > 0 ? parseFloat(((category.plannedAmount / totalPlanned) * 100).toFixed(2)) : 0)
      }
    })

  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании категории' },
      { status: 500 }
    )
  }
}
