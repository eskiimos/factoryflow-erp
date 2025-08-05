import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/funds/[id]/recalculate - пересчитать все суммы и проценты фонда
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fundId } = await params

    console.log(`🔄 Recalculating fund ${fundId}...`)

    // Получаем фонд
    const fund = await prisma.fund.findUnique({
      where: { id: fundId },
      include: {
        categories: {
          where: { isActive: true },
          include: { items: true }
        }
      }
    })

    if (!fund) {
      return NextResponse.json(
        { error: 'Фонд не найден' },
        { status: 404 }
      )
    }

    // 1. Пересчитываем проценты и суммы для каждой категории
    let totalPlannedAmount = 0
    
    for (const category of fund.categories) {
      let categoryPercentage: number
      
      if (category.categoryType === 'taxes') {
        // Для налоговых категорий: процент = сумма процентов элементов
        categoryPercentage = parseFloat(
          category.items.reduce((sum, item) => sum + (item.percentage || 0), 0).toFixed(2)
        )
        console.log(`📊 Tax category "${category.name}": ${categoryPercentage}% (from items)`)
      } else {
        // Для остальных категорий процент будет пересчитан после получения общей суммы
        categoryPercentage = 0 // временно
      }

      totalPlannedAmount += category.plannedAmount
      
      // Обновляем категорию (пока без процента для не-налоговых)
      if (category.categoryType === 'taxes') {
        await prisma.fundCategory.update({
          where: { id: category.id },
          data: { percentage: categoryPercentage }
        })
      }
    }

    // 2. Пересчитываем проценты для не-налоговых категорий
    if (totalPlannedAmount > 0) {
      for (const category of fund.categories) {
        if (category.categoryType !== 'taxes') {
          const categoryPercentage = parseFloat(
            ((category.plannedAmount / totalPlannedAmount) * 100).toFixed(2)
          )
          
          await prisma.fundCategory.update({
            where: { id: category.id },
            data: { percentage: categoryPercentage }
          })
          
          console.log(`💰 Category "${category.name}": ${categoryPercentage}% (${category.plannedAmount}/${totalPlannedAmount})`)
        }
      }
    }

    // 3. Обновляем суммы фонда
    const allocatedAmount = totalPlannedAmount
    const remainingAmount = fund.totalAmount - allocatedAmount

    await prisma.fund.update({
      where: { id: fundId },
      data: {
        allocatedAmount: allocatedAmount,
        remainingAmount: remainingAmount
      }
    })

    console.log(`✅ Fund recalculated:
      - Total: ${fund.totalAmount}
      - Allocated: ${allocatedAmount} 
      - Remaining: ${remainingAmount}
      - Categories: ${fund.categories.length}`)

    return NextResponse.json({
      success: true,
      message: 'Пересчет завершен',
      data: {
        totalAmount: fund.totalAmount,
        allocatedAmount: allocatedAmount,
        remainingAmount: remainingAmount,
        categoriesCount: fund.categories.length
      }
    })

  } catch (error) {
    console.error('❌ Error recalculating fund:', error)
    return NextResponse.json(
      { error: 'Ошибка при пересчете фонда' },
      { status: 500 }
    )
  }
}
